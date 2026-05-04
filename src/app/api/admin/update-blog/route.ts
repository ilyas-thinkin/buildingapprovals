import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Octokit } from 'octokit';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { generateBlogComponentFromHTML, generateBlogComponentFromMarkdown } from '@/lib/blog-generator';
import { cleanBlogAssetUrl, cleanBlogMetaTitle, cleanBlogPlainText, cleanBlogSlugText, toTsStringLiteral } from '@/lib/blog-seo';

function getErrMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

interface ExtractedDocxContent {
  text: string;
  images: Array<{ data: string; contentType: string; index: number }>;
}

async function extractPdfText(contentBuffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule: any = await import('pdf-parse');
  const PDFParseClass = pdfParseModule?.PDFParse ?? pdfParseModule?.default?.PDFParse;

  if (typeof PDFParseClass === 'function') {
    const parser = new PDFParseClass({ data: contentBuffer });
    try {
      const textResult = await parser.getText();
      return textResult?.text ?? '';
    } finally {
      if (typeof parser.destroy === 'function') await parser.destroy();
    }
  }

  const pdfParseFn =
    (typeof pdfParseModule === 'function' && pdfParseModule) ||
    (typeof pdfParseModule?.default === 'function' && pdfParseModule.default) ||
    (typeof pdfParseModule?.default?.default === 'function' && pdfParseModule.default.default) ||
    null;

  if (!pdfParseFn) throw new Error('Could not load PDF parser');
  const pdfData = await pdfParseFn(contentBuffer);
  return pdfData?.text ?? '';
}

async function extractDocxText(contentBuffer: Buffer): Promise<ExtractedDocxContent> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mammothModule: any = await import('mammoth');
  const mammoth = mammothModule?.default ?? mammothModule;
  if (typeof mammoth?.convertToHtml !== 'function') throw new Error('Could not load DOCX parser');

  const extractedImages: Array<{ data: string; contentType: string; index: number }> = [];
  let imageCounter = 0;

  const result = await mammoth.convertToHtml(
    { buffer: contentBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h3:fresh",
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      convertImage: mammoth.images.imgElement((image: any) => {
        const currentIndex = imageCounter++;
        return image.read('base64').then((imageBuffer: string) => {
          extractedImages.push({ data: imageBuffer, contentType: image.contentType || 'image/png', index: currentIndex });
          return { src: `IMAGE_PLACEHOLDER_${currentIndex}` };
        });
      })
    }
  );

  let html = result.value;
  html = html.replace(/<img[^>]*src="IMAGE_PLACEHOLDER_(\d+)"[^>]*\/?>/gi, '[IMAGE_$1]');

  return { text: html, images: extractedImages };
}

async function uploadToVercelBlob(data: Buffer, key: string, contentType: string): Promise<string> {
  const { url } = await put(key, data, { access: 'public', contentType });
  return url;
}

