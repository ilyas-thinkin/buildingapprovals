/**
 * Shared blog component generation utilities.
 * Used by both create-blog and update-blog API routes.
 */

import sanitizeHtml from 'sanitize-html';
import { htmlToJsx } from 'html-to-jsx-transform';

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&bull;': '•',
  '&middot;': '·',
  '&ndash;': '–',
  '&mdash;': '—',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&hellip;': '…',
};

// ─── HTML pre-processing ──────────────────────────────────────────────────────

/**
 * Sanitize raw HTML and normalise attribute names for JSX
 * (class → className, etc.).  Runs before the regex-based sanitizer.
 */
export function preProcessHtml(html: string): string {
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
    allowedStyles: {},
    textFilter: (text) => text,
  });
  try {
    return htmlToJsx(clean);
  } catch {
    return clean;
  }
}

// ─── JSX text/attribute escaping ─────────────────────────────────────────────

function decodeCommonEntities(text: string): string {
  let decoded = text;
  for (const [entity, replacement] of Object.entries(ENTITY_MAP)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), replacement);
  }
  decoded = decoded.replace(/&#(\d+);/g, (match, code) => {
    const n = parseInt(code, 10);
    if (Number.isNaN(n)) return match;
    return String.fromCharCode(n);
  });
  return decoded;
}

function normalizeHtmlContent(html: string): string {
  let normalized = decodeCommonEntities(html)
    .replace(/&lt;&gt;|<>|<\/>/g, '')
    .replace(/\uFEFF/g, '')
    .trim();

  normalized = normalized.replace(
    /<div[^>]*>\s*(<(?:table|blockquote|ul|ol)[\s\S]*?<\/(?:table|blockquote|ul|ol)>)\s*<\/div>/gi,
    '$1'
  );

  normalized = normalized.replace(
    /(?:<(p|div)[^>]*>\s*(?:•|·)\s*[\s\S]*?<\/\1>\s*)+/gi,
    (match) => {
      const items: string[] = [];
      const itemRegex = /<(p|div)[^>]*>\s*(?:•|·)\s*([\s\S]*?)<\/\1>/gi;
      let itemMatch;
      while ((itemMatch = itemRegex.exec(match)) !== null) {
        const item = itemMatch[2].trim();
        if (item) items.push(`<li>${item}</li>`);
      }
      return items.length > 0 ? `<ul>${items.join('')}</ul>` : match;
    }
  );

  normalized = normalized.replace(
    /(?:<(p|div)[^>]*>\s*(?:>|&gt;)\s*[\s\S]*?<\/\1>\s*)+/gi,
    (match) => {
      const parts: string[] = [];
      const partRegex = /<(p|div)[^>]*>\s*(?:>|&gt;)\s*([\s\S]*?)<\/\1>/gi;
      let partMatch;
      while ((partMatch = partRegex.exec(match)) !== null) {
        const item = partMatch[2].trim();
        if (item) parts.push(`<p>${item}</p>`);
      }
      return parts.length > 0 ? `<blockquote>${parts.join('')}</blockquote>` : match;
    }
  );

  return normalized;
}

export function escapeForJSX(text: string): string {
  let e = text;
  e = e.replace(/\{/g, '&#123;');
  e = e.replace(/\}/g, '&#125;');

  const tagPlaceholders: string[] = [];
  e = e.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*\s*\/?)>/g,
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

// ─── Inline helpers ───────────────────────────────────────────────────────────

