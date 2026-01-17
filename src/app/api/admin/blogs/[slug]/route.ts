import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check for required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        {
          error: 'GitHub API not configured. Please add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to environment variables.',
        },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    // 1. Update blogData.ts - remove the blog entry
    const blogDataPath = 'src/app/blog/blogData.ts';
    const { data: blogDataFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: blogDataPath,
      ref: branch,
    });

    if (!('content' in blogDataFile)) {
      return NextResponse.json({ error: 'Could not read blogData.ts' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataFile.content, 'base64').toString('utf-8');

    // Find and remove the blog entry with matching slug
    const blogArrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!blogArrayMatch) {
      return NextResponse.json({ error: 'Could not parse blog data' }, { status: 500 });
    }

    // Check if blog exists
    if (!blogDataContent.includes(`slug: '${slug}'`)) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Remove the blog entry using regex
    // Match the entire blog object including the trailing comma
    const blogEntryRegex = new RegExp(
      `\\s*\\{[^}]*slug:\\s*['"]${slug}['"][^}]*\\},?`,
      'g'
    );
    let newBlogDataContent = blogDataContent.replace(blogEntryRegex, '');

    // Clean up any double commas or trailing commas before ]
    newBlogDataContent = newBlogDataContent.replace(/,(\s*,)+/g, ',');
    newBlogDataContent = newBlogDataContent.replace(/,(\s*)\]/g, '$1]');
    newBlogDataContent = newBlogDataContent.replace(/\[\s*,/g, '[');

    // Update blogData.ts via GitHub API
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: blogDataPath,
      message: `Remove blog: ${slug}`,
      content: Buffer.from(newBlogDataContent).toString('base64'),
      branch,
      sha: blogDataFile.sha,
    });

    // 2. Delete the blog content file
    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    try {
      const { data: contentFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: contentPath,
        ref: branch,
      });

      if ('sha' in contentFile) {
        await octokit.rest.repos.deleteFile({
          owner,
          repo,
          path: contentPath,
          message: `Delete blog content file: ${slug}`,
          sha: contentFile.sha,
          branch,
        });
      }
    } catch (contentError: any) {
      // File might not exist, that's okay
      console.log('Blog content file not found or already deleted:', contentPath);
    }

    // 3. Update page.tsx - remove import and render case
    const pagePath = 'src/app/blog/[slug]/page.tsx';
    try {
      const { data: pageFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: pagePath,
        ref: branch,
      });

      if ('content' in pageFile) {
        let pageContent = Buffer.from(pageFile.content, 'base64').toString('utf-8');

        // Create component name from slug (handle numbers at start)
        let componentName = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');

        // If component name starts with a number, prefix with number word
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

        // Remove dynamic import statement (new format)
        const dynamicImportRegex = new RegExp(
          `const ${componentName}Content = dynamic\\(\\(\\) => import\\(['"]\\.\\/content\\/${slug}['"]\\)\\.catch\\(\\(\\) => \\(\\) => null\\), \\{ ssr: true \\}\\);?\\n?`,
          'g'
        );
        pageContent = pageContent.replace(dynamicImportRegex, '');

        // Remove static import statement (old format)
        const staticImportRegex = new RegExp(`import ${componentName}Content from ['"]\\.\\/content\\/${slug}['"];?\\n?`, 'g');
        pageContent = pageContent.replace(staticImportRegex, '');

        // Remove the if statement from renderContent
        const caseRegex = new RegExp(
          `\\s*if \\(post\\.slug === ['"]${slug}['"]\\) \\{[\\s\\S]*?return <${componentName}Content \\/>;\n?\\s*\\}\\n?`,
          'g'
        );
        pageContent = pageContent.replace(caseRegex, '');

        // Update page.tsx via GitHub API
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: pagePath,
          message: `Remove import and render case for: ${slug}`,
          content: Buffer.from(pageContent).toString('base64'),
          branch,
          sha: pageFile.sha,
        });
      }
    } catch (pageError: any) {
      console.error('Error updating page.tsx:', pageError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully. Vercel will redeploy automatically.',
      slug,
      note: 'Images stored in Vercel Blob are not automatically deleted. You can manage them in Vercel dashboard.',
    });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete blog' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Read blogData.ts file
    const blogDataPath = 'src/app/blog/blogData.ts';
    const { data: blogDataFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: blogDataPath,
      ref: branch,
    });

    if (!('content' in blogDataFile)) {
      return NextResponse.json({ error: 'Could not read blogData.ts' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataFile.content, 'base64').toString('utf-8');

    // Find the blog with matching slug
    const blogArrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!blogArrayMatch) {
      return NextResponse.json({ error: 'Could not parse blog data' }, { status: 500 });
    }

    // Extract blog data
    const blogsText = blogArrayMatch[1];
    const blogMatch = blogsText.match(new RegExp(`\\{[^}]*slug:\\s*['"]${slug}['"][^}]*\\}`, 's'));

    if (!blogMatch) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Parse the blog object
    const blogStr = blogMatch[0];
    const blog: any = {};

    const fields = ['id', 'title', 'excerpt', 'date', 'author', 'category', 'image', 'coverImage', 'slug', 'metaTitle', 'metaDescription'];
    fields.forEach(field => {
      const regex = new RegExp(`${field}:\\s*['"]([^'"]*?)['"]`);
      const match = blogStr.match(regex);
      if (match) {
        blog[field] = match[1];
      }
    });

    // Try to read the blog content file
    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    try {
      const { data: contentFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: contentPath,
        ref: branch,
      });

      if ('content' in contentFile) {
        blog.contentFile = Buffer.from(contentFile.content, 'base64').toString('utf-8');
      }
    } catch (error) {
      console.log('Blog content file not found:', contentPath);
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}
