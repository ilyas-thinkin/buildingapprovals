import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Octokit } from 'octokit';

async function extractPdfText(contentBuffer: Buffer): Promise<string> {
  const pdfParseModule: any = await import('pdf-parse');
  const PDFParseClass = pdfParseModule?.PDFParse ?? pdfParseModule?.default?.PDFParse;

  if (typeof PDFParseClass === 'function') {
    const parser = new PDFParseClass({ data: contentBuffer });
    try {
      const textResult = await parser.getText();
      return textResult?.text ?? '';
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }

  const pdfParseFn =
    (typeof pdfParseModule === 'function' && pdfParseModule) ||
    (typeof pdfParseModule?.default === 'function' && pdfParseModule.default) ||
    (typeof pdfParseModule?.default?.default === 'function' && pdfParseModule.default.default) ||
    null;

  if (!pdfParseFn) {
    throw new Error('Could not load PDF parser function');
  }

  const pdfData = await pdfParseFn(contentBuffer);
  return pdfData?.text ?? '';
}

interface ExtractedDocxContent {
  text: string;
  images: Array<{ data: string; contentType: string; index: number }>;
}

async function extractDocxText(contentBuffer: Buffer): Promise<ExtractedDocxContent> {
  const mammothModule: any = await import('mammoth');
  const mammoth = mammothModule?.default ?? mammothModule;

  if (typeof mammoth?.convertToHtml !== 'function') {
    throw new Error('Could not load DOCX parser function');
  }

  const extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
  let imageCounter = 0;

  const result = await mammoth.convertToHtml(
    { buffer: contentBuffer },
    {
      convertImage: mammoth.images.imgElement((image: any) => {
        const currentIndex = imageCounter++;
        return image.read('base64').then((imageBuffer: string) => {
          extractedImages.push({
            data: imageBuffer,
            contentType: image.contentType || 'image/png',
            index: currentIndex
          });
          return {
            src: `IMAGE_PLACEHOLDER_${currentIndex}`
          };
        });
      })
    }
  );

  let text = result.value;
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/g, '\n## $1\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n## $1\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n### $1\n');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**');
  text = text.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
  text = text.replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');
  text = text.replace(/<br\s*\/?>/g, '\n');
  text = text.replace(/<img[^>]*src="IMAGE_PLACEHOLDER_(\d+)"[^>]*>/g, '\n[IMAGE_$1]\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  return {
    text: text.trim(),
    images: extractedImages
  };
}

