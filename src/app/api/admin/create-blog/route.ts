import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

  // Convert DOCX to HTML with image extraction
  const result = await mammoth.convertToHtml(
    { buffer: contentBuffer },
    {
      convertImage: mammoth.images.imgElement((image: any) => {
        const currentIndex = imageCounter++;
        return image.read('base64').then((imageBuffer: string) => {
          // Store image data for later use
          extractedImages.push({
            data: imageBuffer,
            contentType: image.contentType || 'image/png',
            index: currentIndex
          });

          // Use placeholder in HTML that we'll track
          return {
            src: `IMAGE_PLACEHOLDER_${currentIndex}`
          };
        });
      })
    }
  );

  // Convert HTML to structured text while preserving image placeholders
  let text = result.value;

  // Convert HTML elements to text markers
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

  // Keep image placeholders in the text
  text = text.replace(/<img[^>]*src="IMAGE_PLACEHOLDER_(\d+)"[^>]*>/g, '\n[IMAGE_$1]\n');

  // Remove any remaining HTML tags
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

export async function POST(request: NextRequest) {
  // This API only works in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'Blog creation API is only available in development mode. Please create blogs locally and commit them to the repository.',
        hint: 'Run this in your local development environment using: npm run dev'
      },
      { status: 403 }
    );
  }

  try {
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

    // Create directories if they don't exist
    const blogImagesDir = path.join(process.cwd(), 'public', 'images', 'blog');
    if (!existsSync(blogImagesDir)) {
      await mkdir(blogImagesDir, { recursive: true });
    }

    // Create short category name from title/category (e.g., "DEWA Approvals" -> "dewa-approval")
    const createCategorySlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/s$/, '') // Remove trailing 's' for singular form
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30); // Limit length
    };

    const categorySlug = createCategorySlug(category || title.split(' ').slice(0, 3).join(' '));

    // Save card image with standardized naming: building-approvals-dubai-{category}-list.{ext}
    const cardImageExt = cardImage.name.split('.').pop();
    const cardImageName = `building-approvals-dubai-${categorySlug}-list.${cardImageExt}`;
    const cardImagePath = path.join(blogImagesDir, cardImageName);
    const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
    await writeFile(cardImagePath, cardImageBuffer);

    // Save cover image with standardized naming: building-approvals-dubai-{category}-cover.{ext}
    const coverImageExt = coverImage.name.split('.').pop();
    const coverImageName = `building-approvals-dubai-${categorySlug}-cover.${coverImageExt}`;
    const coverImagePath = path.join(blogImagesDir, coverImageName);
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    await writeFile(coverImagePath, coverImageBuffer);

    // Parse content file (PDF/DOCX)
    let blogContent = '';
    let extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
    const contentBuffer = Buffer.from(await contentFile.arrayBuffer());

    const contentFileName = contentFile.name.toLowerCase();

    if (contentFileName.endsWith('.pdf')) {
      try {
        blogContent = await extractPdfText(contentBuffer);
        console.log('PDF parsed successfully, text length:', blogContent.length);
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError);
        console.error('Error stack:', pdfError.stack);
        return NextResponse.json(
          { error: `PDF parsing failed: ${pdfError.message}. Please ensure pdf-parse is installed.` },
          { status: 500 }
        );
      }
    } else if (contentFileName.endsWith('.docx')) {
      try {
        const docxResult = await extractDocxText(contentBuffer);
        blogContent = docxResult.text;
        extractedImages = docxResult.images;
        console.log('DOCX parsed successfully. Text length:', blogContent.length, 'Images:', extractedImages.length);
      } catch (docxError: any) {
        console.error('DOCX parsing error:', docxError);
        console.error('Error stack:', docxError.stack);
        return NextResponse.json(
          { error: `DOCX parsing failed: ${docxError.message}. Please ensure mammoth is installed.` },
          { status: 500 }
        );
      }
    } else if (contentFileName.endsWith('.doc')) {
      return NextResponse.json(
        { error: 'DOC files are not supported. Please upload a DOCX file.' },
        { status: 400 }
      );
    }

    // Save extracted images from DOCX with standardized naming: building-approvals-dubai-{category}-content.{ext}
    const savedImagePaths: { [key: number]: string } = {};
    for (const img of extractedImages) {
      const imageExt = img.contentType.split('/')[1] || 'png';
      // If multiple images, append index after "content" (e.g., content-2, content-3)
      const imageSuffix = extractedImages.length > 1 ? `content-${img.index + 1}` : 'content';
      const imageName = `building-approvals-dubai-${categorySlug}-${imageSuffix}.${imageExt}`;
      const imagePath = path.join(blogImagesDir, imageName);
      const imageBuffer = Buffer.from(img.data, 'base64');
      await writeFile(imagePath, imageBuffer);
      savedImagePaths[img.index] = `/images/blog/${imageName}`;
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

    // Create blog post component file with image information
    const blogComponentContent = generateBlogComponent(title, blogContent, {
      coverImagePath: `/images/blog/${coverImageName}`,
      altText: `Building Approvals Dubai - ${title}`,
      contentImages: savedImagePaths,
    });
    const componentDir = path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'content');
    if (!existsSync(componentDir)) {
      await mkdir(componentDir, { recursive: true });
    }
    const componentPath = path.join(componentDir, `${slug}.tsx`);
    await writeFile(componentPath, blogComponentContent);

    // Update blogData.ts
    await updateBlogData({
      title,
      slug,
      category,
      author,
      excerpt,
      date: new Date().toISOString().split('T')[0],
      image: `/images/blog/${cardImageName}`,
      coverImage: `/images/blog/${coverImageName}`,
      seo: seoData,
    });

    // Update [slug]/page.tsx to include new blog
    await updateBlogPageImports(slug);

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      slug,
    });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

