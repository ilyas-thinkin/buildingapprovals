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

    // File paths
    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const blogDataPath = 'src/app/blog/blogData.ts';
    const pagePath = 'src/app/blog/[slug]/page.tsx';

    // Get all required files in parallel
    const [blogDataResult, pageResult, contentResult] = await Promise.all([
      octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch }),
      octokit.rest.repos.getContent({ owner, repo, path: pagePath, ref: branch }),
      octokit.rest.repos.getContent({ owner, repo, path: contentPath, ref: branch }).catch(() => null),
    ]);

    if (!('content' in blogDataResult.data) || !('content' in pageResult.data)) {
      return NextResponse.json({ error: 'Could not read required files' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataResult.data.content, 'base64').toString('utf-8');
    let pageContent = Buffer.from(pageResult.data.content, 'base64').toString('utf-8');

    // Check if blog exists
    const slugExists = blogDataContent.includes(`slug: '${slug}'`) || blogDataContent.includes(`slug: "${slug}"`);
    if (!slugExists) {
      return NextResponse.json({ error: 'Blog not found in blogData.ts' }, { status: 404 });
    }

    // 1. Prepare updated blogData.ts
    const interfaceMatch = blogDataContent.match(/(export interface BlogPost[\s\S]*?}\n)/);
    const arrayStartIndex = blogDataContent.indexOf('export const blogPosts: BlogPost[] = [') + 'export const blogPosts: BlogPost[] = ['.length;
    const arrayEndIndex = blogDataContent.lastIndexOf('];');
    const arrayContent = blogDataContent.substring(arrayStartIndex, arrayEndIndex);

    // Parse blog objects
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

    // Filter out the blog to delete
    const filteredObjects = blogObjects.filter(obj => {
      return !obj.includes(`slug: '${slug}'`) && !obj.includes(`slug: "${slug}"`);
    });

    const interfacePart = interfaceMatch ? interfaceMatch[1] : '';
    const newArrayContent = filteredObjects.length > 0
      ? '\n' + filteredObjects.map(obj => '  ' + obj).join(',\n\n') + '\n'
      : '\n';

    const newBlogDataContent = `${interfacePart}
export const blogPosts: BlogPost[] = [${newArrayContent}];
`;
    deletionResults.push('Removed blog entry from blogData.ts');

    // 2. Prepare updated page.tsx
    const originalPageContent = pageContent;

    // Remove dynamic import
    const dynamicImportPattern = new RegExp(
      `const\\s+\\w+Content\\s*=\\s*dynamic\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*import\\s*\\(\\s*['"]\\.\\/content\\/${slug}['"]\\)[^;]*;\\s*\\n?`,
      'g'
    );
    pageContent = pageContent.replace(dynamicImportPattern, '');

    // Remove static import
    const staticImportPattern = new RegExp(
      `import\\s+\\w+Content\\s+from\\s+['"]\\.\\/content\\/${slug}['"];?\\s*\\n?`,
      'g'
    );
    pageContent = pageContent.replace(staticImportPattern, '');

    // Remove render case
    const renderCasePattern = new RegExp(
      `\\s*if\\s*\\(post\\.slug\\s*===\\s*['"]${slug}['"]\\)\\s*\\{[\\s\\S]*?return\\s*<\\w+Content\\s*\\/?>\\s*;?\\s*\\}\\s*`,
      'g'
    );
    pageContent = pageContent.replace(renderCasePattern, '\n    ');

    // Clean up
    pageContent = pageContent.replace(/\n{3,}/g, '\n\n');
    pageContent = pageContent.replace(/\n\s+\n\s*return null;/g, '\n    return null;');

    if (pageContent !== originalPageContent) {
      deletionResults.push('Removed import and render case from page.tsx');
    }

    // 3. Create a single commit with all changes using Git Data API
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

    // Create blobs for updated files
    const [blogDataBlob, pageBlob] = await Promise.all([
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(newBlogDataContent).toString('base64'),
        encoding: 'base64',
      }),
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(pageContent).toString('base64'),
        encoding: 'base64',
      }),
    ]);

    // Build tree entries - include file deletion if content file exists
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
      {
        path: pagePath,
        mode: '100644',
        type: 'blob',
        sha: pageBlob.data.sha,
      },
    ];

    // Add content file deletion (sha: null deletes the file)
    if (contentResult) {
      treeEntries.push({
        path: contentPath,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
      deletionResults.push(`Deleted content file: ${contentPath}`);
    } else {
      deletionResults.push(`Content file not found: ${contentPath}`);
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
      message: `Delete blog: ${slug}`,
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
