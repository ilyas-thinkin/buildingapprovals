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

  // Convert HTML to text
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

  // Decode HTML entities
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
  // Enhanced content parsing
  const lines = blogContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: string[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listItems = currentList.map(item => `        <li>${item}</li>`).join('\n');
      elements.push(`      <${listTag}>\n${listItems}\n      </${listTag}>`);
      currentList = [];
      listType = null;
    }
  };

  const isBulletPoint = (line: string): string | null => {
    const bulletPatterns = [
      /^[•●○◦▪▫■□✓✔→➔➤➢⇒]\s+(.+)$/,
      /^[-–—]\s+(.+)$/,
      /^[*]\s+(.+)$/,
    ];
    for (const pattern of bulletPatterns) {
      const match = line.match(pattern);
      if (match) return match[1] || match[0];
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
          alt="Building Approvals Dubai - ${title}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`);
        continue;
      }
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

    // If we're here, flush any list
    flushList();

    // Check for headings
    if (line.startsWith('## ')) {
      elements.push(`      <h2>${line.substring(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      elements.push(`      <h3>${line.substring(4)}</h3>`);
    } else if (line.length > 0) {
      // Regular paragraph
      elements.push(`      <p>${line}</p>`);
    }
  }

  // Flush any remaining list
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

export async function POST(request: NextRequest) {
  try {
    // Check required environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Vercel Blob storage is not configured. Please add BLOB_READ_WRITE_TOKEN.' },
        { status: 500 }
      );
    }

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          error: 'GitHub token not configured. Please add GITHUB_TOKEN to environment variables.',
          hint: 'Create a GitHub Personal Access Token with repo permissions at: https://github.com/settings/tokens'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    // Extract form fields
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

    // Extract files
    const cardImage = formData.get('cardImage') as File;
    const coverImage = formData.get('coverImage') as File;
    const contentFile = formData.get('contentFile') as File;

    if (!title || !slug || !cardImage || !coverImage || !contentFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Upload card image to Vercel Blob
    const cardImageExt = cardImage.name.split('.').pop();
    const cardImageName = `building-approvals-dubai-${categorySlug}-list.${cardImageExt}`;
    const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
    const cardImageBlob = await put(`blog/${cardImageName}`, cardImageBuffer, {
      access: 'public',
      contentType: cardImage.type,
    });

    // Upload cover image to Vercel Blob
    const coverImageExt = coverImage.name.split('.').pop();
    const coverImageName = `building-approvals-dubai-${categorySlug}-cover.${coverImageExt}`;
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    const coverImageBlob = await put(`blog/${coverImageName}`, coverImageBuffer, {
      access: 'public',
      contentType: coverImage.type,
    });

    // Parse content file
    let blogContent = '';
    let extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
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

    // Upload extracted images to Vercel Blob
    const savedImageUrls: { [key: number]: string } = {};
    for (const img of extractedImages) {
      const imageExt = img.contentType.split('/')[1] || 'png';
      const imageSuffix = extractedImages.length > 1 ? `content-${img.index + 1}` : 'content';
      const imageName = `building-approvals-dubai-${categorySlug}-${imageSuffix}.${imageExt}`;
      const imageBuffer = Buffer.from(img.data, 'base64');

      const imageBlob = await put(`blog/${imageName}`, imageBuffer, {
        access: 'public',
        contentType: img.contentType,
      });

      savedImageUrls[img.index] = imageBlob.url;
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

    // Generate blog component content
    const componentContent = generateBlogComponent(blogContent, savedImageUrls, title);

    // Initialize GitHub API
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = process.env.GITHUB_OWNER || 'ilyas-thinkin';
    const repo = process.env.GITHUB_REPO || 'buildingapprovals';
    const branch = process.env.GITHUB_BRANCH || 'master';

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
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: componentPath,
        message: `Add blog content component for: ${title}`,
        content: Buffer.from(componentContent).toString('base64'),
        branch,
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
      const currentContent = Buffer.from(blogDataFile.content, 'base64').toString('utf-8');

      const newBlogEntry = `  {
    id: '${timestamp}',
    title: '${title.replace(/'/g, "\\'")}',
    slug: '${slug}',
    category: '${category.replace(/'/g, "\\'")}',
    author: '${author.replace(/'/g, "\\'")}',
    date: '${new Date().toISOString().split('T')[0]}',
    excerpt: '${excerpt.replace(/'/g, "\\'")}',
    image: '${cardImageBlob.url}',
    coverImage: '${coverImageBlob.url}',
    metaTitle: '${seoData.metaTitle.replace(/'/g, "\\'")}',
    metaDescription: '${seoData.metaDescription.replace(/'/g, "\\'")}',
    keywords: [${seoData.keywords.map(k => `'${k.replace(/'/g, "\\'")}'`).join(', ')}],
    ogImage: '${coverImageBlob.url}',
  },`;

      const updatedContent = currentContent.replace(
        /export const blogPosts: BlogPost\[\] = \[/,
        `export const blogPosts: BlogPost[] = [\n${newBlogEntry}`
      );

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

      // Generate component name from slug
      const componentName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      // Add import statement
      const importStatement = `import ${componentName}Content from './content/${slug}';`;

      let updatedPageContent = pageContent;

      // Check if import doesn't exist
      if (!updatedPageContent.includes(importStatement)) {
        // Find the last import and add after it
        const lastImportIndex = updatedPageContent.lastIndexOf('import ');
        const nextLineIndex = updatedPageContent.indexOf('\n', lastImportIndex) + 1;
        updatedPageContent = updatedPageContent.slice(0, nextLineIndex) + importStatement + '\n' + updatedPageContent.slice(nextLineIndex);
      }

      // Add render case
      const renderCase = `    if (post.slug === '${slug}') {
      return <${componentName}Content />;
    }

    `;

      // Check if render case doesn't exist
      if (!updatedPageContent.includes(`if (post.slug === '${slug}')`)) {
        // Find "return null;" in renderContent function and add before it
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
