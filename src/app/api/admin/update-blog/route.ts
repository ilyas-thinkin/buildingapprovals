import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
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

async function extractDocxText(contentBuffer: Buffer): Promise<string> {
  const mammothModule: any = await import('mammoth');
  const mammoth = mammothModule?.default ?? mammothModule;

  if (typeof mammoth?.convertToHtml !== 'function') {
    throw new Error('Could not load DOCX parser function');
  }

  // Convert DOCX to HTML to preserve formatting and structure
  const result = await mammoth.convertToHtml(
    { buffer: contentBuffer },
    {
      convertImage: mammoth.images.imgElement((image: any) => {
        return image.read('base64').then((imageBuffer: string) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`
          };
        });
      })
    }
  );

  // Convert HTML back to plain text while preserving structure
  let text = result.value;

  // Convert HTML elements to text markers
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/g, '\n$1\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n$1\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n$1:\n');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n');
  text = text.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');
  text = text.replace(/<br\s*\/?>/g, '\n');
  text = text.replace(/<img[^>]*>/g, ''); // Remove base64 images for now, they're too large
  text = text.replace(/<[^>]+>/g, ''); // Remove any remaining HTML tags
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');

  return text.trim();
}

function generateBlogComponent(title: string, content: string): string {
  // Enhanced PDF content parsing to preserve structure
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const elements: string[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const listTag = listType === 'ul' ? 'ul' : 'ol';
      const listItems = currentList.map(item => `        <li>${escapeHtml(item)}</li>`).join('\n');
      elements.push(`      <${listTag}>\n${listItems}\n      </${listTag}>`);
      currentList = [];
      listType = null;
    }
  };

  const escapeHtml = (text: string): string => {
    // First convert markdown links to HTML anchors with placeholder
    let result = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '%%LINK_START%%$2%%LINK_MID%%$1%%LINK_END%%');
    // Escape HTML entities
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    // Restore links with proper HTML
    result = result.replace(/%%LINK_START%%([^%]+)%%LINK_MID%%([^%]+)%%LINK_END%%/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>');
    return result;
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

  const isKeyTakeaways = (line: string): boolean => {
    return line.match(/^Key Takeaways?$/i) !== null;
  };

  let inKeyTakeaways = false;
  const keyTakeawaysContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Key Takeaways section
    if (isKeyTakeaways(line)) {
      flushList();
      inKeyTakeaways = true;
      continue;
    }

    // If we're in Key Takeaways section, collect content
    if (inKeyTakeaways) {
      // Check if we've hit another major heading (end of Key Takeaways)
      if (isHeading(line) && !line.match(/^Pro Tip:/i)) {
        // End Key Takeaways section
        inKeyTakeaways = false;

        // Add the Key Takeaways box
        const takeawayItems = keyTakeawaysContent.map(item => `        <li>${item}</li>`).join('\n');
        elements.push(`      <div className="key-takeaways-box">
        <h3>Key Takeaways</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);

        // Clear the array
        keyTakeawaysContent.length = 0;

        // Process this line as a normal heading
        const headingLevel = isBoldLabel(line) || line.endsWith(':') ? 'h3' : 'h2';
        elements.push(`      <${headingLevel}>${escapeHtml(line)}</${headingLevel}>`);
        continue;
      }

      // Add content to Key Takeaways
      const bulletContent = isBulletPoint(line);
      if (bulletContent) {
        keyTakeawaysContent.push(escapeHtml(bulletContent));
      } else if (line.length > 0) {
        // Handle Pro Tip or other special content
        let processedLine = line;
        processedLine = processedLine.replace(/^(Pro Tip|Note|Important|Warning):\s*/gi, '<strong>$1:</strong> ');
        processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
      elements.push(`      <${headingLevel}>${escapeHtml(line)}</${headingLevel}>`);
      continue;
    }

    // Check for bold labels in middle of text
    if (isBoldLabel(line)) {
      elements.push(`      <p><strong>${escapeHtml(line)}</strong></p>`);
      continue;
    }

    // Regular paragraph
    if (line.length > 0) {
      // Check if line contains inline bold patterns like "Note:", "Important:"
      let processedLine = line;
      processedLine = processedLine.replace(/^(Note|Important|Warning|Tip|Example):\s*/gi, '<strong>$1:</strong> ');
      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      elements.push(`      <p>${escapeHtml(processedLine)}</p>`);
    }
  }

  // If Key Takeaways was the last section
  if (keyTakeawaysContent.length > 0) {
    const takeawayItems = keyTakeawaysContent.map(item => `        <li>${item}</li>`).join('\n');
    elements.push(`      <div className="key-takeaways-box">
        <h3>Key Takeaways</h3>
        <ul>
${takeawayItems}
        </ul>
      </div>`);
  }

  // Flush any remaining list
  flushList();

  const formattedContent = elements.join('\n\n');

  return `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
${formattedContent}

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
    const contentFile = formData.get('contentFile') as File | null;

    const cardImage = formData.get('cardImage') as File | null;
    const coverImage = formData.get('coverImage') as File | null;
    const existingCardImage = formData.get('existingCardImage') as string;
    const existingCoverImage = formData.get('existingCoverImage') as string;

    // Read current blogData.ts
    const blogDataPath = path.join(process.cwd(), 'src/app/blog/blogData.ts');
    let blogDataContent = await fs.readFile(blogDataPath, 'utf-8');

    // Find and update the blog entry
    const blogArrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!blogArrayMatch) {
      return NextResponse.json({ error: 'Could not parse blog data' }, { status: 500 });
    }

    // Parse individual blog objects - handle both with and without trailing commas
    const blogsText = blogArrayMatch[1].trim();

    // Split by object boundaries using a more flexible regex that handles multi-line objects
    const blogMatches = blogsText.match(/\{[\s\S]*?slug:\s*'[^']*'[\s\S]*?\}/g);
    if (!blogMatches || blogMatches.length === 0) {
      return NextResponse.json({ error: 'Could not parse blog objects' }, { status: 500 });
    }

    // Find the blog to update
    const blogIndex = blogMatches.findIndex(blogStr => blogStr.includes(`slug: '${originalSlug}'`));
    if (blogIndex === -1) {
      return NextResponse.json({ error: `Blog not found with slug: ${originalSlug}` }, { status: 404 });
    }

    const blogObjects = blogMatches;

    // Extract current blog data
    const currentBlog = blogObjects[blogIndex];
    const idMatch = currentBlog.match(/id: '(\d+)'/);
    const dateMatch = currentBlog.match(/date: '([^']+)'/);
    const id = idMatch ? idMatch[1] : '1';
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Handle images
    let cardImagePath = existingCardImage;
    let coverImagePath = existingCoverImage;

    if (cardImage) {
      const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
      const cardImageName = `${slug}-card.jpg`;
      const cardImageFilePath = path.join(process.cwd(), 'public/images/blog', cardImageName);
      await fs.writeFile(cardImageFilePath, cardImageBuffer);
      cardImagePath = `/images/blog/${cardImageName}`;
    }

    if (coverImage) {
      const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
      const coverImageName = `${slug}-cover.jpg`;
      const coverImageFilePath = path.join(process.cwd(), 'public/images/blog', coverImageName);
      await fs.writeFile(coverImageFilePath, coverImageBuffer);
      coverImagePath = `/images/blog/${coverImageName}`;
    }

    // Build updated blog entry
    const updatedBlog = `{
    id: '${id}',
    title: '${title.replace(/'/g, "\\'")}',
    excerpt: '${excerpt.replace(/'/g, "\\'")}',
    date: '${date}',
    author: '${author}',
    category: '${category}',
    image: '${cardImagePath}',
    coverImage: '${coverImagePath}',
    slug: '${slug}',
  }`;

    // Replace the blog entry
    blogObjects[blogIndex] = updatedBlog;
    const newBlogsArray = blogObjects.join(',\n  ');
    blogDataContent = blogDataContent.replace(
      /export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/,
      `export const blogPosts: BlogPost[] = [\n  ${newBlogsArray}\n];`
    );

    // Write updated blogData.ts
    await fs.writeFile(blogDataPath, blogDataContent, 'utf-8');

    // Update content file if manual content changed or a new file was uploaded
    if (contentType === 'file' && contentFile) {
      const contentBuffer = Buffer.from(await contentFile.arrayBuffer());
      const contentFileName = contentFile.name.toLowerCase();
      let blogContent = '';

      try {
        if (contentFileName.endsWith('.pdf')) {
          blogContent = await extractPdfText(contentBuffer);
        } else if (contentFileName.endsWith('.docx')) {
          blogContent = await extractDocxText(contentBuffer);
        } else if (contentFileName.endsWith('.doc')) {
          return NextResponse.json(
            { error: 'DOC files are not supported. Please upload a DOCX file.' },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { error: 'Unsupported content file type' },
            { status: 400 }
          );
        }
      } catch (parseError: any) {
        console.error('Content parsing error:', parseError);
        console.error('Error stack:', parseError.stack);
        return NextResponse.json(
          { error: `Content parsing failed: ${parseError.message}` },
          { status: 500 }
        );
      }

      const contentDir = path.join(process.cwd(), 'src/app/blog/[slug]/content');
      const contentFilePath = path.join(contentDir, `${slug}.tsx`);
      const componentContent = generateBlogComponent(title, blogContent);
      await fs.writeFile(contentFilePath, componentContent, 'utf-8');
    } else if (contentType === 'manual' && manualContent) {
      const contentDir = path.join(process.cwd(), 'src/app/blog/[slug]/content');
      const contentFilePath = path.join(contentDir, `${slug}.tsx`);

      // Use the enhanced content parser
      const componentContent = generateBlogComponent(title, manualContent);
      await fs.writeFile(contentFilePath, componentContent, 'utf-8');
    }

    // If slug changed, rename directory
    if (originalSlug !== slug) {
      const oldDir = path.join(process.cwd(), 'src/app/blog', originalSlug);
      const newDir = path.join(process.cwd(), 'src/app/blog', slug);

      try {
        await fs.rename(oldDir, newDir);
      } catch (error) {
        console.error('Error renaming directory:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      slug: slug,
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
