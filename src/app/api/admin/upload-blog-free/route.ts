import { NextRequest, NextResponse } from 'next/server';

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

    // Convert images to base64 for downloading
    const cardImageExt = cardImage.name.split('.').pop();
    const cardImageName = `building-approvals-dubai-${categorySlug}-list.${cardImageExt}`;
    const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
    const cardImageBase64 = cardImageBuffer.toString('base64');

    const coverImageExt = coverImage.name.split('.').pop();
    const coverImageName = `building-approvals-dubai-${categorySlug}-cover.${coverImageExt}`;
    const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
    const coverImageBase64 = coverImageBuffer.toString('base64');

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

    // Prepare content images as base64
    const contentImages: Array<{ filename: string; base64: string; contentType: string }> = [];
    for (const img of extractedImages) {
      const imageExt = img.contentType.split('/')[1] || 'png';
      const imageSuffix = extractedImages.length > 1 ? `content-${img.index + 1}` : 'content';
      const imageName = `building-approvals-dubai-${categorySlug}-${imageSuffix}.${imageExt}`;

      contentImages.push({
        filename: imageName,
        base64: img.data,
        contentType: img.contentType
      });
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

    // Generate blog data object
    const blogData = {
      id: timestamp.toString(),
      title,
      slug,
      category,
      author,
      date: new Date().toISOString().split('T')[0],
      excerpt,
      image: `/images/blog/${cardImageName}`,
      coverImage: `/images/blog/${coverImageName}`,
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      keywords: seoData.keywords,
      ogImage: `/images/blog/${coverImageName}`,
    };

    // Format blog content with image placeholders
    let formattedContent = blogContent;
    contentImages.forEach((img, index) => {
      formattedContent = formattedContent.replace(
        `[IMAGE_${index}]`,
        `<img src="/images/blog/${img.filename}" alt="Building Approvals Dubai - ${title}" />`
      );
    });

    // Return all data for manual processing
    return NextResponse.json({
      success: true,
      message: '100% FREE - Download images and add blog manually to your repository',
      blogData,
      blogContent: formattedContent,
      images: {
        cardImage: {
          filename: cardImageName,
          base64: cardImageBase64,
          contentType: cardImage.type,
          downloadUrl: `data:${cardImage.type};base64,${cardImageBase64}`
        },
        coverImage: {
          filename: coverImageName,
          base64: coverImageBase64,
          contentType: coverImage.type,
          downloadUrl: `data:${coverImage.type};base64,${coverImageBase64}`
        },
        contentImages: contentImages.map(img => ({
          filename: img.filename,
          base64: img.base64,
          contentType: img.contentType,
          downloadUrl: `data:${img.contentType};base64,${img.base64}`
        }))
      },
      instructions: {
        step1: 'Download all images using the downloadUrl links provided',
        step2: 'Save images to: public/images/blog/ directory in your local project',
        step3: 'Add the blogData object to src/app/blog/blogData.ts',
        step4: `Create file: src/app/blog/[slug]/content/${slug}.tsx with the blog content`,
        step5: 'Update src/app/blog/[slug]/page.tsx to import and render the new blog',
        step6: 'Commit and push: git add . && git commit -m "Add new blog" && git push'
      }
    });
  } catch (error: any) {
    console.error('Error processing blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process blog' },
      { status: 500 }
    );
  }
}