// Escape text for safe JSX rendering - handles ALL potential compilation errors
function escapeForJSX(text: string): string {
  let escaped = text;

  // 1. Escape curly braces - JSX interprets {} as expressions
  escaped = escaped.replace(/\{/g, '&#123;');
  escaped = escaped.replace(/\}/g, '&#125;');

  // 2. Escape < and > that aren't part of valid JSX/HTML tags
  // First, protect valid HTML tags by marking them
  const tagPlaceholders: string[] = [];
  escaped = escaped.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*\s*\/?)>/g,
    (match) => {
      const placeholder = `__TAG_PLACEHOLDER_${tagPlaceholders.length}__`;
      tagPlaceholders.push(match);
      return placeholder;
    }
  );

  // Now escape remaining < and >
  escaped = escaped.replace(/</g, '&lt;');
  escaped = escaped.replace(/>/g, '&gt;');

  // Restore valid tags
  tagPlaceholders.forEach((tag, i) => {
    escaped = escaped.replace(`__TAG_PLACEHOLDER_${i}__`, tag);
  });

  // 3. Escape backticks - can break template literals
  escaped = escaped.replace(/`/g, '&#96;');

  // 4. Escape dollar signs followed by braces (template expressions)
  escaped = escaped.replace(/\$\{/g, '&#36;{');
  escaped = escaped.replace(/\$&#123;/g, '&#36;&#123;');

  // 5. Escape backslashes that could escape characters
  escaped = escaped.replace(/\\(?![nrt"'\\])/g, '&#92;');

  return escaped;
}

// Convert editor HTML content directly to JSX component
function generateBlogComponentFromHTML(htmlContent: string, imageUrls: { [key: number]: string }, title: string): string {
  const elements: string[] = [];

  // Create a clean version of HTML for processing
  let html = htmlContent;

  // Handle image placeholders [IMAGE: img_xxx] or [IMAGE_X]
  html = html.replace(/\[IMAGE:\s*img_\d+\]/g, (match) => {
    // Extract image ID and find corresponding URL
    const idMatch = match.match(/img_(\d+)/);
    if (idMatch) {
      const index = Object.keys(imageUrls).find(k => imageUrls[parseInt(k)]);
      if (index !== undefined) {
        return `__IMAGE_PLACEHOLDER_${index}__`;
      }
    }
    return match;
  });

  html = html.replace(/\[IMAGE_(\d+)\]/g, '__IMAGE_PLACEHOLDER_$1__');

  // Process the HTML content
  // Split by major block elements while preserving them
  const blockRegex = /<(h[1-6]|p|ul|ol|blockquote|div)[^>]*>[\s\S]*?<\/\1>|__IMAGE_PLACEHOLDER_\d+__|<br\s*\/?>/gi;

  let lastIndex = 0;
  let match;
  const tempDiv = [];

  // Extract all block elements
  const blocks: string[] = [];
  const regex = new RegExp(blockRegex.source, 'gi');

  while ((match = regex.exec(html)) !== null) {
    // Get any text before this match
    const before = html.slice(lastIndex, match.index).trim();
    if (before) {
      blocks.push(before);
    }
    blocks.push(match[0]);
    lastIndex = regex.lastIndex;
  }

  // Get any remaining text
  const remaining = html.slice(lastIndex).trim();
  if (remaining) {
    blocks.push(remaining);
  }

  for (const block of blocks) {
    // Skip empty blocks
    if (!block.trim()) continue;

    // Handle image placeholders
    const imageMatch = block.match(/__IMAGE_PLACEHOLDER_(\d+)__/);
    if (imageMatch) {
      const imageIndex = parseInt(imageMatch[1], 10);
      const imageUrl = imageUrls[imageIndex];
      if (imageUrl) {
        elements.push(`      <div style={{ margin: '40px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <img
          src="${imageUrl}"
          alt="Building Approvals Dubai - ${escapeForJSX(title)}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`);
      }
      continue;
    }

    // Handle headings
    const h1Match = block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const content = cleanInlineHTML(h1Match[1]);
      if (content.trim()) {
        elements.push(`      <h1>${escapeForJSX(content)}</h1>`);
      }
      continue;
    }

    const h2Match = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) {
      const content = cleanInlineHTML(h2Match[1]);
      if (content.trim()) {
        elements.push(`      <h2>${escapeForJSX(content)}</h2>`);
      }
      continue;
    }

    const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3Match) {
      const content = cleanInlineHTML(h3Match[1]);
      if (content.trim()) {
        elements.push(`      <h3>${escapeForJSX(content)}</h3>`);
      }
      continue;
    }

    // Handle unordered lists
    const ulMatch = block.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulMatch) {
      const listContent = ulMatch[1];
      const items: string[] = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(listContent)) !== null) {
        const itemContent = cleanInlineHTML(liMatch[1]);
        if (itemContent.trim()) {
          items.push(`        <li>${processInlineFormatting(escapeForJSX(itemContent))}</li>`);
        }
      }
      if (items.length > 0) {
        elements.push(`      <ul>\n${items.join('\n')}\n      </ul>`);
      }
      continue;
    }

    // Handle ordered lists
    const olMatch = block.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olMatch) {
      const listContent = olMatch[1];
      const items: string[] = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(listContent)) !== null) {
        const itemContent = cleanInlineHTML(liMatch[1]);
        if (itemContent.trim()) {
          items.push(`        <li>${processInlineFormatting(escapeForJSX(itemContent))}</li>`);
        }
      }
      if (items.length > 0) {
        elements.push(`      <ol>\n${items.join('\n')}\n      </ol>`);
      }
      continue;
    }

    // Handle blockquotes
    const blockquoteMatch = block.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (blockquoteMatch) {
      const content = cleanInlineHTML(blockquoteMatch[1]);
      if (content.trim()) {
        elements.push(`      <blockquote>${processInlineFormatting(escapeForJSX(content))}</blockquote>`);
      }
      continue;
    }

    // Handle paragraphs
    const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      const content = cleanInlineHTML(pMatch[1]);
      if (content.trim()) {
        elements.push(`      <p>${processInlineFormatting(escapeForJSX(content))}</p>`);
      }
      continue;
    }

    // Handle divs (treat as paragraphs)
    const divMatch = block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
    if (divMatch) {
      const content = cleanInlineHTML(divMatch[1]);
      if (content.trim()) {
        elements.push(`      <p>${processInlineFormatting(escapeForJSX(content))}</p>`);
      }
      continue;
    }

    // Handle plain text (not wrapped in tags)
    const plainText = block.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    if (plainText) {
      elements.push(`      <p>${processInlineFormatting(escapeForJSX(plainText))}</p>`);
    }
  }

  return `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${elements.join('\n\n')}

      <div className="cta-box">
        <h3>Need Help with Building Approvals?</h3>
        <p>Our expert team is ready to assist you with all your Dubai building approval needs.</p>
        <a href="/contact" className="cta-button">Get in Touch</a>
      </div>
    </div>
  );
}
`;
}

