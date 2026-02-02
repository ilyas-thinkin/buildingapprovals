import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

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

export async function POST(request: NextRequest) {
  try {
    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: 'Vercel Blob storage is not configured. Please add BLOB_READ_WRITE_TOKEN to your environment variables.',
          hint: 'Visit https://vercel.com/docs/storage/vercel-blob to set up Blob storage.'
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

    // Parse content file (PDF/DOCX)
    let blogContent = '';
    let extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
    const contentBuffer = Buffer.from(await contentFile.arrayBuffer());
    const contentFileName = contentFile.name.toLowerCase();

    if (contentFileName.endsWith('.pdf')) {
      try {
        blogContent = await extractPdfText(contentBuffer);
      } catch (pdfError: any) {
        return NextResponse.json(
          { error: `PDF parsing failed: ${pdfError.message}` },
          { status: 500 }
        );
      }
    } else if (contentFileName.endsWith('.docx')) {
      try {
        const docxResult = await extractDocxText(contentBuffer);
        blogContent = docxResult.text;
        extractedImages = docxResult.images;
      } catch (docxError: any) {
        return NextResponse.json(
          { error: `DOCX parsing failed: ${docxError.message}` },
          { status: 500 }
        );
      }
    } else if (contentFileName.endsWith('.doc')) {
      return NextResponse.json(
        { error: 'DOC files are not supported. Please upload a DOCX file.' },
        { status: 400 }
      );
    }

    // Upload extracted images from DOCX to Vercel Blob
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

    // Return the blog data that needs to be manually added to the codebase
    const blogData = {
      id: timestamp.toString(),
      title,
      slug,
      category,
      author,
      date: new Date().toISOString().split('T')[0],
      excerpt,
      image: cardImageBlob.url,
      coverImage: coverImageBlob.url,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      keywords: seoData.keywords,
      ogImage: coverImageBlob.url,
    };

    // Generate blog content with Blob URLs
    const contentWithImages = blogContent.replace(
      /\[IMAGE_(\d+)\]/g,
      (match, index) => {
        const imageUrl = savedImageUrls[parseInt(index)];
        return imageUrl ? `\n<img src="${imageUrl}" alt="Building Approvals Dubai - ${title}" />\n` : match;
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Blog images uploaded successfully to Vercel Blob. Please add the blog data and content to your repository manually.',
      blogData,
      blogContent: contentWithImages,
      instructions: {
        step1: 'Add the blogData object to src/app/blog/blogData.ts',
        step2: `Create a new file: src/app/blog/[slug]/content/${slug}.tsx with the blog content`,
        step3: 'Commit and push the changes to deploy (page.tsx auto-loads content by slug)',
      }
    });
  } catch (error: any) {
    console.error('Error uploading blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload blog' },
      { status: 500 }
    );
  }
}