function generateBlogComponent(title: string, content: string, imageOptions?: { coverImagePath: string; altText: string; contentImages?: { [key: number]: string } }): string {
  // Enhanced content parsing to preserve structure and handle images
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: string[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const processInlineFormatting = (text: string): string => {
    // First, convert markdown to HTML
    let processed = text;

    // Convert **bold** to <strong>
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Now the text may have both existing <strong> tags and converted ones
    // We need to NOT escape the HTML tags we want to keep
    return processed;
  };

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listItems = currentList.map(item => `        <li>${processInlineFormatting(item)}</li>`).join('\n');
      elements.push(`      <${listTag}>\n${listItems}\n      </${listTag}>`);
      currentList = [];
      listType = null;
    }
  };

  const isHeading = (line: string): boolean => {
    // Detect headings by common patterns
    if (line.length < 10) return false;

    // Major section headings
    if (line.match(/^(Overview|Introduction|What is|How to|Step-by-Step|Key Requirements|Process|Conclusion|Important|Categories|Types|Requirements for)/i)) {
      return true;
    }

    // Lines ending with colon (subsection headers)
    if (line.endsWith(':') && line.length < 80) {
      return true;
    }

    // Short lines without much punctuation (likely headers)
    if (line.length < 100 && !line.includes('.') && !line.includes(',')) {
      return true;
    }

    // Numbered steps
    if (line.match(/^(Step \d+|Phase \d+|\d+\.|Category \d+)/i)) {
      return true;
    }

    return false;
  };

  const isKeyTakeaways = (line: string): { isMatch: boolean; fullTitle: string | null } => {
    // Match various formats: "Key Takeaways", "Key Takeaways:", "Key Takeaway on X", etc.
    const simpleMatch = line.match(/^Key Takeaways?:?$/i);
    const extendedMatch = line.match(/^(Key Takeaways? on .+)$/i);

    if (simpleMatch) {
      return { isMatch: true, fullTitle: null };
    }
    if (extendedMatch) {
      return { isMatch: true, fullTitle: extendedMatch[1] };
    }
    return { isMatch: false, fullTitle: null };
  };

  const isBulletPoint = (line: string): string | null => {
    // Detect various bullet point formats
    const bulletPatterns = [
      /^[•●○◦▪▫■□✓✔→➔➤➢⇒]\s+(.+)$/,  // Unicode bullets
      /^[-–—]\s+(.+)$/,  // Dashes
      /^[*]\s+(.+)$/,  // Asterisk
      /^[\d+]\)\s+(.+)$/,  // 1) 2) 3)
      /^[\d+]\.\s+(.+)$/,  // 1. 2. 3.
    ];

    for (const pattern of bulletPatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  };

  const isBoldLabel = (line: string): boolean => {
    // Detect bold labels like "Key Requirements:", "Notes:", "Applicable for:"
    return line.match(/^[A-Z][a-zA-Z\s]+:$/) !== null;
  };

  let inKeyTakeaways = false;
  let keyTakeawaysTitle = 'Key Takeaways';
  const keyTakeawaysContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for image placeholders from DOCX extraction
    const imageMatch = line.match(/^\[IMAGE_(\d+)\]$/);
    if (imageMatch && imageOptions?.contentImages) {
      const imageIndex = parseInt(imageMatch[1], 10);
      const imagePath = imageOptions.contentImages[imageIndex];
      if (imagePath) {
        flushList();
        // Create descriptive alt text for the image
        const imageAltText = imageIndex === 0
          ? imageOptions.altText  // First image uses the main alt text
          : `${imageOptions.altText} - Content Image ${imageIndex + 1}`;  // Subsequent images numbered
        elements.push(`      <div style={{ margin: '40px 0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
        <img
          src="${imagePath}"
          alt="${imageAltText}"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>`);
        continue;
      }
    }

    // Check for Key Takeaways section
    const keyTakeawaysCheck = isKeyTakeaways(line);
    if (keyTakeawaysCheck.isMatch) {
      flushList();
      inKeyTakeaways = true;
      // Store the full title if provided (e.g., "Key Takeaways on DEWA Building Approvals")
      keyTakeawaysTitle = keyTakeawaysCheck.fullTitle || 'Key Takeaways';
      continue;
    }

    // If we're in Key Takeaways section, collect content
    if (inKeyTakeaways) {
      // First, check if this is a bullet point (most Key Takeaways content)
      const bulletContent = isBulletPoint(line);
      if (bulletContent) {
        keyTakeawaysContent.push(processInlineFormatting(bulletContent));
        continue;
      }

      // Check if we've hit another MAJOR heading (end of Key Takeaways)
      // Only end if it's a clear section heading, not just a short line
      const isMajorHeading = line.match(/^(Overview|Introduction|What is|How to|Step-by-Step|Key Requirements|Process|Conclusion|Final Thoughts|Important|Categories|Types|Requirements for|Documents Required|Common Issues|Tips to)/i);
      if (isMajorHeading) {
        // End Key Takeaways section
        inKeyTakeaways = false;

        // Add the Key Takeaways box with the stored title
        const takeawayItems = keyTakeawaysContent.map(item => `        <li>${item}</li>`).join('\n');
        elements.push(`      <div className="key-takeaways-box">
        <h3>${keyTakeawaysTitle}</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);

        // Clear the array and reset title
        keyTakeawaysContent.length = 0;
        keyTakeawaysTitle = 'Key Takeaways';

        // Process this line as a normal heading
        const headingLevel = isBoldLabel(line) || line.endsWith(':') ? 'h3' : 'h2';
        const cleanedLine = processInlineFormatting(line);
        elements.push(`      <${headingLevel}>${cleanedLine}</${headingLevel}>`);
        continue;
      }

      // If it's not a bullet or major heading, add as regular content
      if (line.length > 0) {
        // Handle Pro Tip or other special content
        let processedLine = processInlineFormatting(line);
        processedLine = processedLine.replace(/^(Note|Important|Warning|Tip|Pro Tip):\s*/gi, '<strong>$1:</strong> ');
        keyTakeawaysContent.push(processedLine);
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

    // Check for numbered lists
    if (line.match(/^\d+\.\s+/)) {
      const content = line.replace(/^\d+\.\s+/, '');
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(content);
      continue;
    }

    // If we're here, we're not in a list anymore
    flushList();

    // Check for headings
    if (isHeading(line)) {
      const headingLevel = isBoldLabel(line) || line.endsWith(':') ? 'h3' : 'h2';
      const cleanedLine = processInlineFormatting(line);
      elements.push(`      <${headingLevel}>${cleanedLine}</${headingLevel}>`);
      continue;
    }

    // Check for bold labels in middle of text
    if (isBoldLabel(line)) {
      const cleanedLine = processInlineFormatting(line);
      elements.push(`      <p><strong>${cleanedLine}</strong></p>`);
      continue;
    }

    // Regular paragraph
    if (line.length > 0) {
      // Process inline formatting (convert markdown and keep HTML)
      let processedLine = processInlineFormatting(line);

      // Add emphasis to special labels
      processedLine = processedLine.replace(/^(Note|Important|Warning|Tip|Example):\s*/gi, '<strong>$1:</strong> ');

      elements.push(`      <p>${processedLine}</p>`);
    }
  }

  // If Key Takeaways was the last section
  if (keyTakeawaysContent.length > 0) {
    const takeawayItems = keyTakeawaysContent.map(item => `        <li>${item}</li>`).join('\n');
    elements.push(`      <div className="key-takeaways-box">
        <h3>${keyTakeawaysTitle}</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);
  }

  // Flush any remaining list
  flushList();

  // Don't automatically insert cover image - only use images from the document content
  let contentWithImage = elements.join('\n\n');

  return `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${contentWithImage}

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

async function updateBlogData(blogData: any) {
  const { readFile, writeFile } = await import('fs/promises');
  const blogDataPath = path.join(process.cwd(), 'src', 'app', 'blog', 'blogData.ts');

  let content = await readFile(blogDataPath, 'utf-8');

  // Escape single quotes in the data
  const escapeQuotes = (str: string) => str.replace(/'/g, "\\'");

  const keywordsArray = blogData.seo.keywords.map((k: string) => `'${escapeQuotes(k)}'`).join(', ');

  const newBlogEntry = `  {
    id: '${Date.now()}',
    title: '${escapeQuotes(blogData.title)}',
    slug: '${blogData.slug}',
    category: '${escapeQuotes(blogData.category)}',
    author: '${escapeQuotes(blogData.author)}',
    date: '${blogData.date}',
    excerpt: '${escapeQuotes(blogData.excerpt)}',
    image: '${blogData.image}',
    coverImage: '${blogData.coverImage}',
    metaTitle: '${escapeQuotes(blogData.seo.metaTitle)}',
    metaDescription: '${escapeQuotes(blogData.seo.metaDescription)}',
    keywords: [${keywordsArray}],
    ogImage: '${blogData.coverImage}',
  },`;

  // Find the closing bracket of the array
  const arrayMatch = content.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);

  if (!arrayMatch) {
    throw new Error('Could not find blogPosts array');
  }

  // Insert the new blog entry at the beginning of the array
  const replacement = `export const blogPosts: BlogPost[] = [\n${newBlogEntry}\n${arrayMatch[1]}];`;

  const updatedContent = content.replace(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/, replacement);

  await writeFile(blogDataPath, updatedContent);
}

async function updateBlogPageImports(slug: string) {
  const { readFile, writeFile } = await import('fs/promises');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'blog', '[slug]', 'page.tsx');

  let content = await readFile(pagePath, 'utf-8');

  // Add import
  const componentName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const importStatement = `import ${componentName}Content from './content/${slug}';`;

  // Check if import already exists
  if (!content.includes(importStatement)) {
    // Add import after existing imports
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, nextLineIndex) + importStatement + '\n' + content.slice(nextLineIndex);
  }

  // Add to renderContent function
  const renderContentStart = content.indexOf('const renderContent = () => {');
  const renderContentEnd = content.indexOf('return null;', renderContentStart);

  const newCase = `    if (post.slug === '${slug}') {
      return <${componentName}Content />;
    }

    `;

  // Check if the case already exists
  if (!content.includes(`if (post.slug === '${slug}')`)) {
    content = content.slice(0, renderContentEnd) + newCase + content.slice(renderContentEnd);
  }

  await writeFile(pagePath, content);
}
