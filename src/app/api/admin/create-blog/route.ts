import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Octokit } from 'octokit';
import sanitizeHtml from 'sanitize-html';
import { htmlToJsx } from 'html-to-jsx-transform';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { cleanBlogMetaTitle, cleanBlogSlugText } from '@/lib/blog-seo';
import {
  generateBlogComponentFromHTML as generateSharedBlogComponentFromHTML,
  generateBlogComponentFromMarkdown as generateSharedBlogComponentFromMarkdown,
  fixUnclosedInlineTags,
} from '@/lib/blog-generator';

function getErrMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
function getErrStatus(e: unknown): number | undefined {
  return (e != null && typeof e === 'object' && 'status' in e) ? (e as { status: number }).status : undefined;
}

// ─── PDF extraction ──────────────────────────────────────────────────────────

async function extractPdfText(contentBuffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule: any = await import('pdf-parse');
  const PDFParseClass = pdfParseModule?.PDFParse ?? pdfParseModule?.default?.PDFParse;

  if (typeof PDFParseClass === 'function') {
    const parser = new PDFParseClass({ data: contentBuffer });
    try {
      const textResult = await parser.getText();
      return textResult?.text ?? '';
    } finally {
      if (typeof parser.destroy === 'function') await parser.destroy();
    }
  }

  const pdfParseFn =
    (typeof pdfParseModule === 'function' && pdfParseModule) ||
    (typeof pdfParseModule?.default === 'function' && pdfParseModule.default) ||
    (typeof pdfParseModule?.default?.default === 'function' && pdfParseModule.default.default) ||
    null;

  if (!pdfParseFn) throw new Error('Could not load PDF parser');
  const pdfData = await pdfParseFn(contentBuffer);
  return pdfData?.text ?? '';
}

// ─── DOCX extraction ─────────────────────────────────────────────────────────

interface ExtractedDocxContent {
  text: string;
  images: Array<{ data: string; contentType: string; index: number }>;
}

async function extractDocxText(contentBuffer: Buffer): Promise<ExtractedDocxContent> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mammothModule: any = await import('mammoth');
  const mammoth = mammothModule?.default ?? mammothModule;
  if (typeof mammoth?.convertToHtml !== 'function') throw new Error('Could not load DOCX parser');

  const extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
  let imageCounter = 0;

  const result = await mammoth.convertToHtml(
    { buffer: contentBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h3:fresh",
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      convertImage: mammoth.images.imgElement((image: any) => {
        const currentIndex = imageCounter++;
        return image.read('base64').then((imageBuffer: string) => {
          extractedImages.push({ data: imageBuffer, contentType: image.contentType || 'image/png', index: currentIndex });
          return { src: `IMAGE_PLACEHOLDER_${currentIndex}` };
        });
      })
    }
  );

  // Keep as HTML — feed directly into generateBlogComponentFromHTML.
  // Do NOT convert to markdown (avoids ##, **, - artifacts being rendered as plain text).
  let html = result.value;

  // Replace inline image tags with our [IMAGE_N] marker (picked up by the HTML→JSX converter)
  html = html.replace(/<img[^>]*src="IMAGE_PLACEHOLDER_(\d+)"[^>]*\/?>/gi, '[IMAGE_$1]');

  return { text: html, images: extractedImages };
}

// ─── JSX sanitisation ────────────────────────────────────────────────────────

// ─── Pre-process raw HTML before JSX conversion ───────────────────────────────
// Runs sanitize-html (strips dangerous/invalid elements) then html-to-jsx-transform
// (fixes class→className, tabindex→tabIndex, for→htmlFor, inline style strings→objects, etc.)
// This runs BEFORE sanitizeFinalComponent so the regex passes work on already-clean input.
function preProcessHtml(html: string): string {
  // Step 1: sanitize-html — allow all safe blog content tags, strip everything else
  const clean = sanitizeHtml(html, {
    allowedTags: [
      'h1','h2','h3','h4','h5','h6',
      'p','br','hr',
      'strong','em','b','i','s','del','ins','mark','sub','sup',
      'ul','ol','li',
      'blockquote','pre','code',
      'a','img',
      'figure','figcaption',
      'table','thead','tbody','tfoot','tr','th','td','caption',
      'div','span',
    ],
    allowedAttributes: {
      'a': ['href','target','rel'],
      'img': ['src','alt','width','height'],
      'th': ['colspan','rowspan','scope'],
      'td': ['colspan','rowspan'],
      'table': ['summary'],
      '*': ['class','id'],
    },
    // Strip style= (we never want inline styles)
    allowedStyles: {},
    // Don't encode entities — we handle that downstream
    textFilter: (text) => text,
  });

  // Step 2: html-to-jsx-transform — converts class→className, tabindex→tabIndex, etc.
  try {
    return htmlToJsx(clean);
  } catch {
    // If transform fails (e.g. severely malformed input), return the sanitize-html output
    return clean;
  }
}