// Clean inline HTML - remove tags but preserve text
function cleanInlineHTML(html: string): string {
  let text = html;

  // Decode HTML entities first
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Process inline formatting (bold, italic, links) - preserve these as JSX
function processInlineFormatting(text: string): string {
  let processed = text;

  // Convert markdown-style formatting back to HTML
  // Bold: **text** -> <strong>text</strong>
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* -> <em>text</em> (but not if part of bold)
  processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Links: [text](url) -> <a href="url">text</a>
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return processed;
}

// Legacy function for markdown content (from file uploads)
function generateBlogComponentFromMarkdown(blogContent: string, imageUrls: { [key: number]: string }, title: string): string {
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
    // Don't treat numbered questions (ending with ?) as bullet points
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
    if (faqMatch) {
      return { level: 3, text: faqMatch[1] };
    }

    const boldHeading = line.match(/^\*\*([^*]+)\*\*$/);
    if (boldHeading && boldHeading[1].length < 100 && !boldHeading[1].endsWith('.')) {
      return { level: 2, text: boldHeading[1] };
    }

    if (line.endsWith(':') && line.length < 80 && !line.includes('.')) {
      return { level: 3, text: line };
    }

    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for image placeholders
    const imageMatch = line.match(/^\[IMAGE_(\d+)\]$/);
    if (imageMatch) {
      const imageIndex = parseInt(imageMatch[1], 10);
      const imageUrl = imageUrls[imageIndex];
      if (imageUrl) {
        flushList();
        elements.push(`      <div style={{ margin: '40px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <img
          src="${imageUrl}"
          alt="Building Approvals Dubai - ${escapeForJSX(title)}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`);
      }
      continue;
    }

    // Check for bullet points
    const bulletContent = isBulletPoint(line);
    if (bulletContent) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(bulletContent);
      continue;
    }

    flushList();

    // Check for headings
    const heading = isHeading(line);
    if (heading) {
      elements.push(`      <h${heading.level}>${processInlineFormatting(escapeForJSX(heading.text))}</h${heading.level}>`);
      continue;
    }

    // Regular paragraph
    if (line.length > 0) {
      elements.push(`      <p>${processInlineFormatting(escapeForJSX(line))}</p>`);
    }
  }

  flushList();

  return `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${elements.join('\n\n')}

      <div className="cta-box">
        <h3>Need Help with Building Approvals?</h3>
        <p>Our expert team is ready to assist you with all your Dubai building approval needs.</p>
        <a href="/contact" className="cta-button">Get in Touch</a>
      </div>
    </div>
  );
}
`;
}