function validateImage(file: File, label: string): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (!allowedTypes.includes(file.type) || !allowedExts.includes(ext)) {
    return `${label} must be a JPG, PNG, WEBP, or AVIF image`;
  }

  if (file.size > 10 * 1024 * 1024) {
    return `${label} must be smaller than 10 MB`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const originalSlug = formData.get('originalSlug') as string;

    if (!originalSlug) {
      return NextResponse.json({ error: 'Original slug is required' }, { status: 400 });
    }

    // Extract form data
    const title = cleanBlogPlainText(formData.get('title') as string || '', 180);
    let slug = (formData.get('slug') as string || '').trim();
    const category = cleanBlogPlainText(formData.get('category') as string || '', 120);
    const author = cleanBlogPlainText(formData.get('author') as string || 'Building Approvals Dubai', 120);
    const excerpt = cleanBlogPlainText(formData.get('excerpt') as string || '', 500);
    const contentType = (formData.get('contentType') as string || 'manual');
    const manualContent = (formData.get('manualContent') as string || '').trim();
    const contentFile = formData.get('contentFile') as File | null;
    const manualSEO = formData.get('manualSEO') === 'true';
    const metaTitle = cleanBlogPlainText(formData.get('metaTitle') as string || '', 180);
    const metaDescription = cleanBlogPlainText(formData.get('metaDescription') as string || '', 500);
    const keywords = cleanBlogPlainText(formData.get('keywords') as string || '', 500);
    const imageAlt = cleanBlogPlainText(formData.get('imageAlt') as string || `Building Approvals Dubai - ${title}`, 180);

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    slug = cleanBlogSlugText(slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) {
      return NextResponse.json({ error: 'Slug must contain at least one letter or number' }, { status: 400 });
    }

    if (contentFile && contentFile.size > 0) {
      const fileName = contentFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        return NextResponse.json({ error: 'Only PDF and DOCX content files are supported' }, { status: 400 });
      }
      if (contentFile.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'Content file must be smaller than 20 MB' }, { status: 400 });
      }
    }

    const cardImage = formData.get('cardImage') as File | null;
    const coverImage = formData.get('coverImage') as File | null;
    const existingCardImage = cleanBlogAssetUrl(formData.get('existingCardImage') as string || '');
    const existingCoverImage = cleanBlogAssetUrl(formData.get('existingCoverImage') as string || '');

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

    // Handle images - upload new ones to Netlify Blob if provided
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
      const cardErr = validateImage(cardImage, 'Card image');
      if (cardErr) return NextResponse.json({ error: cardErr }, { status: 400 });
      const cardImageExt = cardImage.name.split('.').pop();
      const cardImageName = `building-approvals-dubai-${categorySlug}-list-${timestamp}.${cardImageExt}`;
      const cardImageBuffer = Buffer.from(await cardImage.arrayBuffer());
      cardImagePath = await uploadToVercelBlob(cardImageBuffer, cardImageName, cardImage.type);
    }

    if (coverImage && coverImage.size > 0) {
      const coverErr = validateImage(coverImage, 'Cover image');
      if (coverErr) return NextResponse.json({ error: coverErr }, { status: 400 });
      const coverImageExt = coverImage.name.split('.').pop();
      const coverImageName = `building-approvals-dubai-${categorySlug}-cover-${timestamp}.${coverImageExt}`;
      const coverImageBuffer = Buffer.from(await coverImage.arrayBuffer());
      coverImagePath = await uploadToVercelBlob(coverImageBuffer, coverImageName, coverImage.type);
    }

    // File paths
    const blogDataPath = 'src/app/blog/blogData.ts';
    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const oldContentPath = originalSlug !== slug ? `src/app/blog/[slug]/content/${originalSlug}.tsx` : null;

    // Get all required files in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filePromises: Promise<any>[] = [
      octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch }),
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

    if (!('content' in blogDataResult.data)) {
      return NextResponse.json({ error: 'Could not read required files' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataResult.data.content, 'base64').toString('utf-8');

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

    const slugConflictIndex = blogObjects.findIndex((obj, index) =>
      index !== blogIndex && (obj.includes(`slug: '${slug}'`) || obj.includes(`slug: "${slug}"`))
    );
    if (slugConflictIndex !== -1) {
      return NextResponse.json({ error: `Another blog already uses the slug "${slug}"` }, { status: 409 });
    }

    const originalBlog = blogObjects[blogIndex];

    // Extract original ID and date
    const idMatch = originalBlog.match(/id:\s*['"](\d+)['"]/);
    const dateMatch = originalBlog.match(/date:\s*['"]([^'"]+)['"]/);
    const id = idMatch ? idMatch[1] : String(Date.now());
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Helper to format string values
    const seoData = manualSEO
      ? {
          metaTitle: cleanBlogMetaTitle(metaTitle, title),
          metaDescription: metaDescription || excerpt,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }
      : {
          metaTitle: title,
          metaDescription: excerpt,
          keywords: title.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(w => w.length > 3),
        };

    // Build updated blog entry
    const updatedBlog = `{
    id: '${id}',
    title: ${toTsStringLiteral(title)},
    slug: '${slug}',
    category: ${toTsStringLiteral(category || 'General')},
    author: ${toTsStringLiteral(author)},
    date: '${date}',
    dateModified: '${new Date().toISOString().split('T')[0]}',
    excerpt: ${toTsStringLiteral(excerpt)},
    image: ${toTsStringLiteral(cardImagePath)},
    coverImage: ${toTsStringLiteral(coverImagePath)},
    metaTitle: ${toTsStringLiteral(seoData.metaTitle)},
    metaDescription: ${toTsStringLiteral(seoData.metaDescription)},
    keywords: [${seoData.keywords.map(k => toTsStringLiteral(k)).join(', ')}],
    ogImage: ${toTsStringLiteral(coverImagePath)},
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
    if ((contentType === 'manual' && manualContent) || (contentFile && contentFile.size > 0)) {
      const imageUrls: { [imgId: string]: string } = {};
      let blogContent = manualContent;
      let extractedDocxImages: Array<{ data: string; contentType: string; index: number }> = [];
      let isHTMLContent = contentType === 'manual' && /<[a-z][\s\S]*>/i.test(manualContent);

      if (contentType === 'manual' && manualContent) {
        const imgPlaceholderRegex = /\[IMAGE:\s*(img_\d+)\]/g;
        const orderedPlaceholders: string[] = [];
        let pm;
        while ((pm = imgPlaceholderRegex.exec(manualContent)) !== null) {
          if (!orderedPlaceholders.includes(pm[1])) orderedPlaceholders.push(pm[1]);
        }

        const contentImageEntries = Array.from(formData.entries())
          .filter(([key]) => key.startsWith('contentImage_'))
          .sort(([a], [b]) => parseInt(a.replace('contentImage_', ''), 10) - parseInt(b.replace('contentImage_', ''), 10));

        for (let i = 0; i < contentImageEntries.length; i++) {
          const file = contentImageEntries[i][1] as File;
          if (!file || file.size === 0) continue;
          const imageBuffer = Buffer.from(await file.arrayBuffer());
          const imageExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const imageName = `building-approvals-dubai-${categorySlug}-content-${i + 1}-${timestamp}.${imageExt}`;
          const imageUrl = await uploadToVercelBlob(imageBuffer, imageName, file.type);
          const imgId = orderedPlaceholders[i];
          if (imgId) imageUrls[imgId] = imageUrl;
        }
      } else if (contentFile && contentFile.size > 0) {
        const contentBuffer = Buffer.from(await contentFile.arrayBuffer());
        const fileName = contentFile.name.toLowerCase();
        if (fileName.endsWith('.pdf')) {
          blogContent = await extractPdfText(contentBuffer);
        } else if (fileName.endsWith('.docx')) {
          const docxResult = await extractDocxText(contentBuffer);
          blogContent = docxResult.text;
          extractedDocxImages = docxResult.images;
          isHTMLContent = true;
        }

        for (const img of extractedDocxImages) {
          const imageExt = img.contentType.split('/')[1]?.toLowerCase() || 'png';
          const imageName = `building-approvals-dubai-${categorySlug}-content-${img.index + 1}-${timestamp}.${imageExt}`;
          const imageBuffer = Buffer.from(img.data, 'base64');
          imageUrls[`docx_${img.index}`] = await uploadToVercelBlob(imageBuffer, imageName, img.contentType);
        }
      }

      componentContent = isHTMLContent
        ? generateBlogComponentFromHTML(blogContent, imageUrls, title, imageAlt)
        : generateBlogComponentFromMarkdown(blogContent, imageUrls, title, imageAlt);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blobPromises: Promise<any>[] = [
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(newBlogDataContent).toString('base64'),
        encoding: 'base64',
      }),
    ];

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
    const contentBlob = componentContent ? blobResults[1] : null;

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

    if (contentBlob) {
      treeEntries.push({
        path: contentPath,
        mode: '100644',
        type: 'blob',
        sha: contentBlob.data.sha,
      });
    }

    // Delete old content file if slug changed
    // fileResults[0] = blogData, remaining = content file check(s) in the order pushed
    if (oldContentPath) {
      // The old content file fetch was pushed last — check if it resolved (non-null)
      const oldFileResult = fileResults[fileResults.length - 1];
      const oldFileExists = oldFileResult !== null && oldFileResult?.data && 'sha' in oldFileResult.data;
      if (oldFileExists) {
        treeEntries.push({
          path: oldContentPath,
          mode: '100644',
          type: 'blob',
          sha: null, // sha: null tells GitHub to delete the file
        });
      }
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
      message: 'Blog updated successfully. The site will redeploy automatically.',
      slug,
      originalSlug: originalSlug !== slug ? originalSlug : undefined,
    });
  } catch (error: unknown) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: getErrMsg(error) || 'Failed to update blog' },
      { status: 500 }
    );
  }
}