function cleanInlineHTML(html: string): string {
  let t = decodeCommonEntities(html);

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

// ─── Unclosed inline tag fixer ───────────────────────────────────────────────

/**
 * Stack-based pass that auto-closes inline tags left open inside a block element.
 * Fixes cases like: <h3><span className="a"><span className="b">text</span></h3>
 *                → <h3><span className="a"><span className="b">text</span></span></h3>
 */
export function fixUnclosedInlineTags(html: string): string {
  const INLINE_TAGS = new Set([
    'span','strong','em','b','i','a','mark','sub','sup',
    'del','ins','code','s','small','cite','q','abbr','kbd','samp','var',
  ]);
  const BLOCK_CLOSING = new Set([
    'h1','h2','h3','h4','h5','h6','p','li','div','td','th',
    'blockquote','ul','ol','table','tr','thead','tbody','tfoot',
    'section','article','aside','header','footer','nav','main','figure','figcaption',
  ]);

  // Matches tags; attribute values with quotes are consumed so > inside quotes won't confuse the regex
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s(?:[^>"']|"[^"]*"|'[^']*')*)?>/g;
  const stack: string[] = [];
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(html)) !== null) {
    const [fullMatch, slash, rawTag] = match;
    const tag = rawTag.toLowerCase();
    const isClosing = slash === '/';

    result += html.slice(lastIndex, match.index);
    lastIndex = match.index + fullMatch.length;

    if (!isClosing && INLINE_TAGS.has(tag)) {
      stack.push(tag);
      result += fullMatch;
    } else if (isClosing && INLINE_TAGS.has(tag)) {
      if (stack.length > 0 && stack[stack.length - 1] === tag) {
        stack.pop();
        result += fullMatch;
      } else if (stack.includes(tag)) {
        // Out-of-order close: flush intervening tags first
        while (stack.length > 0 && stack[stack.length - 1] !== tag) {
          result += `</${stack.pop()}>`;
        }
        if (stack.length > 0) { stack.pop(); result += fullMatch; }
      }
      // else: orphan closing tag — drop it silently
    } else if (isClosing && BLOCK_CLOSING.has(tag)) {
      // Auto-close any open inline tags before the block closes
      while (stack.length > 0) result += `</${stack.pop()}>`;
      result += fullMatch;
    } else {
      result += fullMatch;
    }
  }

  result += html.slice(lastIndex);
  while (stack.length > 0) result += `</${stack.pop()}>`;
  return result;
}

// ─── Final JSX component sanitizer ───────────────────────────────────────────

export function sanitizeFinalComponent(componentCode: string): string {
  let s = componentCode;

  s = s.replace(/\bclassname\s*=/gi, 'className=');
  s = s.replace(/\s+data-[a-z][a-z0-9-]*="[^"]*"/gi, '');
  s = s.replace(/\s+data-[a-z][a-z0-9-]*='[^']*'/gi, '');
  s = s.replace(/\s+aria-[a-z][a-z0-9-]*="[^"]*"/gi, '');
  s = s.replace(/\s+aria-[a-z][a-z0-9-]*(=[^\s>]+)?/gi, '');

  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  s = s.replace(/<\/?(use|path|circle|rect|line|polyline|polygon|ellipse|g|defs|symbol|mask|clipPath|linearGradient|radialGradient|stop|tspan|textPath)[^>]*>/gi, '');

  s = s.replace(/<a(\s[^>]*)?>([^<]*)<\/a>/gi, (match, attrs, inner) => {
    if (attrs && /\bhref\s*=\s*["'][^"']+["']/i.test(attrs)) return match;
    const text = inner.trim();
    if (/^https?:\/\//.test(text)) return text;
    return text || '';
  });

  s = s.replace(/<\/?font[^>]*>/gi, '');
  s = s.replace(/<\/?center[^>]*>/gi, '');
  s = s.replace(/<\/?marquee[^>]*>/gi, '');
  s = s.replace(/<\/?blink[^>]*>/gi, '');
  s = s.replace(/<\/?u[^a-zA-Z][^>]*>/gi, '');
  s = s.replace(/<\/?u>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  s = s.replace(/<(object|embed|form|input|button|select|textarea|meta|link)[^>]*\/?>/gi, '');

  s = s.replace(/<br(?!\s*\/>)>/gi, '<br />');
  s = s.replace(/<hr(?!\s*\/>)([^>]*)>/gi, '<hr$1 />');
  s = s.replace(/<img([^>]*[^/])>/gi, '<img$1 />');

  s = s.replace(/<(li|p|div|span|strong|em|a|h[1-6])([^>]*)\s*\/>/gi, '<$1$2></$1>');

  s = s.replace(/<ul[^>]*>\s*<ul>/gi, '<ul>');
  s = s.replace(/<\/ul>\s*<\/ul>/gi, '</ul>');
  s = s.replace(/<ol[^>]*>\s*<ol>/gi, '<ol>');
  s = s.replace(/<\/ol>\s*<\/ol>/gi, '</ol>');

  s = s.replace(/<p>(\s*<(?:div|table|ul|ol|h[1-6]|blockquote)[^>]*>[\s\S]*?<\/(?:div|table|ul|ol|h[1-6]|blockquote)>\s*)<\/p>/gi, '$1');
  s = s.replace(/(<(?:ul|ol)[^>]*>)\s*<br\s*\/>\s*/gi, '$1');
  s = s.replace(/\s*<br\s*\/>\s*(<\/(?:ul|ol)>)/gi, '$1');

  s = s.replace(/<a[^>]*>\s*<\/a>/gi, '');
  s = s.replace(/<strong>\s*<\/strong>/gi, '');
  s = s.replace(/<em>\s*<\/em>/gi, '');
  s = s.replace(/<p>\s*<\/p>/gi, '');
  s = s.replace(/<h[1-6]>\s*(&nbsp;|\s)*\s*<\/h[1-6]>/gi, '');
  s = s.replace(/<p>(\s*<strong[^>]*>\s*)+\s*<\/p>/gi, '');
  s = s.replace(/<\/?(?:strong[a-z]+|em[a-z]+|h[1-6][a-z]+|div[a-z]+|span[a-z]+|p[a-z]+)[^>]*>/gi, '');

  s = s.replace(/\s*style="[^"]*"/gi, '');
  s = s.replace(/\s*style=\{\{[^}]*\}\}/g, '');

  s = s.replace(/&(?!(amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+|ldquo|rdquo|lsquo|rsquo|mdash|ndash|hellip);)/gi, '&amp;');

  s = s.replace(/>([^<]+)</g, (match, text) => {
    const escaped = text
      .replace(/'/g, '&apos;')
      .replace(/\{/g, '&#123;')
      .replace(/\}/g, '&#125;');
    return '>' + escaped + '<';
  });

  s = s.replace(/>\s*\*\*\s*</g, '><');
  s = s.replace(/\*\*([^*<>]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/<p>\s*#{1,6}\s+([^<]+)<\/p>/g, (_, text) => `<h2>${text.trim()}</h2>`);
  s = s.replace(/\n{3,}/g, '\n\n');

  s = fixUnclosedInlineTags(s);

  return s;
}

// ─── HTML → JSX blog component ───────────────────────────────────────────────

/**
 * Convert sanitised HTML (from the editor or a file) into a complete
 * `BlogContent` JSX component string, ready to write to disk.
 *
 * @param htmlContent  Raw HTML from the editor / extraction pipeline
 * @param imageUrls    Map of placeholder id → uploaded CDN URL
 * @param title        Blog post title (used for alt text fallback)
 * @param imageAlt     Optional explicit alt text for images
 */
export function generateBlogComponentFromHTML(
  htmlContent: string,
  imageUrls: { [key: string]: string },
  title: string,
  imageAlt?: string,
): string {
  const altText = imageAlt || `Building Approvals Dubai - ${title}`;
  const elements: string[] = [];
  const normalizedHtmlContent = normalizeHtmlContent(htmlContent);

  // Protect image placeholders from being stripped by sanitize-html
  const placeholderMap: Record<string, string> = {};
  let placeholderIndex = 0;
  let htmlWithPlaceholders = normalizedHtmlContent
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

  htmlWithPlaceholders = preProcessHtml(htmlWithPlaceholders);

  let html = htmlWithPlaceholders;
  for (const [token, original] of Object.entries(placeholderMap)) {
    html = html.replace(new RegExp(token, 'g'), original);
  }

  html = html.replace(/\[IMAGE:\s*(img_\d+)\]/g, '__IMAGE_PLACEHOLDER_$1__');
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
    if (bqMatch) {
      const alignClass = getTextAlignClass(block);
      const quoteParagraphs: string[] = [];
      const quoteParagraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let quoteParagraphMatch;
      while ((quoteParagraphMatch = quoteParagraphRegex.exec(bqMatch[1])) !== null) {
        const c = cleanInlineHTML(quoteParagraphMatch[1]);
        if (c.trim()) {
          quoteParagraphs.push(`        <p>${processInlineFormatting(escapeForJSX(c))}</p>`);
        }
      }

      if (quoteParagraphs.length > 0) {
        elements.push(
          alignClass
            ? `      <blockquote className="${alignClass}">\n${quoteParagraphs.join('\n')}\n      </blockquote>`
            : `      <blockquote>\n${quoteParagraphs.join('\n')}\n      </blockquote>`
        );
        continue;
      }

      const c = cleanInlineHTML(bqMatch[1]);
      if (c.trim()) {
        elements.push(wrapWithOptionalClass('blockquote', processInlineFormatting(escapeForJSX(c)), alignClass));
      }
      continue;
    }

    // Table block — reconstruct as clean JSX (must come before pMatch, because Tiptap wraps
    // tables in <div class="tableWrapper"> which gets captured as a div block, and the <p>
    // tags inside table cells would otherwise match pMatch first, losing all table structure)
    const tableMatch = block.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (tableMatch) {
      const tableInner = tableMatch[1];
      const rows: string[] = [];

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

      const tbodyContent = tableInner
        .replace(/<thead[^>]*>[\s\S]*?<\/thead>/gi, '')
        .replace(/<tfoot[^>]*>[\s\S]*?<\/tfoot>/gi, '');
      const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let trM;
      const bodyRows: string[] = [];
      while ((trM = trRegex.exec(tbodyContent)) !== null) {
        // Tiptap places <th> cells inside <tbody> (no explicit <thead> wrapper).
        // Detect header rows by checking if any cell is <th>, then route them to
        // <thead> (rows[]) so the teal-gradient CSS on <th> applies correctly.
        const isHeaderRow = /<th[^>]*>/i.test(trM[1]);
        const cells: string[] = [];
        const cellRegex = isHeaderRow
          ? /<th([^>]*)>([\s\S]*?)<\/th>/gi
          : /<td([^>]*)>([\s\S]*?)<\/td>/gi;
        let cellM;
        while ((cellM = cellRegex.exec(trM[1])) !== null) {
          const c = cleanInlineHTML(cellM[2]);
          const alignClass = getTextAlignClass(cellM[1]);
          if (isHeaderRow) {
            cells.push(alignClass ? `          <th className="${alignClass}">${processInlineFormatting(escapeForJSX(c))}</th>` : `          <th>${processInlineFormatting(escapeForJSX(c))}</th>`);
          } else {
            cells.push(alignClass ? `            <td className="${alignClass}">${processInlineFormatting(escapeForJSX(c))}</td>` : `            <td>${processInlineFormatting(escapeForJSX(c))}</td>`);
          }
        }
        if (cells.length > 0) {
          const rowClass = getRowHeightClass(trM[0]);
          if (isHeaderRow) {
            rows.push(rowClass ? `        <tr className="${rowClass}">\n${cells.join('\n')}\n        </tr>` : `        <tr>\n${cells.join('\n')}\n        </tr>`);
          } else {
            bodyRows.push(rowClass ? `          <tr className="${rowClass}">\n${cells.join('\n')}\n          </tr>` : `          <tr>\n${cells.join('\n')}\n          </tr>`);
          }
        }
      }

      const theadJSX = rows.length > 0 ? `        <thead>\n${rows.join('\n')}\n        </thead>` : '';
      const tbodyJSX = bodyRows.length > 0 ? `        <tbody>\n${bodyRows.join('\n')}\n        </tbody>` : '';

      if (theadJSX || tbodyJSX) {
        elements.push(`      <div className="blog-table-wrap">\n        <table>\n${theadJSX ? `${theadJSX}\n` : ''}${tbodyJSX ? `${tbodyJSX}\n` : ''}        </table>\n      </div>`);
      }
      continue;
    }

    // Handle <img> tags that are the sole content of a block.
    // This preserves images in edited blogs where the existing /api/images/... URL survives
    // without a data-upload-id, so buildContentForSave never converts them to [IMAGE:] placeholders.
    const imgTagMatch = block.match(/<img\s[^>]*src=["']([^"']+)["'][^>]*\/?>/i);
    if (imgTagMatch) {
      const nonImgContent = block.replace(/<img[^>]*\/?>/gi, '').replace(/<[^>]+>/g, '').trim();
      if (!nonImgContent) {
        const src = imgTagMatch[1];
        if (src && !src.startsWith('data:')) {
          const altMatch = block.match(/\balt=["']([^"']*?)["']/i);
          const imgAlt = altMatch ? altMatch[1] : altText;
          elements.push(`      <figure className="blog-image-figure">
        <img src="${src}" alt="${escapeForJSX(imgAlt || altText)}" />
      </figure>`);
          continue;
        }
      }
    }

    const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) { const c = cleanInlineHTML(pMatch[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('p', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const divMatch = block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
    if (divMatch) { const c = cleanInlineHTML(divMatch[1]); const alignClass = getTextAlignClass(block); if (c.trim()) elements.push(wrapWithOptionalClass('p', processInlineFormatting(escapeForJSX(c)), alignClass)); continue; }

    const plainText = cleanInlineHTML(block.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim();
    if (plainText && plainText !== '<>') {
      elements.push(`      <p>${processInlineFormatting(escapeForJSX(plainText))}</p>`);
    }
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

export function generateBlogComponentFromMarkdown(
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
    const docxImageMatch = line.match(/^\[IMAGE_(\d+)\]$/);
    if (docxImageMatch) {
      const imageUrl = imageUrls[`docx_${docxImageMatch[1]}`];
      if (imageUrl) {
        flushList();
        elements.push(`      <figure className="blog-image-figure">\n        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />\n      </figure>`);
      }
      continue;
    }

    const editorImageMatch = line.match(/^\[IMAGE:\s*(img_\d+)\]$/);
    if (editorImageMatch) {
      const imageUrl = imageUrls[editorImageMatch[1]];
      if (imageUrl) {
        flushList();
        elements.push(`      <figure className="blog-image-figure">\n        <img src="${imageUrl}" alt="${escapeForJSX(altText)}" />\n      </figure>`);
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
