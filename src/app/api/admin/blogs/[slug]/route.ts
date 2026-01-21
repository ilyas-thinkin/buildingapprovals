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

    const deletionResults: string[] = [];

    // 1. Delete the blog content file FIRST (before modifying page.tsx)
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
        deletionResults.push(`Deleted content file: ${contentPath}`);
      }
    } catch (contentError: any) {
      if (contentError.status !== 404) {
        console.error('Error deleting content file:', contentError.message);
      }
      deletionResults.push(`Content file not found or already deleted: ${contentPath}`);
    }

    // 2. Update blogData.ts - remove the blog entry
    const blogDataPath = 'src/app/blog/blogData.ts';
    try {
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

      // Check if blog exists (check both single and double quotes)
      const slugExists = blogDataContent.includes(`slug: '${slug}'`) || blogDataContent.includes(`slug: "${slug}"`);
      if (!slugExists) {
        return NextResponse.json({ error: 'Blog not found in blogData.ts' }, { status: 404 });
      }

      // Parse the blog array more carefully
      // Find all blog objects and filter out the one with matching slug
      const interfaceMatch = blogDataContent.match(/(export interface BlogPost[\s\S]*?}\n)/);
      const arrayStartMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[/);

      if (!arrayStartMatch) {
        return NextResponse.json({ error: 'Could not find blogPosts array' }, { status: 500 });
      }

      // Extract the array content between [ and ];
      const arrayStartIndex = blogDataContent.indexOf('export const blogPosts: BlogPost[] = [') + 'export const blogPosts: BlogPost[] = ['.length;
      const arrayEndIndex = blogDataContent.lastIndexOf('];');
      const arrayContent = blogDataContent.substring(arrayStartIndex, arrayEndIndex);

      // Split into individual blog objects - match each { ... } block
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

      // Filter out objects with matching slug
      const filteredObjects = blogObjects.filter(obj => {
        return !obj.includes(`slug: '${slug}'`) && !obj.includes(`slug: "${slug}"`);
      });

      // Rebuild the file
      const interfacePart = interfaceMatch ? interfaceMatch[1] : '';
      const newArrayContent = filteredObjects.length > 0
        ? '\n' + filteredObjects.map(obj => '  ' + obj).join(',\n\n') + '\n'
        : '\n';

      const newBlogDataContent = `${interfacePart}
export const blogPosts: BlogPost[] = [${newArrayContent}];
`;

      // Update blogData.ts via GitHub API
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: blogDataPath,
        message: `Remove blog entry: ${slug}`,
        content: Buffer.from(newBlogDataContent).toString('base64'),
        branch,
        sha: blogDataFile.sha,
      });
      deletionResults.push('Removed blog entry from blogData.ts');
    } catch (blogDataError: any) {
      console.error('Error updating blogData.ts:', blogDataError.message);
      return NextResponse.json({ error: `Failed to update blogData.ts: ${blogDataError.message}` }, { status: 500 });
    }

    // 3. Update page.tsx - remove import and render case
    const pagePath = 'src/app/blog/[slug]/page.tsx';
    try {
      // Get fresh copy of page.tsx
      const { data: pageFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: pagePath,
        ref: branch,
      });

      if ('content' in pageFile) {
        let pageContent = Buffer.from(pageFile.content, 'base64').toString('utf-8');
        const originalContent = pageContent;

        // Generate all possible component name variations
        const componentNames: string[] = [];

        // Standard component name from slug
        let stdName = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');

        // Handle numbers at start
        if (/^\d/.test(stdName)) {
          const numberWords: { [key: string]: string } = {
            '0': 'Zero_', '1': 'One_', '2': 'Two_', '3': 'Three_', '4': 'Four_',
            '5': 'Five_', '6': 'Six_', '7': 'Seven_', '8': 'Eight_', '9': 'Nine_', '10': 'Ten_'
          };
          const match = stdName.match(/^(\d+)/);
          if (match) {
            const num = match[1];
            const prefix = numberWords[num] || `N${num}_`;
            stdName = prefix + stdName.slice(num.length);
          }
        }
        componentNames.push(stdName);

        // Remove any dynamic import that references this slug
        // Pattern: const XContent = dynamic(() => import('./content/SLUG')...);
        const dynamicImportPattern = new RegExp(
          `const\\s+\\w+Content\\s*=\\s*dynamic\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*import\\s*\\(\\s*['"]\\.\\/content\\/${slug}['"]\\)[^;]*;\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(dynamicImportPattern, '');

        // Remove static import that references this slug
        const staticImportPattern = new RegExp(
          `import\\s+\\w+Content\\s+from\\s+['"]\\.\\/content\\/${slug}['"];?\\s*\\n?`,
          'g'
        );
        pageContent = pageContent.replace(staticImportPattern, '');

        // Remove the render case for this slug
        // Pattern: if (post.slug === 'SLUG') { return <XContent />; }
        const renderCasePattern = new RegExp(
          `\\s*if\\s*\\(post\\.slug\\s*===\\s*['"]${slug}['"]\\)\\s*\\{[\\s\\S]*?return\\s*<\\w+Content\\s*\\/?>\\s*;?\\s*\\}\\s*`,
          'g'
        );
        pageContent = pageContent.replace(renderCasePattern, '\n    ');

        // Clean up multiple blank lines
        pageContent = pageContent.replace(/\n{3,}/g, '\n\n');

        // Clean up spaces before return null
        pageContent = pageContent.replace(/\n\s+\n\s*return null;/g, '\n    return null;');

        // Only update if content changed
        if (pageContent !== originalContent) {
          await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: pagePath,
            message: `Remove import and render case for: ${slug}`,
            content: Buffer.from(pageContent).toString('base64'),
            branch,
            sha: pageFile.sha,
          });
          deletionResults.push('Removed import and render case from page.tsx');
        } else {
          deletionResults.push('No changes needed in page.tsx (import/render case not found)');
        }
      }
    } catch (pageError: any) {
      console.error('Error updating page.tsx:', pageError.message);
      deletionResults.push(`Warning: Could not update page.tsx: ${pageError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully. Vercel will redeploy automatically.',
      slug,
      deletionResults,
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

    // Find the blog with matching slug - handle both single and double quotes
    const slugPatternSingle = `slug:\\s*'${slug}'`;
    const slugPatternDouble = `slug:\\s*"${slug}"`;

    // Find the blog object containing this slug
    let blogMatch = null;
    const blogObjectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    let match;

    while ((match = blogObjectPattern.exec(blogDataContent)) !== null) {
      if (match[0].includes(`slug: '${slug}'`) || match[0].includes(`slug: "${slug}"`)) {
        blogMatch = match[0];
        break;
      }
    }

    if (!blogMatch) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Parse the blog object
    const blog: any = {};
    const fields = ['id', 'title', 'excerpt', 'date', 'author', 'category', 'image', 'coverImage', 'slug', 'metaTitle', 'metaDescription'];

    fields.forEach(field => {
      // Match both single and double quoted values, including multi-line
      const singleQuoteRegex = new RegExp(`${field}:\\s*'([^']*)'`);
      const doubleQuoteRegex = new RegExp(`${field}:\\s*"([^"]*)"`);

      let fieldMatch = blogMatch.match(singleQuoteRegex);
      if (!fieldMatch) {
        fieldMatch = blogMatch.match(doubleQuoteRegex);
      }

      if (fieldMatch) {
        blog[field] = fieldMatch[1];
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
