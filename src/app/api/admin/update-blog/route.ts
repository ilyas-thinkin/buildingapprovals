import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Octokit } from 'octokit';

// Escape text for safe JSX rendering
function escapeForJSX(text: string): string {
  let escaped = text;

  // Escape curly braces
  escaped = escaped.replace(/\{/g, '&#123;');
  escaped = escaped.replace(/\}/g, '&#125;');

  // Protect valid HTML tags
  const tagPlaceholders: string[] = [];
  escaped = escaped.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*\s*\/?)>/g,
    (match) => {
      const placeholder = `__TAG_PLACEHOLDER_${tagPlaceholders.length}__`;
      tagPlaceholders.push(match);
      return placeholder;
    }
  );

  // Escape remaining < and >
  escaped = escaped.replace(/</g, '&lt;');
  escaped = escaped.replace(/>/g, '&gt;');

  // Restore valid tags
  tagPlaceholders.forEach((tag, i) => {
    escaped = escaped.replace(`__TAG_PLACEHOLDER_${i}__`, tag);
  });

  // Escape backticks
  escaped = escaped.replace(/`/g, '&#96;');

  // Escape template expressions
  escaped = escaped.replace(/\$\{/g, '&#36;{');
  escaped = escaped.replace(/\$&#123;/g, '&#36;&#123;');

  // Escape backslashes
  escaped = escaped.replace(/\\(?![nrt"'\\])/g, '&#92;');

  return escaped;
}

// Clean inline HTML - preserve inline formatting tags (a, strong, em, b, i) but remove block tags
function cleanInlineHTML(html: string): string {
  let text = html;

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  // Preserve inline formatting tags by protecting them
  const inlineTagPlaceholders: string[] = [];

  // Protect <a> tags with all attributes
  text = text.replace(/<a\s+[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });

  // Protect <strong> and <b> tags
  text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });

  // Protect <em> and <i> tags
  text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (match) => {
    const placeholder = `__INLINE_TAG_${inlineTagPlaceholders.length}__`;
    inlineTagPlaceholders.push(match);
    return placeholder;
  });

  // Now remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Restore inline tags
  inlineTagPlaceholders.forEach((tag, i) => {
    text = text.replace(`__INLINE_TAG_${i}__`, tag);
  });

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Process inline formatting - convert markdown to HTML if present
function processInlineFormatting(text: string): string {
  let processed = text;

  // Convert markdown bold to HTML (only if not already HTML)
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert markdown italic to HTML (only if not already HTML)
  processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Convert markdown links to HTML (only if not already HTML)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return processed;
}

// Generate blog component from HTML content
function generateBlogComponentFromHTML(htmlContent: string, imageUrls: { [key: number]: string }, title: string): string {
  const elements: string[] = [];
  let html = htmlContent;

  // Handle image placeholders
  html = html.replace(/\[IMAGE:\s*img_\d+\]/g, (match) => {
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
  const blockRegex = /<(h[1-6]|p|ul|ol|blockquote|div)[^>]*>[\s\S]*?<\/\1>|__IMAGE_PLACEHOLDER_\d+__|<br\s*\/?>/gi;
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

    const h1Match = block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      const content = cleanInlineHTML(h1Match[1]);
      if (content.trim()) elements.push(`      <h1>${escapeForJSX(content)}</h1>`);
      continue;
    }

    const h2Match = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Match) {
      const content = cleanInlineHTML(h2Match[1]);
      if (content.trim()) elements.push(`      <h2>${escapeForJSX(content)}</h2>`);
      continue;
    }

    const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3Match) {
      const content = cleanInlineHTML(h3Match[1]);
      if (content.trim()) elements.push(`      <h3>${escapeForJSX(content)}</h3>`);
      continue;
    }

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
      if (items.length > 0) elements.push(`      <ul>\n${items.join('\n')}\n      </ul>`);
      continue;
    }

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
      if (items.length > 0) elements.push(`      <ol>\n${items.join('\n')}\n      </ol>`);
      continue;
    }

    const blockquoteMatch = block.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (blockquoteMatch) {
      const content = cleanInlineHTML(blockquoteMatch[1]);
      if (content.trim()) elements.push(`      <blockquote>${processInlineFormatting(escapeForJSX(content))}</blockquote>`);
      continue;
    }

    const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      const content = cleanInlineHTML(pMatch[1]);
      if (content.trim()) elements.push(`      <p>${processInlineFormatting(escapeForJSX(content))}</p>`);
      continue;
    }

    const divMatch = block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
    if (divMatch) {
      const content = cleanInlineHTML(divMatch[1]);
      if (content.trim()) elements.push(`      <p>${processInlineFormatting(escapeForJSX(content))}</p>`);
      continue;
    }

    const plainText = block.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
    if (plainText) elements.push(`      <p>${processInlineFormatting(escapeForJSX(plainText))}</p>`);
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const originalSlug = formData.get('originalSlug') as string;

    if (!originalSlug) {
      return NextResponse.json({ error: 'Original slug is required' }, { status: 400 });
    }

    // Extract form data
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const excerpt = formData.get('excerpt') as string;
    const contentType = formData.get('contentType') as string;
    const manualContent = formData.get('manualContent') as string;

    const cardImage = formData.get('cardImage') as File | null;
    const coverImage = formData.get('coverImage') as File | null;
    const existingCardImage = formData.get('existingCardImage') as string;
    const existingCoverImage = formData.get('existingCoverImage') as string;

    // Check for required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub API not configured' },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    // Handle images - upload new ones to Vercel Blob if provided
    let cardImagePath = existingCardImage;
    let coverImagePath = existingCoverImage;
    const timestamp = Date.now();

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

    if (cardImage && cardImage.size > 0) {
      const cardImageExt = cardImage.name.split('.').pop();
      const cardImageName = `building-approvals-dubai-${categorySlug}-list-${timestamp}.${cardImageExt}`;
      const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
      const cardImageBlob = await put(`blog/${cardImageName}`, cardImageBuffer, {
        access: 'public',
        contentType: cardImage.type,
      });
      cardImagePath = cardImageBlob.url;
    }

    if (coverImage && coverImage.size > 0) {
      const coverImageExt = coverImage.name.split('.').pop();
      const coverImageName = `building-approvals-dubai-${categorySlug}-cover-${timestamp}.${coverImageExt}`;
      const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const coverImageBlob = await put(`blog/${coverImageName}`, coverImageBuffer, {
        access: 'public',
        contentType: coverImage.type,
      });
      coverImagePath = coverImageBlob.url;
    }

    // File paths
    const blogDataPath = 'src/app/blog/blogData.ts';
    const pagePath = 'src/app/blog/[slug]/page.tsx';
    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const oldContentPath = originalSlug !== slug ? `src/app/blog/[slug]/content/${originalSlug}.tsx` : null;

    // Get all required files in parallel
    const filePromises: Promise<any>[] = [
      octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch }),
      octokit.rest.repos.getContent({ owner, repo, path: pagePath, ref: branch }),
    ];

    // If updating content, try to get existing content file
    if (contentType === 'manual' && manualContent) {
      filePromises.push(
        octokit.rest.repos.getContent({ owner, repo, path: contentPath, ref: branch }).catch(() => null)
      );
    }

    // If slug changed, try to get old content file for deletion
    if (oldContentPath) {
      filePromises.push(
        octokit.rest.repos.getContent({ owner, repo, path: oldContentPath, ref: branch }).catch(() => null)
      );
    }

    const fileResults = await Promise.all(filePromises);
    const blogDataResult = fileResults[0];
    const pageResult = fileResults[1];

    if (!('content' in blogDataResult.data) || !('content' in pageResult.data)) {
      return NextResponse.json({ error: 'Could not read required files' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataResult.data.content, 'base64').toString('utf-8');
    let pageContent = Buffer.from(pageResult.data.content, 'base64').toString('utf-8');

    // Check if blog exists
    const slugExists = blogDataContent.includes(`slug: '${originalSlug}'`) || blogDataContent.includes(`slug: "${originalSlug}"`);
    if (!slugExists) {
      return NextResponse.json({ error: `Blog not found with slug: ${originalSlug}` }, { status: 404 });
    }

    // Parse blog objects from blogData.ts
    const interfaceMatch = blogDataContent.match(/(export interface BlogPost[\s\S]*?}\n)/);
    const arrayStartIndex = blogDataContent.indexOf('export const blogPosts: BlogPost[] = [') + 'export const blogPosts: BlogPost[] = ['.length;
    const arrayEndIndex = blogDataContent.lastIndexOf('];');
    const arrayContent = blogDataContent.substring(arrayStartIndex, arrayEndIndex);

    const blogObjects: string[] = [];
    let depth = 0;
    let currentObject = '';
    let inObject = false;

    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      if (char === '{') {
        if (depth === 0) {
          inObject = true;
          currentObject = '{';
        } else {
          currentObject += char;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        currentObject += char;
        if (depth === 0 && inObject) {
          blogObjects.push(currentObject.trim());
          currentObject = '';
          inObject = false;
        }
      } else if (inObject) {
        currentObject += char;
      }
    }

    // Find the blog to update
    const blogIndex = blogObjects.findIndex(obj =>
      obj.includes(`slug: '${originalSlug}'`) || obj.includes(`slug: "${originalSlug}"`)
    );

    if (blogIndex === -1) {
      return NextResponse.json({ error: `Blog not found with slug: ${originalSlug}` }, { status: 404 });
    }

    const originalBlog = blogObjects[blogIndex];

    // Extract original ID and date
    const idMatch = originalBlog.match(/id:\s*['"](\d+)['"]/);
    const dateMatch = originalBlog.match(/date:\s*['"]([^'"]+)['"]/);
    const id = idMatch ? idMatch[1] : String(Date.now());
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Helper to format string values
    const cleanForString = (text: string): string => {
      let cleaned = text
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.includes("'")) {
        cleaned = cleaned.replace(/"/g, '\\"');
        return `"${cleaned}"`;
      }
      return `'${cleaned}'`;
    };

    // Build updated blog entry
    const updatedBlog = `{
    id: '${id}',
    title: ${cleanForString(title)},
    slug: '${slug}',
    category: ${cleanForString(category)},
    author: ${cleanForString(author)},
    date: '${date}',
    excerpt: ${cleanForString(excerpt)},
    image: '${cardImagePath}',
    coverImage: '${coverImagePath}',
    metaTitle: ${cleanForString(`${title} | Building Approvals Dubai`)},
    metaDescription: ${cleanForString(excerpt)},
    keywords: [${title.split(' ').filter(w => w.length > 3).map(k => `'${k.replace(/'/g, "\\'")}'`).join(', ')}],
    ogImage: '${coverImagePath}',
  }`;

    blogObjects[blogIndex] = updatedBlog;

    // Rebuild blogData.ts
    const interfacePart = interfaceMatch ? interfaceMatch[1] : '';
    const newArrayContent = '\n' + blogObjects.map(obj => '  ' + obj).join(',\n\n') + '\n';
    const newBlogDataContent = `${interfacePart}
export const blogPosts: BlogPost[] = [${newArrayContent}];
`;

    // Prepare content file if manual content changed
    let componentContent: string | null = null;
    if (contentType === 'manual' && manualContent) {
      const imageUrls: { [key: number]: string } = {};

      // Handle content images
      const contentImageKeys = Array.from(formData.keys()).filter(key => key.startsWith('contentImage_'));
      for (const key of contentImageKeys) {
        const indexMatch = key.match(/contentImage_(\d+)/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          const file = formData.get(key) as File;
          if (file && file.size > 0) {
            const imageBuffer = Buffer.from(await file.arrayBuffer());
            const imageExt = file.type.split('/')[1] || 'png';
            const imageName = `building-approvals-dubai-${categorySlug}-content-${index + 1}-${timestamp}.${imageExt}`;
            const imageBlob = await put(`blog/${imageName}`, imageBuffer, {
              access: 'public',
              contentType: file.type,
            });
            imageUrls[index] = imageBlob.url;
          }
        }
      }

      // For updates, wrap the HTML content directly without re-processing
      // The content from the editor is already valid HTML/JSX that was extracted from the component
      // Re-processing it corrupts the formatting (converts <h2> to ## etc.)
      let contentToWrap = manualContent;

      // Handle any image placeholders in the content
      const imagePlaceholderRegex = /\[IMAGE:\s*(img_\d+)\]/g;
      const placeholderMatches = [...manualContent.matchAll(imagePlaceholderRegex)];
      const imageIdToIndex: { [id: string]: number } = {};

      placeholderMatches.forEach((match, index) => {
        imageIdToIndex[match[1]] = index;
      });

      // Replace image placeholders with actual image components if we have new images
      contentToWrap = contentToWrap.replace(imagePlaceholderRegex, (match, id) => {
        const index = imageIdToIndex[id];
        const imageUrl = imageUrls[index];
        if (imageUrl) {
          return `<div style={{ margin: '40px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <img
          src="${imageUrl}"
          alt="Building Approvals Dubai - ${escapeForJSX(title)}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`;
        }
        return match;
      });

      // Wrap the content directly in the JSX component structure
      componentContent = `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
      ${contentToWrap}

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

    // Update page.tsx if slug changed
    const originalPageContent = pageContent;
    if (originalSlug !== slug) {
      // Remove old dynamic import
      const oldDynamicImportPattern = new RegExp(
        `const\\s+\\w+Content\\s*=\\s*dynamic\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*import\\s*\\(\\s*['"]\\.\\/content\\/${originalSlug}['"]\\)[^;]*;\\s*\\n?`,
        'g'
      );
      pageContent = pageContent.replace(oldDynamicImportPattern, '');

      // Remove old static import
      const oldStaticImportPattern = new RegExp(
        `import\\s+\\w+Content\\s+from\\s+['"]\\.\\/content\\/${originalSlug}['"];?\\s*\\n?`,
        'g'
      );
      pageContent = pageContent.replace(oldStaticImportPattern, '');

      // Remove old render case
      const oldRenderCasePattern = new RegExp(
        `\\s*if\\s*\\(post\\.slug\\s*===\\s*['"]${originalSlug}['"]\\)\\s*\\{[\\s\\S]*?return\\s*<\\w+Content\\s*\\/?>\\s*;?\\s*\\}\\s*`,
        'g'
      );
      pageContent = pageContent.replace(oldRenderCasePattern, '\n    ');

      // Add new import and render case
      let newComponentName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      if (/^\d/.test(newComponentName)) {
        const numberWords: { [key: string]: string } = {
          '0': 'Zero_', '1': 'One_', '2': 'Two_', '3': 'Three_', '4': 'Four_',
          '5': 'Five_', '6': 'Six_', '7': 'Seven_', '8': 'Eight_', '9': 'Nine_', '10': 'Ten_'
        };
        const match = newComponentName.match(/^(\d+)/);
        if (match) {
          const num = match[1];
          const prefix = numberWords[num] || `N${num}_`;
          newComponentName = prefix + newComponentName.slice(num.length);
        }
      }

      const newImportStatement = `const ${newComponentName}Content = dynamic(() => import('./content/${slug}').catch(() => () => null), { ssr: true });`;

      // Add new import after last dynamic import
      const dynamicImportMatch = pageContent.match(/const \w+Content = dynamic\([^;]+\);/g);
      if (dynamicImportMatch && dynamicImportMatch.length > 0) {
        const lastDynamicImport = dynamicImportMatch[dynamicImportMatch.length - 1];
        const lastIndex = pageContent.lastIndexOf(lastDynamicImport);
        pageContent = pageContent.slice(0, lastIndex + lastDynamicImport.length) + '\n' + newImportStatement + pageContent.slice(lastIndex + lastDynamicImport.length);
      }

      // Add new render case
      const newRenderCase = `    if (post.slug === '${slug}') {
      return <${newComponentName}Content />;
    }
`;
      const returnNullIndex = pageContent.indexOf('return null;');
      if (returnNullIndex !== -1) {
        pageContent = pageContent.slice(0, returnNullIndex) + newRenderCase + '    ' + pageContent.slice(returnNullIndex);
      }

      // Clean up
      pageContent = pageContent.replace(/\n{3,}/g, '\n\n');
      pageContent = pageContent.replace(/\n\s+\n\s*return null;/g, '\n    return null;');
    }

    // Create a single commit with all changes using Git Data API
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const currentCommitSha = refData.object.sha;

    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: currentCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for all files to update
    const blobPromises: Promise<any>[] = [
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(newBlogDataContent).toString('base64'),
        encoding: 'base64',
      }),
    ];

    // Only create page blob if content changed
    const pageChanged = pageContent !== originalPageContent;
    if (pageChanged) {
      blobPromises.push(
        octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(pageContent).toString('base64'),
          encoding: 'base64',
        })
      );
    }

    // Create content blob if we have content
    if (componentContent) {
      blobPromises.push(
        octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(componentContent).toString('base64'),
          encoding: 'base64',
        })
      );
    }

    const blobResults = await Promise.all(blobPromises);
    const blogDataBlob = blobResults[0];
    let blobIndex = 1;
    const pageBlob = pageChanged ? blobResults[blobIndex++] : null;
    const contentBlob = componentContent ? blobResults[blobIndex++] : null;

    // Build tree entries
    const treeEntries: Array<{
      path: string;
      mode: '100644';
      type: 'blob';
      sha: string | null;
    }> = [
      {
        path: blogDataPath,
        mode: '100644',
        type: 'blob',
        sha: blogDataBlob.data.sha,
      },
    ];

    if (pageBlob) {
      treeEntries.push({
        path: pagePath,
        mode: '100644',
        type: 'blob',
        sha: pageBlob.data.sha,
      });
    }

    if (contentBlob) {
      treeEntries.push({
        path: contentPath,
        mode: '100644',
        type: 'blob',
        sha: contentBlob.data.sha,
      });
    }

    // Delete old content file if slug changed
    if (oldContentPath && fileResults.length > 3 && fileResults[3]) {
      treeEntries.push({
        path: oldContentPath,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
    }

    // Create new tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeEntries,
    });

    // Create commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Update blog: ${title}`,
      tree: newTree.sha,
      parents: [currentCommitSha],
    });

    // Update branch reference
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully. Vercel will redeploy automatically.',
      slug,
      originalSlug: originalSlug !== slug ? originalSlug : undefined,
    });
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update blog' },
      { status: 500 }
    );
  }
}
