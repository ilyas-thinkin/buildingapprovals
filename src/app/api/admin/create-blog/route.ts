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

function generateBlogComponent(blogContent: string, imageUrls: { [key: number]: string }, title: string): string {
  const lines = blogContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: string[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inKeyTakeaways = false;
  let keyTakeawaysContent: string[] = [];
  let hasKeyTakeaways = false;

  // Check if content has Key Takeaways section
  const contentLower = blogContent.toLowerCase();
  hasKeyTakeaways = contentLower.includes('key takeaway') || contentLower.includes('key takeaways');

  // Clean text - remove markdown bold/italic markers and convert to HTML
  const cleanText = (text: string): string => {
    let cleaned = text;
    // Convert **text** to <strong>text</strong>
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Convert *text* to <em>text</em> (but not bullet points)
    cleaned = cleaned.replace(/(?<!\s)\*([^*\s][^*]*[^*\s])\*(?!\s)/g, '<em>$1</em>');
    // Convert [text](url) to <a href="url">text</a>
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Remove any remaining standalone asterisks that aren't bullet points
    cleaned = cleaned.replace(/^\*\*\s*/, '');
    cleaned = cleaned.replace(/\s*\*\*$/, '');
    // Clean up double quotes
    cleaned = cleaned.replace(/[""]([^""]+)[""]/g, '"$1"');
    return cleaned;
  };

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listItems = currentList.map(item => `        <li>${cleanText(item)}</li>`).join('\n');
      elements.push(`      <${listTag}>\n${listItems}\n      </${listTag}>`);
      currentList = [];
      listType = null;
    }
  };

  const isBulletPoint = (line: string): string | null => {
    // Don't treat numbered questions (ending with ?) as bullet points - they're FAQ headings
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
    // Skip empty heading markers (just ### or ## with no text)
    if (/^#{2,6}\s*$/.test(line)) return null;

    // Markdown headings (with or without space after #)
    if (line.startsWith('### ')) return { level: 3, text: cleanText(line.substring(4)) };
    if (line.startsWith('###') && line.length > 3) return { level: 3, text: cleanText(line.substring(3).trim()) };
    if (line.startsWith('## ')) return { level: 2, text: cleanText(line.substring(3)) };
    if (line.startsWith('##') && line.length > 2 && !line.startsWith('###')) return { level: 2, text: cleanText(line.substring(2).trim()) };

    // Numbered FAQ questions (e.g., "1. How many categories are there?")
    const faqMatch = line.match(/^\d+\.\s+(.+\?)$/);
    if (faqMatch) {
      return { level: 3, text: cleanText(faqMatch[1]) };
    }

    // Bold text that looks like a heading (short, no period at end)
    const boldHeading = line.match(/^\*\*([^*]+)\*\*$/);
    if (boldHeading && boldHeading[1].length < 100 && !boldHeading[1].endsWith('.')) {
      return { level: 2, text: boldHeading[1] };
    }

    // Lines ending with colon that are short (likely headings)
    if (line.endsWith(':') && line.length < 80 && !line.includes('.')) {
      return { level: 3, text: cleanText(line) };
    }

    // Common heading patterns
    const headingPatterns = [
      /^(What is|Why|How to|When|Where|Who|Step \d+|Phase \d+|Category \d+|Types of|Benefits of|Requirements for|Documents Required|Common Issues|Tips|Final Thoughts|Conclusion|Overview|Introduction)/i
    ];
    for (const pattern of headingPatterns) {
      if (pattern.test(line) && line.length < 120 && !line.includes('. ')) {
        return { level: 2, text: cleanText(line) };
      }
    }

    return null;
  };

  const isKeyTakeawaysHeading = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('key takeaway') || lower.includes('key takeaways') ||
           lower.includes('pro tip') || lower.includes('pro tips');
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check for image placeholders
    const imageMatch = line.match(/^\[IMAGE_(\d+)\]$/);
    if (imageMatch) {
      const imageIndex = parseInt(imageMatch[1], 10);
      const imageUrl = imageUrls[imageIndex];
      if (imageUrl) {
        flushList();
        if (inKeyTakeaways) {
          // End key takeaways section before image
          const sectionTitle = hasKeyTakeaways ? 'Key Takeaways' : 'Pro Tips';
          const takeawayItems = keyTakeawaysContent.map(item => `        <li>${cleanText(item)}</li>`).join('\n');
          elements.push(`      <div className="key-takeaways-box">
        <h3>${sectionTitle}</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);
          keyTakeawaysContent = [];
          inKeyTakeaways = false;
        }
        elements.push(`      <div style={{ margin: '40px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <img
          src="${imageUrl}"
          alt="Building Approvals Dubai - ${title}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`);
        continue;
      }
    }

    // Check for Key Takeaways / Pro Tips section start
    if (isKeyTakeawaysHeading(line)) {
      flushList();
      inKeyTakeaways = true;
      continue;
    }

    // If in Key Takeaways section, collect content
    if (inKeyTakeaways) {
      const bulletContent = isBulletPoint(line);
      if (bulletContent) {
        keyTakeawaysContent.push(bulletContent);
        continue;
      }
      // Check if we hit a new major heading (end of Key Takeaways)
      const heading = isHeading(line);
      if (heading && heading.level === 2) {
        // Output the Key Takeaways box
        const sectionTitle = hasKeyTakeaways ? 'Key Takeaways' : 'Pro Tips';
        if (keyTakeawaysContent.length > 0) {
          const takeawayItems = keyTakeawaysContent.map(item => `        <li>${cleanText(item)}</li>`).join('\n');
          elements.push(`      <div className="key-takeaways-box">
        <h3>${sectionTitle}</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);
        }
        keyTakeawaysContent = [];
        inKeyTakeaways = false;
        // Now process this line as a heading
        elements.push(`      <h${heading.level}>${heading.text}</h${heading.level}>`);
        continue;
      }
      // Non-bullet content in Key Takeaways - add as bullet anyway
      if (line.length > 0) {
        keyTakeawaysContent.push(line);
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

    // Flush any list before processing non-list content
    flushList();

    // Check for headings
    const heading = isHeading(line);
    if (heading) {
      elements.push(`      <h${heading.level}>${heading.text}</h${heading.level}>`);
      continue;
    }

    // Regular paragraph - clean up any remaining markdown
    if (line.length > 0) {
      const cleanedLine = cleanText(line);
      // Skip lines that are just asterisks or empty after cleaning
      if (cleanedLine.replace(/[*\s]/g, '').length > 0) {
        elements.push(`      <p>${cleanedLine}</p>`);
      }
    }
  }

  // Flush any remaining list
  flushList();

  // If Key Takeaways was the last section
  if (inKeyTakeaways && keyTakeawaysContent.length > 0) {
    const sectionTitle = hasKeyTakeaways ? 'Key Takeaways' : 'Pro Tips';
    const takeawayItems = keyTakeawaysContent.map(item => `        <li>${cleanText(item)}</li>`).join('\n');
    elements.push(`      <div className="key-takeaways-box">
        <h3>${sectionTitle}</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);
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

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
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

    // Check required fields - content can be either file or manual
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

    // Upload images to Vercel Blob with unique timestamp
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

    // Parse content - either from file or manual input
    let blogContent = '';
    let extractedImages: Array<{ data: string; contentType: string; index: number }> = [];

    if (contentType === 'manual' && manualContent) {
      // Use manual content directly
      blogContent = manualContent;
    } else if (contentFile) {
      // Parse content file
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

    // Handle manually uploaded content images
    // The BlogEditor uses [IMAGE: img_xxx] format with timestamp IDs
    // We need to map these to numeric indices and convert in content
    const contentImageKeys = Array.from(formData.keys()).filter(key => key.startsWith('contentImage_'));

    // Find all [IMAGE: xxx] placeholders in the content and map them to indices
    const imagePlaceholderRegex = /\[IMAGE:\s*(img_\d+)\]/g;
    const placeholderMatches = [...blogContent.matchAll(imagePlaceholderRegex)];
    const imageIdToIndex: { [id: string]: number } = {};

    placeholderMatches.forEach((match, index) => {
      imageIdToIndex[match[1]] = index;
    });

    // Convert [IMAGE: img_xxx] to [IMAGE_X] format for generateBlogComponent
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

    // Upload extracted images to Vercel Blob with unique timestamp
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

    // Generate blog component
    const componentContent = generateBlogComponent(blogContent, imageUrls, title);

    // Initialize Octokit
    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    // Verify repository access first
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

    // Create blog component file via GitHub API
    const componentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    try {
      // Check if file already exists to get SHA (required for updates)
      let existingSha: string | undefined;
      try {
        const { data: existingFile } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: componentPath,
          ref: branch,
        });
        if ('sha' in existingFile) {
          existingSha = existingFile.sha;
        }
      } catch (e) {
        // File doesn't exist, which is expected for new blogs
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: componentPath,
        message: existingSha ? `Update blog content component for: ${title}` : `Add blog content component for: ${title}`,
        content: Buffer.from(componentContent).toString('base64'),
        branch,
        ...(existingSha && { sha: existingSha }),
      });
    } catch (createError: any) {
      console.error('Error creating blog component:', createError);
      return NextResponse.json(
        {
          error: 'Failed to create blog component file on GitHub',
          details: createError.message,
          path: componentPath,
          hint: 'Check that the branch name is correct and token has write permissions.'
        },
        { status: 500 }
      );
    }

    // Update blogData.ts
    const blogDataPath = 'src/app/blog/blogData.ts';
    const { data: blogDataFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: blogDataPath,
      ref: branch,
    });

    if ('content' in blogDataFile) {
      const blogDataContent = Buffer.from(blogDataFile.content, 'base64').toString('utf-8');
      const timestamp = Date.now();

      // Helper to clean text for single-line strings (remove line breaks, escape quotes)
      const cleanForString = (text: string): string => {
        return text
          .replace(/[\r\n]+/g, ' ')  // Replace line breaks with space
          .replace(/\s+/g, ' ')       // Collapse multiple spaces
          .replace(/'/g, "\\'")       // Escape single quotes
          .trim();
      };

      const newBlogEntry = `  {
    id: '${timestamp}',
    title: '${cleanForString(title)}',
    slug: '${slug}',
    category: '${cleanForString(category)}',
    author: '${cleanForString(author)}',
    date: '${new Date().toISOString().split('T')[0]}',
    excerpt: '${cleanForString(excerpt)}',
    image: '${cardImageBlob.url}',
    coverImage: '${coverImageBlob.url}',
    metaTitle: '${cleanForString(seoData.metaTitle)}',
    metaDescription: '${cleanForString(seoData.metaDescription)}',
    keywords: [${seoData.keywords.map(k => `'${cleanForString(k)}'`).join(', ')}],
    ogImage: '${coverImageBlob.url}',
  },`;

      const arrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
      if (!arrayMatch) {
        throw new Error('Could not find blogPosts array');
      }

      const replacement = `export const blogPosts: BlogPost[] = [\n${newBlogEntry}\n${arrayMatch[1]}];`;
      const updatedContent = blogDataContent.replace(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/, replacement);

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: blogDataPath,
        message: `Add blog data for: ${title}`,
        content: Buffer.from(updatedContent).toString('base64'),
        branch,
        sha: blogDataFile.sha,
      });
    }

    // Update page.tsx to import and render the new blog
    const pagePath = 'src/app/blog/[slug]/page.tsx';
    const { data: pageFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: pagePath,
      ref: branch,
    });

    if ('content' in pageFile) {
      const pageContent = Buffer.from(pageFile.content, 'base64').toString('utf-8');

      // Generate component name from slug, handling numbers at the start
      let componentName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      // If component name starts with a number, prefix with underscore and convert number to word
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

      const importStatement = `import ${componentName}Content from './content/${slug}';`;
      let updatedPageContent = pageContent;

      if (!updatedPageContent.includes(importStatement)) {
        const lastImportIndex = updatedPageContent.lastIndexOf('import ');
        const nextLineIndex = updatedPageContent.indexOf('\n', lastImportIndex) + 1;
        updatedPageContent = updatedPageContent.slice(0, nextLineIndex) + importStatement + '\n' + updatedPageContent.slice(nextLineIndex);
      }

      const renderCase = `    if (post.slug === '${slug}') {
      return <${componentName}Content />;
    }

    `;

      if (!updatedPageContent.includes(`if (post.slug === '${slug}')`)) {
        const returnNullIndex = updatedPageContent.indexOf('return null;');
        if (returnNullIndex !== -1) {
          updatedPageContent = updatedPageContent.slice(0, returnNullIndex) + renderCase + updatedPageContent.slice(returnNullIndex);
        }
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: pagePath,
        message: `Update page.tsx to render blog: ${title}`,
        content: Buffer.from(updatedPageContent).toString('base64'),
        branch,
        sha: pageFile.sha,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Blog uploaded successfully and automatically committed to GitHub! Vercel will deploy shortly.',
      slug,
      previewUrl: `https://www.buildingapprovals.ae/blog/${slug}`,
      note: 'Wait 2-3 minutes for Vercel to deploy the changes.',
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