// Find next available slug version
async function findAvailableSlug(octokit: Octokit, owner: string, repo: string, branch: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let version = 0;

  while (true) {
    const componentPath = `src/app/blog/[slug]/content/${slug}.tsx`;

    try {
      await octokit.rest.repos.getContent({
        owner,
        repo,
        path: componentPath,
        ref: branch,
      });

      // File exists, try next version
      version++;
      slug = `${baseSlug}-${version}`;
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, this slug is available
        return slug;
      }
      // Some other error, just use the original slug
      return baseSlug;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    let slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const excerpt = formData.get('excerpt') as string;
    const manualSEO = formData.get('manualSEO') === 'true';
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const focusKeyword = formData.get('focusKeyword') as string;
    const keywords = formData.get('keywords') as string;

    const cardImage = formData.get('cardImage') as File;
    const coverImage = formData.get('coverImage') as File;
    const contentFile = formData.get('contentFile') as File;
    const contentType = formData.get('contentType') as string;
    const manualContent = formData.get('manualContent') as string;

    // Check required fields
    const hasContent = contentFile || (contentType === 'manual' && manualContent);
    if (!title || !slug || !cardImage || !coverImage || !hasContent) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, cardImage, coverImage, and content (file or manual) are required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        {
          error: 'GitHub API not configured. Please add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to environment variables.',
          hint: 'Check BLOG_UPLOAD_SETUP.md for setup instructions.'
        },
        { status: 500 }
      );
    }

    // Initialize Octokit early for slug checking
    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    // Verify repository access
    try {
      await octokit.rest.repos.get({ owner, repo });
    } catch (repoError: any) {
      console.error('GitHub repository access error:', repoError);
      return NextResponse.json(
        {
          error: `Cannot access GitHub repository: ${owner}/${repo}`,
          details: repoError.message,
          hint: 'Check that GITHUB_TOKEN has repo permissions and GITHUB_OWNER/GITHUB_REPO are correct.'
        },
        { status: 500 }
      );
    }

    // Check if slug exists and find available version
    const originalSlug = slug;
    slug = await findAvailableSlug(octokit, owner, repo, branch, slug);

    const slugChanged = slug !== originalSlug;

    // Create short category name
    const createCategorySlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/s$/, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);
    };

    const categorySlug = createCategorySlug(category || title.split(' ').slice(0, 3).join(' '));
    const timestamp = Date.now();

    // Upload images to Vercel Blob
    const cardImageExt = cardImage.name.split('.').pop();
    const cardImageName = `building-approvals-dubai-${categorySlug}-list-${timestamp}.${cardImageExt}`;
    const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
    const cardImageBlob = await put(`blog/${cardImageName}`, cardImageBuffer, {
      access: 'public',
      contentType: cardImage.type,
    });

    const coverImageExt = coverImage.name.split('.').pop();
    const coverImageName = `building-approvals-dubai-${categorySlug}-cover-${timestamp}.${coverImageExt}`;
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    const coverImageBlob = await put(`blog/${coverImageName}`, coverImageBuffer, {
      access: 'public',
      contentType: coverImage.type,
    });

    // Parse content
    let blogContent = '';
    let extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
    let isHTMLContent = false;

    if (contentType === 'manual' && manualContent) {
      blogContent = manualContent;
      // Check if content is HTML (from editor) or markdown
      isHTMLContent = /<[a-z][\s\S]*>/i.test(manualContent);
    } else if (contentFile) {
      const contentBuffer = Buffer.from(await contentFile.arrayBuffer());
      const contentFileName = contentFile.name.toLowerCase();

      if (contentFileName.endsWith('.pdf')) {
        blogContent = await extractPdfText(contentBuffer);
      } else if (contentFileName.endsWith('.docx')) {
        const docxResult = await extractDocxText(contentBuffer);
        blogContent = docxResult.text;
        extractedImages = docxResult.images;
      } else {
        return NextResponse.json(
          { error: 'Only PDF and DOCX files are supported' },
          { status: 400 }
        );
      }
    }

    // Handle content images
    const contentImageKeys = Array.from(formData.keys()).filter(key => key.startsWith('contentImage_'));

    // Map [IMAGE: img_xxx] placeholders to numeric indices
    const imagePlaceholderRegex = /\[IMAGE:\s*(img_\d+)\]/g;
    const placeholderMatches = [...blogContent.matchAll(imagePlaceholderRegex)];
    const imageIdToIndex: { [id: string]: number } = {};

    placeholderMatches.forEach((match, index) => {
      imageIdToIndex[match[1]] = index;
    });

    // Convert [IMAGE: img_xxx] to [IMAGE_X] format
    blogContent = blogContent.replace(imagePlaceholderRegex, (match, id) => {
      const index = imageIdToIndex[id];
      return `[IMAGE_${index}]`;
    });

    for (const key of contentImageKeys) {
      const indexMatch = key.match(/contentImage_(\d+)/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1], 10);
        const file = formData.get(key) as File;
        if (file) {
          const imageBuffer = Buffer.from(await file.arrayBuffer());
          extractedImages.push({
            data: imageBuffer.toString('base64'),
            contentType: file.type || 'image/png',
            index
          });
        }
      }
    }

    // Upload extracted images to Vercel Blob
    const imageUrls: { [key: number]: string } = {};
    for (const img of extractedImages) {
      const imageExt = img.contentType.split('/')[1] || 'png';
      const imageSuffix = extractedImages.length > 1 ? `content-${img.index + 1}` : 'content';
      const imageName = `building-approvals-dubai-${categorySlug}-${imageSuffix}-${timestamp}.${imageExt}`;
      const imageBuffer = Buffer.from(img.data, 'base64');
      const imageBlob = await put(`blog/${imageName}`, imageBuffer, {
        access: 'public',
        contentType: img.contentType,
      });
      imageUrls[img.index] = imageBlob.url;
    }

    // Generate SEO metadata
    const seoData = manualSEO
      ? {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          focusKeyword,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }
      : {
          metaTitle: `${title} | Building Approvals Dubai`,
          metaDescription: excerpt,
          focusKeyword: title.split(' ').slice(0, 3).join(' '),
          keywords: title.split(' ').filter(word => word.length > 3),
        };

    // Generate blog component - use HTML processor for editor content, markdown for file uploads
    const componentContent = isHTMLContent
      ? generateBlogComponentFromHTML(blogContent, imageUrls, title)
      : generateBlogComponentFromMarkdown(blogContent, imageUrls, title);

    // Prepare all file changes for a single commit
    const componentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const blogDataPath = 'src/app/blog/blogData.ts';
    const pagePath = 'src/app/blog/[slug]/page.tsx';

    // Get current files from GitHub
    const [blogDataFile, pageFile] = await Promise.all([
      octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch }),
      octokit.rest.repos.getContent({ owner, repo, path: pagePath, ref: branch }),
    ]);

    if (!('content' in blogDataFile.data) || !('content' in pageFile.data)) {
      throw new Error('Could not read required files');
    }

    const blogDataContent = Buffer.from(blogDataFile.data.content, 'base64').toString('utf-8');
    const pageContent = Buffer.from(pageFile.data.content, 'base64').toString('utf-8');

    // Helper to clean text for strings - escape single quotes and use double quotes if needed
    const cleanForString = (text: string): string => {
      let cleaned = text
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If text contains single quotes, use double quotes
      if (cleaned.includes("'")) {
        cleaned = cleaned.replace(/"/g, '\\"');
        return `"${cleaned}"`;
      }
      return `'${cleaned}'`;
    };

    // Simpler version that just escapes quotes for inside strings
    const escapeForSingleQuote = (text: string): string => {
      return text
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/'/g, "\\'")
        .trim();
    };

    // 1. Prepare blogData.ts update
    const newBlogEntry = `  {
    id: '${timestamp}',
    title: ${cleanForString(title)},
    slug: '${slug}',
    category: ${cleanForString(category)},
    author: ${cleanForString(author)},
    date: '${new Date().toISOString().split('T')[0]}',
    excerpt: ${cleanForString(excerpt)},
    image: '${cardImageBlob.url}',
    coverImage: '${coverImageBlob.url}',
    metaTitle: ${cleanForString(seoData.metaTitle)},
    metaDescription: ${cleanForString(seoData.metaDescription)},
    keywords: [${seoData.keywords.map(k => `'${escapeForSingleQuote(k)}'`).join(', ')}],
    ogImage: '${coverImageBlob.url}',
  },`;

    const arrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!arrayMatch) {
      throw new Error('Could not find blogPosts array');
    }

    const replacement = `export const blogPosts: BlogPost[] = [\n${newBlogEntry}\n${arrayMatch[1]}];`;
    const updatedBlogDataContent = blogDataContent.replace(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/, replacement);

    // 2. Prepare page.tsx update
    let componentName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Handle names starting with numbers
    if (/^\d/.test(componentName)) {
      const numberWords: { [key: string]: string } = {
        '0': 'Zero_', '1': 'One_', '2': 'Two_', '3': 'Three_', '4': 'Four_',
        '5': 'Five_', '6': 'Six_', '7': 'Seven_', '8': 'Eight_', '9': 'Nine_', '10': 'Ten_'
      };
      const match = componentName.match(/^(\d+)/);
      if (match) {
        const num = match[1];
        const prefix = numberWords[num] || `N${num}_`;
        componentName = prefix + componentName.slice(num.length);
      }
    }

    // Use dynamic import with error handling for resilience
    const importStatement = `const ${componentName}Content = dynamic(() => import('./content/${slug}').catch(() => () => null), { ssr: true });`;
    let updatedPageContent = pageContent;

    // Check if import already exists
    if (!updatedPageContent.includes(`'./content/${slug}'`) && !updatedPageContent.includes(`"./content/${slug}"`)) {
      // Find the last dynamic import line and add after it
      const dynamicImportMatch = updatedPageContent.match(/const \w+Content = dynamic\([^;]+\);/g);
      if (dynamicImportMatch && dynamicImportMatch.length > 0) {
        const lastDynamicImport = dynamicImportMatch[dynamicImportMatch.length - 1];
        const lastIndex = updatedPageContent.lastIndexOf(lastDynamicImport);
        updatedPageContent = updatedPageContent.slice(0, lastIndex + lastDynamicImport.length) + '\n' + importStatement + updatedPageContent.slice(lastIndex + lastDynamicImport.length);
      } else {
        // Fallback: add after last import statement
        const lastImportIndex = updatedPageContent.lastIndexOf('import ');
        const nextLineIndex = updatedPageContent.indexOf('\n', lastImportIndex) + 1;
        updatedPageContent = updatedPageContent.slice(0, nextLineIndex) + importStatement + '\n' + updatedPageContent.slice(nextLineIndex);
      }
    }

    // Add render case
    const renderCase = `    if (post.slug === '${slug}') {
      return <${componentName}Content />;
    }
`;

    if (!updatedPageContent.includes(`if (post.slug === '${slug}')`)) {
      const returnNullIndex = updatedPageContent.indexOf('return null;');
      if (returnNullIndex !== -1) {
        updatedPageContent = updatedPageContent.slice(0, returnNullIndex) + renderCase + '    ' + updatedPageContent.slice(returnNullIndex);
      }
    }

    // 3. Create a single commit with all file changes using Git Data API
    // Get the current commit SHA for the branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const currentCommitSha = refData.object.sha;

    // Get the current tree
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for all files
    const [componentBlob, blogDataBlob, pageBlob] = await Promise.all([
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(componentContent).toString('base64'),
        encoding: 'base64',
      }),
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(updatedBlogDataContent).toString('base64'),
        encoding: 'base64',
      }),
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(updatedPageContent).toString('base64'),
        encoding: 'base64',
      }),
    ]);

    // Create a new tree with all file changes
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
          path: componentPath,
          mode: '100644',
          type: 'blob',
          sha: componentBlob.data.sha,
        },
        {
          path: blogDataPath,
          mode: '100644',
          type: 'blob',
          sha: blogDataBlob.data.sha,
        },
        {
          path: pagePath,
          mode: '100644',
          type: 'blob',
          sha: pageBlob.data.sha,
        },
      ],
    });

    // Create a new commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Add blog: ${title}`,
      tree: newTree.sha,
      parents: [currentCommitSha],
    });

    // Update the branch reference
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    return NextResponse.json({
      success: true,
      message: 'Blog uploaded successfully and automatically committed to GitHub! Vercel will deploy shortly.',
      slug,
      originalSlug: slugChanged ? originalSlug : undefined,
      slugChanged,
      previewUrl: `https://www.buildingapprovals.ae/blog/${slug}`,
      note: slugChanged
        ? `Note: A blog with slug "${originalSlug}" already exists. Created with slug "${slug}" instead.`
        : 'Wait 2-3 minutes for Vercel to deploy the changes.',
      filesCreated: [
        `src/app/blog/[slug]/content/${slug}.tsx`,
        'src/app/blog/blogData.ts (updated)',
        'src/app/blog/[slug]/page.tsx (updated)',
      ],
    });
  } catch (error: any) {
    console.error('Error uploading blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload blog' },
      { status: 500 }
    );
  }
}
