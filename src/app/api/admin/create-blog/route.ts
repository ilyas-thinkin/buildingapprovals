import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
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
    const blogImagesDir = path.join(process.cwd(), 'public', 'Blogs');
    if (!existsSync(blogImagesDir)) {
      await mkdir(blogImagesDir, { recursive: true });
    }

    // Save card image
    const cardImageExt = cardImage.name.split('.').pop();
    const cardImageName = `${slug}-card.${cardImageExt}`;
    const cardImagePath = path.join(blogImagesDir, cardImageName);
    const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
    await writeFile(cardImagePath, cardImageBuffer);

    // Save cover image
    const coverImageExt = coverImage.name.split('.').pop();
    const coverImageName = `${slug}-cover.${coverImageExt}`;
    const coverImagePath = path.join(blogImagesDir, coverImageName);
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    await writeFile(coverImagePath, coverImageBuffer);

    // Parse content file (PDF/DOCX)
    let blogContent = '';
    const contentBuffer = Buffer.from(await contentFile.arrayBuffer());

    if (contentFile.name.endsWith('.pdf')) {
      const pdfData = await pdf(contentBuffer);
      blogContent = pdfData.text;
    } else if (contentFile.name.endsWith('.docx') || contentFile.name.endsWith('.doc')) {
      // For DOCX, we'll use a simple text extraction (you may want to use mammoth.js for better formatting)
      blogContent = 'DOCX content extraction - please implement with mammoth.js';
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

    // Create blog post component file
    const blogComponentContent = generateBlogComponent(title, blogContent);
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
      image: `/Blogs/${cardImageName}`,
      coverImage: `/Blogs/${coverImageName}`,
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

function generateBlogComponent(title: string, content: string): string {
  // Convert plain text to React component with basic formatting
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  const formattedContent = paragraphs
    .map(para => {
      const trimmed = para.trim();
      // Check if it's a heading (simple heuristic)
      if (trimmed.length < 100 && !trimmed.includes('.')) {
        return `      <h2>${trimmed}</h2>`;
      }
      return `      <p>${trimmed}</p>`;
    })
    .join('\n\n');

  return `export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
      <div className="blog-intro">
        This blog post was automatically generated from your document.
      </div>

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

async function updateBlogData(blogData: any) {
  const { readFile, writeFile } = await import('fs/promises');
  const blogDataPath = path.join(process.cwd(), 'src', 'app', 'blog', 'blogData.ts');

  let content = await readFile(blogDataPath, 'utf-8');

  // Find the blogPosts array
  const arrayStart = content.indexOf('export const blogPosts');
  const arrayContent = content.substring(arrayStart);
  const closingBracket = arrayContent.lastIndexOf('];');

  const newBlogEntry = `  {
    id: ${Date.now()},
    title: "${blogData.title}",
    slug: "${blogData.slug}",
    category: "${blogData.category}",
    author: "${blogData.author}",
    date: "${blogData.date}",
    excerpt: "${blogData.excerpt}",
    image: "${blogData.image}",
    coverImage: "${blogData.coverImage}",
  },`;

  const beforeArray = content.substring(0, arrayStart + arrayContent.indexOf('[') + 1);
  const afterClosing = content.substring(arrayStart + closingBracket);

  const updatedContent = beforeArray + '\n' + newBlogEntry + '\n' + arrayContent.substring(arrayContent.indexOf('[') + 1, closingBracket) + afterClosing;

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

  const importStatement = `import ${componentName}Content from './content/${slug}';\n`;

  // Add import after existing imports
  const lastImportIndex = content.lastIndexOf('import ');
  const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
  content = content.slice(0, nextLineIndex) + importStatement + content.slice(nextLineIndex);

  // Add to renderContent function
  const renderContentStart = content.indexOf('const renderContent = () => {');
  const renderContentEnd = content.indexOf('return null;', renderContentStart);

  const newCase = `    if (post.slug === '${slug}') {
      return <${componentName}Content />;
    }

    `;

  content = content.slice(0, renderContentEnd) + newCase + content.slice(renderContentEnd);

  await writeFile(pagePath, content);
}