function sanitizeFinalComponent(componentCode: string): string {
  let s = componentCode;

  // ── Attribute fixes ──────────────────────────────────────────────────────
  // Fix lowercase classname= → className= (copy-paste from HTML editors)
  s = s.replace(/\bclassname\s*=/gi, 'className=');
  // Strip data-* attributes (LinkedIn/Word copy-paste artifacts)
  s = s.replace(/\s+data-[a-z][a-z0-9-]*="[^"]*"/gi, '');
  s = s.replace(/\s+data-[a-z][a-z0-9-]*='[^']*'/gi, '');
  // Strip aria-* attributes from content tags (not needed in article content)
  s = s.replace(/\s+aria-[a-z][a-z0-9-]*="[^"]*"/gi, '');
  s = s.replace(/\s+aria-[a-z][a-z0-9-]*(=[^\s>]+)?/gi, '');

  // ── Remove SVG elements entirely (always copy-paste junk in blog content) ──
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  // Strip orphaned SVG child elements if svg tags were already stripped
  s = s.replace(/<\/?(use|path|circle|rect|line|polyline|polygon|ellipse|g|defs|symbol|mask|clipPath|linearGradient|radialGradient|stop|tspan|textPath)[^>]*>/gi, '');

  // ── Fix <a> tags with no href — extract text content only ───────────────
  // Covers: <a>text</a>, <a name="x">text</a>, <a id="x">text</a>
  // Keeps: <a href="...">text</a> (has a real href value)
  s = s.replace(/<a(\s[^>]*)?>([^<]*)<\/a>/gi, (match, attrs, inner) => {
    if (attrs && /\bhref\s*=\s*["'][^"']+["']/i.test(attrs)) return match; // valid link — keep
    const text = inner.trim();
    if (/^https?:\/\//.test(text)) return text; // bare URL as text
    return text || '';
  });

  // ── Remove unsafe/unsupported HTML elements ──────────────────────────────
  s = s.replace(/<\/?font[^>]*>/gi, '');
  s = s.replace(/<\/?center[^>]*>/gi, '');
  s = s.replace(/<\/?marquee[^>]*>/gi, '');
  s = s.replace(/<\/?blink[^>]*>/gi, '');
  s = s.replace(/<\/?u[^a-zA-Z][^>]*>/gi, '');  // <u> tags (underline — not valid JSX semantic)
  s = s.replace(/<\/?u>/gi, '');
  // Strip <script>, <style>, <iframe>, <object>, <embed> — never valid in JSX content
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  s = s.replace(/<(object|embed|form|input|button|select|textarea|meta|link)[^>]*\/?>/gi, '');

  // ── Fix self-closing void elements for JSX ────────────────────────────────
  s = s.replace(/<br(?!\s*\/>)>/gi, '<br />');
  s = s.replace(/<hr(?!\s*\/>)([^>]*)>/gi, '<hr$1 />');
  s = s.replace(/<img([^>]*[^/])>/gi, '<img$1 />');

  // ── Fix incorrectly self-closed non-void elements ─────────────────────────
  s = s.replace(/<(li|p|div|span|strong|em|a|h[1-6])([^>]*)\s*\/>/gi, '<$1$2></$1>');

  // ── Remove nested lists (flatten one level) ────────────────────────────────
  s = s.replace(/<ul[^>]*>\s*<ul>/gi, '<ul>');
  s = s.replace(/<\/ul>\s*<\/ul>/gi, '</ul>');
  s = s.replace(/<ol[^>]*>\s*<ol>/gi, '<ol>');
  s = s.replace(/<\/ol>\s*<\/ol>/gi, '</ol>');

  // ── Remove block elements incorrectly wrapped in <p> ──────────────────────
  s = s.replace(/<p>(\s*<(?:div|ul|ol|h[1-6]|blockquote)[^>]*>[\s\S]*?<\/(?:div|ul|ol|h[1-6]|blockquote)>\s*)<\/p>/gi, '$1');

  // ── Remove <br /> directly inside list containers ─────────────────────────
  s = s.replace(/(<(?:ul|ol)[^>]*>)\s*<br\s*\/>\s*/gi, '$1');
  s = s.replace(/\s*<br\s*\/>\s*(<\/(?:ul|ol)>)/gi, '$1');

  // ── Remove empty elements ─────────────────────────────────────────────────
  s = s.replace(/<a[^>]*>\s*<\/a>/gi, '');
  s = s.replace(/<strong>\s*<\/strong>/gi, '');
  s = s.replace(/<em>\s*<\/em>/gi, '');
  s = s.replace(/<p>\s*<\/p>/gi, '');
  s = s.replace(/<h[1-6]>\s*(&nbsp;|\s)*\s*<\/h[1-6]>/gi, '');

  // ── Remove p tags containing only whitespace-only <strong> tags ──────────
  // e.g. <p><strong> <strong> <strong> </p> (nested unclosed strong junk)
  s = s.replace(/<p>(\s*<strong[^>]*>\s*)+\s*<\/p>/gi, '');

  // ── Fix typo/unknown tags (e.g. <strongr>, <stronga>, <divv>) ────────────
  // Keep only known safe inline/block tags; strip anything that looks like a misspelled tag
  s = s.replace(/<\/?(?:strong[a-z]+|em[a-z]+|h[1-6][a-z]+|div[a-z]+|span[a-z]+|p[a-z]+)[^>]*>/gi, '');

  // ── Remove inline style="..." HTML attributes (convert to nothing) ────────
  s = s.replace(/\s*style="[^"]*"/gi, '');

  // ── Remove inline style={{ }} objects (strip them; CSS handles styling) ───
  s = s.replace(/\s*style=\{\{[^}]*\}\}/g, '');

  // ── Fix bare & not followed by a valid entity ─────────────────────────────
  s = s.replace(/&(?!(amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+|ldquo|rdquo|lsquo|rsquo|mdash|ndash|hellip);)/gi, '&amp;');

  // ── Escape JSX-unsafe characters in text nodes ────────────────────────────
  // ' → &apos;  (react/no-unescaped-entities)
  // { → &#123;  (breaks JSX expression parser)
  // } → &#125;  (breaks JSX expression parser)
  s = s.replace(/>([^<]+)</g, (match, text) => {
    const escaped = text
      .replace(/'/g, '&apos;')
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;');
    return '>' + escaped + '<';
  });

  // ── Remove leftover ** markdown in text nodes ─────────────────────────────
  s = s.replace(/>\s*\*\*\s*</g, '><');
  s = s.replace(/\*\*([^*<>]+)\*\*/g, '<strong>$1</strong>');

  // ── Remove leftover ## markdown headings (as plain text paragraphs) ───────
  s = s.replace(/<p>\s*#{1,6}\s+([^<]+)<\/p>/g, (_, text) => `<h2>${text.trim()}</h2>`);

  // ── Collapse excessive whitespace/blank lines ─────────────────────────────
  s = s.replace(/\n{3,}/g, '\n\n');

  s = fixUnclosedInlineTags(s);

  return s;
}

function escapeForJSX(text: string): string {
  let e = text;
  e = e.replace(/\{/g, '&#123;');
  e = e.replace(/\}/g, '&#125;');

  const tagPlaceholders: string[] = [];
  e = e.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*\s*\/?)>/g,
    (match) => {
      const placeholder = `__TAG_PLACEHOLDER_${tagPlaceholders.length}__`;
      tagPlaceholders.push(match);
      return placeholder;
    }
  );
  e = e.replace(/</g, '&lt;');
  e = e.replace(/>/g, '&gt;');
  tagPlaceholders.forEach((tag, i) => { e = e.replace(`__TAG_PLACEHOLDER_${i}__`, tag); });
  e = e.replace(/`/g, '&#96;');
  e = e.replace(/\$\{/g, '&#36;{');
  e = e.replace(/\$&#123;/g, '&#36;&#123;');
  e = e.replace(/\\(?![nrt"'\\])/g, '&#92;');
  return e;
}

function cleanInlineHTML(html: string): string {
  let t = html;
  t = t.replace(/&nbsp;/g, ' ');
  // Keep &amp; as &amp; — bare & in JSX is invalid. Do NOT decode it.
  // Decode safe display entities only:
  t = t.replace(/&quot;/g, '"');
  t = t.replace(/&#39;/g, "'");
  t = t.replace(/&#x27;/g, "'");
  // Decode numeric entities that are not & < >
  t = t.replace(/&#(\d+);/g, (match, code) => {
    const n = parseInt(code, 10);
    if (n === 38 || n === 60 || n === 62) return match; // keep &amp; &lt; &gt;
    return String.fromCharCode(n);
  });

  const inlineTagPlaceholders: string[] = [];
  t = t.replace(/<a\s+[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });
  t = t.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });
  t = t.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });
  t = t.replace(/<span[^>]*class(?:Name)?=["'][^"']*text-size-(sm|lg|xl)[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });
  t = t.replace(/<span[^>]*class(?:Name)?=["'][^"']*text-color-(slate|navy|teal|emerald|amber|rose|white)[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });
  t = t.replace(/<[^>]+>/g, '');
  inlineTagPlaceholders.forEach((tag, i) => { t = t.replace(`__INLINE_TAG_${i}__`, tag); });
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function processInlineFormatting(text: string): string {
  let p = text;
  p = p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  p = p.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  p = p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  p = p.replace(/<span[^>]*class=["']([^"']*(?:text-size-(?:sm|lg|xl)|text-color-(?:slate|navy|teal|emerald|amber|rose|white))[^"']*)["'][^>]*>/gi, '<span className="$1">');
  return p;
}

function getTextAlignClass(html: string): string {
  const dataMatch = html.match(/data-text-align=["'](left|center|right)["']/i);
  if (dataMatch) return `text-align-${dataMatch[1]}`;
  const classMatch = html.match(/class(?:Name)?=["'][^"']*text-align-(left|center|right)[^"']*["']/i);
  return classMatch ? `text-align-${classMatch[1]}` : '';
}

function getRowHeightClass(html: string): string {
  const dataMatch = html.match(/data-row-height=["'](compact|tall)["']/i);
  if (dataMatch) return `row-height-${dataMatch[1]}`;
  const classMatch = html.match(/class(?:Name)?=["'][^"']*row-height-(compact|tall)[^"']*["']/i);
  return classMatch ? `row-height-${classMatch[1]}` : '';
}

function wrapWithOptionalClass(tag: string, content: string, className?: string): string {
  return className
    ? `      <${tag} className="${className}">${content}</${tag}>`
    : `      <${tag}>${content}</${tag}>`;
}

// ─── HTML → JSX component ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateBlogComponentFromHTML(
  htmlContent: string,
  imageUrls: { [key: string]: string },  // key is img_xxx id
  title: string,
  imageAlt?: string
): string {
  const altText = imageAlt || `Building Approvals Dubai - ${title}`;
  const elements: string[] = [];

  // Preserve image placeholders across preProcessHtml (sanitize-html would strip them)
  const placeholderMap: Record<string, string> = {};
  let placeholderIndex = 0;
  let htmlWithPlaceholders = htmlContent
    .replace(/\[IMAGE:\s*(img_\d+)\]/g, (_, id) => {
      const token = `IMGPH_${placeholderIndex++}_TOKEN`;
      placeholderMap[token] = `[IMAGE: ${id}]`;
      return token;
    })
    .replace(/\[IMAGE_(\d+)\]/g, (_, n) => {
      const token = `IMGPH_${placeholderIndex++}_TOKEN`;
      placeholderMap[token] = `[IMAGE_${n}]`;
      return token;
    });

  // Pre-process: sanitize-html + html-to-jsx-transform (fixes class→className etc.)
  htmlWithPlaceholders = preProcessHtml(htmlWithPlaceholders);

  // Restore image placeholders
  let html = htmlWithPlaceholders;
  for (const [token, original] of Object.entries(placeholderMap)) {
    html = html.replace(new RegExp(token, 'g'), original);
  }

  // Map [IMAGE: img_xxx] → __IMAGE_PLACEHOLDER_img_xxx__ (keeping the id)
  html = html.replace(/\[IMAGE:\s*(img_\d+)\]/g, '__IMAGE_PLACEHOLDER_$1__');
  // Also handle [IMAGE_N] from docx extraction
  html = html.replace(/\[IMAGE_(\d+)\]/g, '__IMAGE_PLACEHOLDER_docx_$1__');

  const blockRegex = /<(table|h[1-6]|p|ul|ol|blockquote|div)[^>]*>[\s\S]*?<\/\1>|__IMAGE_PLACEHOLDER_[^_]+__(?:_[^_]+)*__|<br\s*\/?>/gi;
  const blocks: string[] = [];
  const regex = new RegExp(blockRegex.source, 'gi');
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index).trim();
    if (before) blocks.push(before);
    blocks.push(match[0]);
    lastIndex = regex.lastIndex;
  }
  const remaining = html.slice(lastIndex).trim();
  if (remaining) blocks.push(remaining);

  for (const block of blocks) {
    if (!block.trim()) continue;

    // img_xxx style placeholder (from editor uploads)
    const imgIdMatch = block.match(/__IMAGE_PLACEHOLDER_(img_\d+)__/);
    if (imgIdMatch) {
      const imageUrl = imageUrls[imgIdMatch[1]];
      if (imageUrl) {
        elements.push(`      <figure className="blog-image-figure">
        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />
      </figure>`);
      }
      continue;
    }

    // docx image placeholder
    const docxImgMatch = block.match(/__IMAGE_PLACEHOLDER_docx_(\d+)__/);
    if (docxImgMatch) {
      const imageUrl = imageUrls[`docx_${docxImgMatch[1]}`];
      if (imageUrl) {
        elements.push(`      <figure className="blog-image-figure">
        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />
      </figure>`);
      }
      continue;
    }

    const h1Match = block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) { const c = cleanInlineHTML(h1Match[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('h1', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const h2Match = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) { const c = cleanInlineHTML(h2Match[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('h2', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3Match) { const c = cleanInlineHTML(h3Match[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('h3', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const ulMatch = block.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      const items: string[] = [];
      const listAlignClass = getTextAlignClass(block);
      const liRegex = /<li([^>]*)>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(ulMatch[1])) !== null) {
        const c = cleanInlineHTML(liMatch[2]);
        const liAlignClass = getTextAlignClass(liMatch[1]);
        if (c.trim()) {
          items.push(liAlignClass
            ? `        <li className="${liAlignClass}">${processInlineFormatting(escapeForJSX(c))}</li>`
            : `        <li>${processInlineFormatting(escapeForJSX(c))}</li>`);
        }
      }
      if (items.length > 0) elements.push(listAlignClass ? `      <ul className="${listAlignClass}">\n${items.join('\n')}\n      </ul>` : `      <ul>\n${items.join('\n')}\n      </ul>`);
      continue;
    }

    const olMatch = block.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olMatch) {
      const items: string[] = [];
      const listAlignClass = getTextAlignClass(block);
      const liRegex = /<li([^>]*)>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(olMatch[1])) !== null) {
        const c = cleanInlineHTML(liMatch[2]);
        const liAlignClass = getTextAlignClass(liMatch[1]);
        if (c.trim()) {
          items.push(liAlignClass
            ? `        <li className="${liAlignClass}">${processInlineFormatting(escapeForJSX(c))}</li>`
            : `        <li>${processInlineFormatting(escapeForJSX(c))}</li>`);
        }
      }
      if (items.length > 0) elements.push(listAlignClass ? `      <ol className="${listAlignClass}">\n${items.join('\n')}\n      </ol>` : `      <ol>\n${items.join('\n')}\n      </ol>`);
      continue;
    }

    const bqMatch = block.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bqMatch) { const c = cleanInlineHTML(bqMatch[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('blockquote', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) { const c = cleanInlineHTML(pMatch[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('p', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    // Table block — reconstruct as clean JSX table
    const tableMatch = block.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (tableMatch) {
      const tableInner = tableMatch[1];
      const rows: string[] = [];

      // Extract thead rows
      const theadMatch = tableInner.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      if (theadMatch) {
        const headRowMatch = theadMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
        if (headRowMatch) {
          const thCells: string[] = [];
          const thRegex = /<t[hd]([^>]*)>([\s\S]*?)<\/t[hd]>/gi;
          let cellM;
          while ((cellM = thRegex.exec(headRowMatch[1])) !== null) {
            const c = cleanInlineHTML(cellM[2]);
            const alignClass = getTextAlignClass(cellM[1]);
            thCells.push(alignClass ? `          <th className="${alignClass}">${processInlineFormatting(escapeForJSX(c))}</th>` : `          <th>${processInlineFormatting(escapeForJSX(c))}</th>`);
          }
          if (thCells.length > 0) {
            const rowClass = getRowHeightClass(headRowMatch[0]);
            rows.push(rowClass ? `        <tr className="${rowClass}">\n${thCells.join('\n')}\n        </tr>` : `        <tr>\n${thCells.join('\n')}\n        </tr>`);
          }
        }
      }

      // Extract tbody rows
      const tbodyContent = tableInner.replace(/<thead[^>]*>[\s\S]*?<\/thead>/gi, '').replace(/<tfoot[^>]*>[\s\S]*?<\/tfoot>/gi, '');
      const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let trM;
      const bodyRows: string[] = [];
      while ((trM = trRegex.exec(tbodyContent)) !== null) {
        const tdCells: string[] = [];
        const tdRegex = /<t[hd]([^>]*)>([\s\S]*?)<\/t[hd]>/gi;
        let cellM;
        while ((cellM = tdRegex.exec(trM[1])) !== null) {
          const c = cleanInlineHTML(cellM[2]);
          const alignClass = getTextAlignClass(cellM[1]);
          tdCells.push(alignClass ? `            <td className="${alignClass}">${processInlineFormatting(escapeForJSX(c))}</td>` : `            <td>${processInlineFormatting(escapeForJSX(c))}</td>`);
        }
        if (tdCells.length > 0) {
          const rowClass = getRowHeightClass(trM[0]);
          bodyRows.push(rowClass ? `          <tr className="${rowClass}">\n${tdCells.join('\n')}\n          </tr>` : `          <tr>\n${tdCells.join('\n')}\n          </tr>`);
        }
      }

      const theadJSX = rows.length > 0 ? `        <thead>\n${rows.join('\n')}\n        </thead>` : '';
      const tbodyJSX = bodyRows.length > 0 ? `        <tbody>\n${bodyRows.join('\n')}\n        </tbody>` : '';

      if (theadJSX || tbodyJSX) {
        elements.push(`      <table>\n${theadJSX}${theadJSX && tbodyJSX ? '\n' : ''}${tbodyJSX}\n      </table>`);
      }
      continue;
    }

    const divMatch = block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
    if (divMatch) { const c = cleanInlineHTML(divMatch[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('p', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const plainText = block.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    if (plainText) elements.push(`      <p>${processInlineFormatting(escapeForJSX(plainText))}</p>`);
  }

  const rawComponent = `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${elements.join('\n\n')}

      <div className="cta-box">
        <h3>Ready to Start Your Project?</h3>
        <p>Building Approvals Dubai handles approvals, planning, and project coordination across Dubai.</p>
        <a href="/contact" className="cta-button">Get in Touch</a>
      </div>
    </div>
  );
}
`;
  return sanitizeFinalComponent(rawComponent);
}

// ─── Markdown → JSX component ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateBlogComponentFromMarkdown(
  blogContent: string,
  imageUrls: { [key: string]: string },
  title: string,
  imageAlt?: string
): string {
  const altText = imageAlt || `Building Approvals Dubai - ${title}`;
  const lines = blogContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: string[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listItems = currentList.map(item => `        <li>${processInlineFormatting(escapeForJSX(item))}</li>`).join('\n');
      elements.push(`      <${listTag}>\n${listItems}\n      </${listTag}>`);
      currentList = [];
      listType = null;
    }
  };

  const isBulletPoint = (line: string): string | null => {
    if (/^\d+\.\s+.+\?$/.test(line)) return null;
    const bulletPatterns = [
      /^[•●○◦▪▫■□✓✔→➔➤➢⇒]\s*(.+)$/,
      /^[-–—]\s+(.+)$/,
      /^\*\s+(.+)$/,
      /^\d+\.\s+(.+)$/,
      /^\d+\)\s+(.+)$/,
    ];
    for (const pattern of bulletPatterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isHeading = (line: string): { level: number; text: string } | null => {
    if (/^#{2,6}\s*$/.test(line)) return null;
    if (line.startsWith('### ')) return { level: 3, text: line.substring(4) };
    if (line.startsWith('###') && line.length > 3) return { level: 3, text: line.substring(3).trim() };
    if (line.startsWith('## ')) return { level: 2, text: line.substring(3) };
    if (line.startsWith('##') && line.length > 2 && !line.startsWith('###')) return { level: 2, text: line.substring(2).trim() };
    const faqMatch = line.match(/^\d+\.\s+(.+\?)$/);
    if (faqMatch) return { level: 3, text: faqMatch[1] };
    const boldHeading = line.match(/^\*\*([^*]+)\*\*$/);
    if (boldHeading && boldHeading[1].length < 100 && !boldHeading[1].endsWith('.')) return { level: 2, text: boldHeading[1] };
    if (line.endsWith(':') && line.length < 80 && !line.includes('.')) return { level: 3, text: line };
    return null;
  };

  for (const line of lines) {
    // Docx image: [IMAGE_N]
    const docxImageMatch = line.match(/^\[IMAGE_(\d+)\]$/);
    if (docxImageMatch) {
      const imageUrl = imageUrls[`docx_${docxImageMatch[1]}`];
      if (imageUrl) {
        flushList();
        elements.push(`      <figure className="blog-image-figure">
        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />
      </figure>`);
      }
      continue;
    }

    // Editor image: [IMAGE: img_xxx]
    const editorImageMatch = line.match(/^\[IMAGE:\s*(img_\d+)\]$/);
    if (editorImageMatch) {
      const imageUrl = imageUrls[editorImageMatch[1]];
      if (imageUrl) {
        flushList();
        elements.push(`      <figure className="blog-image-figure">
        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />
      </figure>`);
      }
      continue;
    }

    const bulletContent = isBulletPoint(line);
    if (bulletContent) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      currentList.push(bulletContent);
      continue;
    }

    flushList();

    const heading = isHeading(line);
    if (heading) {
      elements.push(`      <h${heading.level}>${processInlineFormatting(escapeForJSX(heading.text))}</h${heading.level}>`);
      continue;
    }

    if (line.length > 0) {
      elements.push(`      <p>${processInlineFormatting(escapeForJSX(line))}</p>`);
    }
  }

  flushList();

  const rawComponent = `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${elements.join('\n\n')}

      <div className="cta-box">
        <h3>Ready to Start Your Project?</h3>
        <p>Building Approvals Dubai handles approvals, planning, and project coordination across Dubai.</p>
        <a href="/contact" className="cta-button">Get in Touch</a>
      </div>
    </div>
  );
}
`;
  return sanitizeFinalComponent(rawComponent);
}

// ─── Slug uniqueness check ───────────────────────────────────────────────────

async function findAvailableSlug(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let version = 0;
  while (true) {
    const componentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    try {
      await octokit.rest.repos.getContent({ owner, repo, path: componentPath, ref: branch });
      version++;
      slug = `${baseSlug}-${version}`;
    } catch (error: unknown) {
      if (getErrStatus(error) === 404) return slug;
      return baseSlug; // on unknown error, proceed with original
    }
  }
}

// ─── Vercel Blob upload ───────────────────────────────────────────────────────

async function uploadToVercelBlob(data: Buffer, key: string, contentType: string): Promise<string> {
  const { url } = await put(key, data, { access: 'public', contentType });
  return url;
}

// ─── Allowed image MIME types ─────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateImage(file: File, fieldName: string): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return `${fieldName} must be a JPEG, PNG, WebP, GIF, or AVIF image`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `${fieldName} must be smaller than 10 MB (uploaded: ${(file.size / 1024 / 1024).toFixed(1)} MB)`;
  }
  return null;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const title = (formData.get('title') as string || '').trim();
    let slug = (formData.get('slug') as string || '').trim();
    const category = (formData.get('category') as string || '').trim();
    const author = (formData.get('author') as string || 'Building Approvals Dubai').trim();
    const excerpt = (formData.get('excerpt') as string || '').trim();
    const manualSEO = formData.get('manualSEO') === 'true';
    const metaTitle = (formData.get('metaTitle') as string || '').trim();
    const metaDescription = (formData.get('metaDescription') as string || '').trim();
    const keywords = (formData.get('keywords') as string || '').trim();

    const cardImage = formData.get('cardImage') as File | null;
    const coverImage = formData.get('coverImage') as File | null;
    const contentFile = formData.get('contentFile') as File | null;
    const contentType = formData.get('contentType') as string;
    const manualContent = (formData.get('manualContent') as string || '').trim();
    const imageAlt = (formData.get('imageAlt') as string || `Building Approvals Dubai - ${title}`).trim();

    // ── Validate required fields ──────────────────────────────────────────────
    const missing: string[] = [];
    if (!title) missing.push('title');
    if (!slug) missing.push('URL slug');
    if (!cardImage || cardImage.size === 0) missing.push('card image (for blog list)');
    if (!coverImage || coverImage.size === 0) missing.push('cover image (for article header)');
    if (!excerpt) missing.push('excerpt');
    const hasContent = (contentType === 'manual' && manualContent) || (contentFile && contentFile.size > 0);
    if (!hasContent) missing.push('article content');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Validate images ────────────────────────────────────────────────────────
    const cardErr = cardImage ? validateImage(cardImage, 'Card image') : null;
    if (cardErr) return NextResponse.json({ error: cardErr }, { status: 400 });

    const coverErr = coverImage ? validateImage(coverImage, 'Cover image') : null;
    if (coverErr) return NextResponse.json({ error: coverErr }, { status: 400 });

    // ── Validate slug ──────────────────────────────────────────────────────────
    slug = cleanBlogSlugText(slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) {
      return NextResponse.json({ error: 'Slug must contain at least one letter or number' }, { status: 400 });
    }

    // ── Validate content file type ─────────────────────────────────────────────
    if (contentFile && contentFile.size > 0) {
      const fileName = contentFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        return NextResponse.json({ error: 'Only PDF and DOCX content files are supported' }, { status: 400 });
      }
      if (contentFile.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'Content file must be smaller than 20 MB' }, { status: 400 });
      }
    }

    // ── Validate GitHub env vars first (before uploading anything) ─────────────
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub API not configured. Add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to environment variables.' },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    // Verify repo access before uploading images
    try {
      await octokit.rest.repos.get({ owner, repo });
    } catch (repoError: unknown) {
      return NextResponse.json(
        { error: `Cannot access GitHub repository "${owner}/${repo}". Check GITHUB_TOKEN and GITHUB_OWNER/REPO.`, details: getErrMsg(repoError) },
        { status: 500 }
      );
    }

    // ── Resolve slug uniqueness ────────────────────────────────────────────────
    const originalSlug = slug;
    slug = await findAvailableSlug(octokit, owner, repo, branch, slug);
    const slugChanged = slug !== originalSlug;

    const createCategorySlug = (text: string): string =>
      text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/s$/, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '').substring(0, 30);

    const categorySlug = createCategorySlug(category || title.split(' ').slice(0, 3).join(' '));
    const timestamp = Date.now();

    // ── Upload card & cover images ─────────────────────────────────────────────
    const cardImageExt = cardImage!.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cardImageKey = `building-approvals-dubai-${categorySlug}-list-${timestamp}.${cardImageExt}`;
    const cardImageBuffer = Buffer.from(await cardImage!.arrayBuffer());
    const cardImageUrl = await uploadToVercelBlob(cardImageBuffer, cardImageKey, cardImage!.type);

    const coverImageExt = coverImage!.name.split('.').pop()?.toLowerCase() || 'jpg';
    const coverImageKey = `building-approvals-dubai-${categorySlug}-cover-${timestamp}.${coverImageExt}`;
    const coverImageBuffer = Buffer.from(await coverImage!.arrayBuffer());
    const coverImageUrl = await uploadToVercelBlob(coverImageBuffer, coverImageKey, coverImage!.type);

    // ── Parse content ──────────────────────────────────────────────────────────
    let blogContent = '';
    let extractedDocxImages: Array<{ data: string; contentType: string; index: number }> = [];
    let isHTMLContent = false;

    if (contentType === 'manual' && manualContent) {
      blogContent = manualContent;
      isHTMLContent = /<[a-z][\s\S]*>/i.test(manualContent);
    } else if (contentFile && contentFile.size > 0) {
      const contentBuffer = Buffer.from(await contentFile.arrayBuffer());
      const contentFileName = contentFile.name.toLowerCase();
      if (contentFileName.endsWith('.pdf')) {
        blogContent = await extractPdfText(contentBuffer);
        // PDF gives plain text — use markdown path
      } else if (contentFileName.endsWith('.docx')) {
        const docxResult = await extractDocxText(contentBuffer);
        blogContent = docxResult.text;
        extractedDocxImages = docxResult.images;
        // DOCX now returns clean HTML — always use HTML path
        isHTMLContent = true;
      }
    }

    // ── Build imageUrls map: key → URL ────────────────────────────────────────
    // Keys: img_xxx (editor uploads), docx_N (docx extracted images)
    const imageUrls: { [key: string]: string } = {};

    // Handle editor inline content images: contentImage_<index>
    // Each contentImage_<index> corresponds to img_<timestamp> placeholders in content
    // The editor uses [IMAGE: img_xxx] where xxx is the timestamp of addImageToEditor
    const contentImageEntries = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('contentImage_'))
      .sort(([a], [b]) => {
        const ai = parseInt(a.replace('contentImage_', ''), 10);
        const bi = parseInt(b.replace('contentImage_', ''), 10);
        return ai - bi;
      });

    // Find all [IMAGE: img_xxx] placeholders in content (in order of appearance)
    const imgPlaceholderRegex = /\[IMAGE:\s*(img_\d+)\]/g;
    const orderedPlaceholders: string[] = [];
    let pm;
    while ((pm = imgPlaceholderRegex.exec(blogContent)) !== null) {
      if (!orderedPlaceholders.includes(pm[1])) {
        orderedPlaceholders.push(pm[1]);
      }
    }

    // Upload each content image and map it to the correct img_xxx id
    for (let i = 0; i < contentImageEntries.length; i++) {
      const [, file] = contentImageEntries[i];
      const imgFile = file as File;
      if (!imgFile || imgFile.size === 0) continue;

      const imgErr = validateImage(imgFile, `Content image ${i + 1}`);
      if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });

      const imageBuffer = Buffer.from(await imgFile.arrayBuffer());
      const imageExt = imgFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const imageKey = `building-approvals-dubai-${categorySlug}-content-${i + 1}-${timestamp}.${imageExt}`;
      const imageUrl = await uploadToVercelBlob(imageBuffer, imageKey, imgFile.type);

      // Map to the placeholder id at the same position
      const imgId = orderedPlaceholders[i];
      if (imgId) {
        imageUrls[imgId] = imageUrl;
      }
    }

    // Upload docx extracted images
    for (const img of extractedDocxImages) {
      const imageExt = img.contentType.split('/')[1]?.toLowerCase() || 'png';
      const imageKey = `building-approvals-dubai-${categorySlug}-content-${img.index + 1}-${timestamp}.${imageExt}`;
      const imageBuffer = Buffer.from(img.data, 'base64');
      imageUrls[`docx_${img.index}`] = await uploadToVercelBlob(imageBuffer, imageKey, img.contentType);
    }

    // ── Generate blog component ────────────────────────────────────────────────
    const componentContent = isHTMLContent
      ? generateSharedBlogComponentFromHTML(blogContent, imageUrls, title, imageAlt)
      : generateSharedBlogComponentFromMarkdown(blogContent, imageUrls, title, imageAlt);

    // ── Build SEO metadata ─────────────────────────────────────────────────────
    const seoData = manualSEO
      ? {
          metaTitle: cleanBlogMetaTitle(metaTitle, title),
          metaDescription: metaDescription || excerpt,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }
      : {
          metaTitle: title,
          metaDescription: excerpt,
          keywords: title.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(w => w.length > 3),
        };

    // ── Read & update blogData.ts ─────────────────────────────────────────────
    const componentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const blogDataPath = 'src/app/blog/blogData.ts';

    const blogDataFile = await octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch });
    if (!('content' in blogDataFile.data)) throw new Error('Could not read blogData.ts');
    const blogDataContent = Buffer.from(blogDataFile.data.content, 'base64').toString('utf-8');

    const cleanForString = (text: string): string => {
      let cleaned = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleaned.includes("'")) { cleaned = cleaned.replace(/"/g, '\\"'); return `"${cleaned}"`; }
      return `'${cleaned}'`;
    };

    const escapeForSingleQuote = (text: string): string =>
      text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').replace(/'/g, "\\'").trim();

    const newBlogEntry = `  {
    id: '${timestamp}',
    title: ${cleanForString(title)},
    slug: '${slug}',
    category: ${cleanForString(category || 'General')},
    author: ${cleanForString(author)},
    date: '${new Date().toISOString().split('T')[0]}',
    excerpt: ${cleanForString(excerpt)},
    image: '${cardImageUrl}',
    coverImage: '${coverImageUrl}',
    metaTitle: ${cleanForString(seoData.metaTitle)},
    metaDescription: ${cleanForString(seoData.metaDescription)},
    keywords: [${seoData.keywords.map(k => `'${escapeForSingleQuote(k)}'`).join(', ')}],
    ogImage: '${coverImageUrl}',
  },`;

    const arrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!arrayMatch) throw new Error('Could not find blogPosts array in blogData.ts');

    // Insert new entry at the top of the array (newest first)
    const replacement = `export const blogPosts: BlogPost[] = [\n${newBlogEntry}\n${arrayMatch[1]}];`;
    const updatedBlogDataContent = blogDataContent.replace(
      /export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/,
      replacement
    );

    // ── Commit both files to GitHub ────────────────────────────────────────────
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const currentCommitSha = refData.object.sha;
    const { data: commitData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: currentCommitSha });
    const baseTreeSha = commitData.tree.sha;

    const [componentBlob, blogDataBlob] = await Promise.all([
      octokit.rest.git.createBlob({ owner, repo, content: Buffer.from(componentContent).toString('base64'), encoding: 'base64' }),
      octokit.rest.git.createBlob({ owner, repo, content: Buffer.from(updatedBlogDataContent).toString('base64'), encoding: 'base64' }),
    ]);

    const { data: newTree } = await octokit.rest.git.createTree({
      owner, repo,
      base_tree: baseTreeSha,
      tree: [
        { path: componentPath, mode: '100644', type: 'blob', sha: componentBlob.data.sha },
        { path: blogDataPath, mode: '100644', type: 'blob', sha: blogDataBlob.data.sha },
      ],
    });

    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner, repo,
      message: `Add blog: ${title}`,
      tree: newTree.sha,
      parents: [currentCommitSha],
    });

    await octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });

    return NextResponse.json({
      success: true,
      message: 'Blog published successfully! The site should deploy in ~1–2 minutes.',
      slug,
      originalSlug: slugChanged ? originalSlug : undefined,
      slugChanged,
      previewUrl: `/blog/${slug}`,
      note: slugChanged
        ? `Slug "${originalSlug}" already existed — published as "${slug}" instead.`
        : 'Wait ~1–2 minutes for the deployment to publish the new page.',
    });

  } catch (error: unknown) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: getErrMsg(error) || 'Failed to create blog post. Please try again.' },
      { status: 500 }
    );
  }
}
