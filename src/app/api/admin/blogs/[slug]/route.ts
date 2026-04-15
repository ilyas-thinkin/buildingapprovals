import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { verifyAdminRequest } from '@/lib/admin-auth';

function getErrMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub API not configured. Please add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to environment variables.' },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    const deletionResults: string[] = [];

    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    const blogDataPath = 'src/app/blog/blogData.ts';

    const [blogDataResult, contentResult] = await Promise.all([
      octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch }),
      octokit.rest.repos.getContent({ owner, repo, path: contentPath, ref: branch }).catch(() => null),
    ]);

    if (!('content' in blogDataResult.data)) {
      return NextResponse.json({ error: 'Could not read required files' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataResult.data.content, 'base64').toString('utf-8');

    const slugExists = blogDataContent.includes(`slug: '${slug}'`) || blogDataContent.includes(`slug: "${slug}"`);
    if (!slugExists) {
      return NextResponse.json({ error: 'Blog not found in blogData.ts' }, { status: 404 });
    }

    // Parse and filter out the blog entry
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
        if (depth === 0) { inObject = true; currentObject = '{'; }
        else { currentObject += char; }
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

    const filteredObjects = blogObjects.filter(obj =>
      !obj.includes(`slug: '${slug}'`) && !obj.includes(`slug: "${slug}"`)
    );

    const interfacePart = interfaceMatch ? interfaceMatch[1] : '';
    const newArrayContent = filteredObjects.length > 0
      ? '\n' + filteredObjects.map(obj => '  ' + obj).join(',\n\n') + '\n'
      : '\n';

    const newBlogDataContent = `${interfacePart}
export const blogPosts: BlogPost[] = [${newArrayContent}];
`;
    deletionResults.push('Removed blog entry from blogData.ts');

    // Git commit
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const currentCommitSha = refData.object.sha;
    const { data: commitData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: currentCommitSha });
    const baseTreeSha = commitData.tree.sha;

    const [blogDataBlob] = await Promise.all([
      octokit.rest.git.createBlob({
        owner, repo,
        content: Buffer.from(newBlogDataContent).toString('base64'),
        encoding: 'base64',
      }),
    ]);

    const treeEntries: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string | null }> = [
      { path: blogDataPath, mode: '100644', type: 'blob', sha: blogDataBlob.data.sha },
    ];

    if (contentResult) {
      treeEntries.push({ path: contentPath, mode: '100644', type: 'blob', sha: null });
      deletionResults.push(`Deleted content file: ${contentPath}`);
    }

    const { data: newTree } = await octokit.rest.git.createTree({ owner, repo, base_tree: baseTreeSha, tree: treeEntries });
    const { data: newCommit } = await octokit.rest.git.createCommit({ owner, repo, message: `Delete blog: ${slug}`, tree: newTree.sha, parents: [currentCommitSha] });
    await octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully. The site will redeploy automatically.',
      slug,
      deletionResults,
      note: 'Images stored in Netlify Blob are not automatically deleted. You can manage them in the Netlify dashboard.',
    });
  } catch (error: unknown) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: getErrMsg(error) || 'Failed to delete blog' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    const githubBranch = process.env.GITHUB_BRANCH || 'master';

    if (!githubToken || !githubOwner || !githubRepo) {
      return NextResponse.json({ error: 'GitHub API not configured' }, { status: 500 });
    }

    const octokit = new Octokit({ auth: githubToken });
    const owner = githubOwner;
    const repo = githubRepo;
    const branch = githubBranch;

    const blogDataPath = 'src/app/blog/blogData.ts';
    const { data: blogDataFile } = await octokit.rest.repos.getContent({ owner, repo, path: blogDataPath, ref: branch });

    if (!('content' in blogDataFile)) {
      return NextResponse.json({ error: 'Could not read blogData.ts' }, { status: 500 });
    }

    const blogDataContent = Buffer.from(blogDataFile.content, 'base64').toString('utf-8');

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blog: any = {};
    const fields = ['id', 'title', 'excerpt', 'date', 'dateModified', 'author', 'category', 'image', 'coverImage', 'slug', 'metaTitle', 'metaDescription', 'ogImage'];

    fields.forEach(field => {
      const singleQuoteRegex = new RegExp(`${field}:\\s*'([^']*)'`);
      const doubleQuoteRegex = new RegExp(`${field}:\\s*"([^"]*)"`);
      let fieldMatch = blogMatch!.match(singleQuoteRegex);
      if (!fieldMatch) fieldMatch = blogMatch!.match(doubleQuoteRegex);
      if (fieldMatch) blog[field] = fieldMatch[1];
    });

    const keywordsMatch = blogMatch.match(/keywords:\s*\[([\s\S]*?)\]/);
    if (keywordsMatch) {
      const keywordMatches = keywordsMatch[1].match(/'([^']*)'|"([^"]*)"/g) || [];
      blog.keywords = keywordMatches
        .map((keyword) => keyword.replace(/^['"]|['"]$/g, '').trim())
        .filter(Boolean);
    }

    const contentPath = `src/app/blog/[slug]/content/${slug}.tsx`;
    try {
      const { data: contentFile } = await octokit.rest.repos.getContent({ owner, repo, path: contentPath, ref: branch });
      if ('content' in contentFile) {
        blog.contentFile = Buffer.from(contentFile.content, 'base64').toString('utf-8');
      }
    } catch {
      console.log('Blog content file not found:', contentPath);
    }

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: getErrMsg(error) || 'Failed to fetch blog' }, { status: 500 });
  }
}
