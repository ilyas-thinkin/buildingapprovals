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

    // Remove ALL blog entries with matching slug (handles duplicates)
    // Match the entire blog object including the trailing comma - handles multi-line objects
    const blogEntryRegex = new RegExp(
      `\\s*\\{[\\s\\S]*?slug:\\s*['"]${slug}['"][\\s\\S]*?\\},?`,
      'g'
    );
    let newBlogDataContent = blogDataContent.replace(blogEntryRegex, '');

    // Clean up any double commas or trailing commas before ]
    newBlogDataContent = newBlogDataContent.replace(/,(\s*,)+/g, ',');
    newBlogDataContent = newBlogDataContent.replace(/,(\s*)\]/g, '$1]');
    newBlogDataContent = newBlogDataContent.replace(/\[\s*,/g, '[');
    // Clean up excessive blank lines
    newBlogDataContent = newBlogDataContent.replace(/\n{3,}/g, '\n\n');

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

        // Remove dynamic import statement (multiple formats)
        // Format 1: const XContent = dynamic(() => import('./content/x').catch(() => () => null), { ssr: true });
        const dynamicImportRegex1 = new RegExp(
          `const\\s+${componentName}Content\\s*=\\s*dynamic\\([^;]+\\);?\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(dynamicImportRegex1, '');

        // Format 2: More relaxed dynamic import pattern
        const dynamicImportRegex2 = new RegExp(
          `const\\s+\\w*${slug.replace(/-/g, '')}\\w*Content\\s*=\\s*dynamic\\([^;]+['"]${slug}['"][^;]*\\);?\\s*\\n?`,
          'gi'
        );
        pageContent = pageContent.replace(dynamicImportRegex2, '');

        // Remove static import statement (old format)
        // Format: import XContent from './content/x';
        const staticImportRegex = new RegExp(
          `import\\s+${componentName}Content\\s+from\\s+['"]\\.\\/content\\/${slug}['"];?\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(staticImportRegex, '');

        // Also try with any component name that imports from this slug
        const anyStaticImportRegex = new RegExp(
          `import\\s+\\w+Content\\s+from\\s+['"]\\.\\/content\\/${slug}['"];?\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(anyStaticImportRegex, '');

        // Remove the if statement from renderContent (multiple formats)
        // Format 1: if (post.slug === 'x') { return <XContent />; }
        const caseRegex1 = new RegExp(
          `\\s*if\\s*\\(post\\.slug\\s*===\\s*['"]${slug}['"]\\)\\s*\\{[\\s\\S]*?return\\s*<\\w+Content\\s*\\/>;?\\s*\\}\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(caseRegex1, '');

        // Format 2: More compact version without newlines
        const caseRegex2 = new RegExp(
          `if\\s*\\(post\\.slug\\s*===\\s*['"]${slug}['"]\\)\\s*\\{\\s*return\\s*<\\w+Content\\s*\\/>;?\\s*\\}`,
          'g'
        );
        pageContent = pageContent.replace(caseRegex2, '');

        // Clean up any double newlines that may have been left
        pageContent = pageContent.replace(/\n{3,}/g, '\n\n');

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
