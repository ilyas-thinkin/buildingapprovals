const WP_GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL ?? '';

export interface WPPost {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage: { node: { sourceUrl: string; altText: string } } | null;
  categories: { nodes: Array<{ name: string }> };
  tags: { nodes: Array<{ name: string }> };
  seo?: {
    title?: string;
    metaDesc?: string;
    opengraphImage?: { sourceUrl: string } | null;
  };
}

const POSTS_QUERY = `
  query GetAllPosts($after: String) {
    posts(first: 100, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        excerpt(format: RENDERED)
        date
        modified
        categories { nodes { name } }
        tags { nodes { name } }
        featuredImage { node { sourceUrl altText } }
        seo { title metaDesc opengraphImage { sourceUrl } }
      }
    }
  }
`;

const POST_QUERY = `
  query GetPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      excerpt(format: RENDERED)
      content(format: RENDERED)
      date
      modified
      categories { nodes { name } }
      tags { nodes { name } }
      featuredImage { node { sourceUrl altText } }
      seo { title metaDesc opengraphImage { sourceUrl } }
    }
  }
`;

async function wpFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!WP_GRAPHQL_URL) {
    throw new Error('WORDPRESS_GRAPHQL_URL is not set');
  }

  const res = await fetch(WP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { tags: ['wordpress'] },
  });

  if (!res.ok) {
    throw new Error(`WordPress GraphQL request failed: ${res.status}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(`WordPress GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

export async function getWordPressPosts(): Promise<WPPost[]> {
  if (!WP_GRAPHQL_URL) return [];

  const posts: WPPost[] = [];
  let after: string | null = null;

  type PostsPage = {
    posts: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      nodes: WPPost[];
    };
  };

  try {
    do {
      const data: PostsPage = await wpFetch<PostsPage>(POSTS_QUERY, { after });

      posts.push(...data.posts.nodes);
      after = data.posts.pageInfo.hasNextPage ? data.posts.pageInfo.endCursor : null;
    } while (after);
  } catch (err) {
    console.error('[WordPress] Failed to fetch posts:', err);
    return [];
  }

  return posts;
}

export async function getWordPressPost(slug: string): Promise<WPPost | null> {
  if (!WP_GRAPHQL_URL) return null;

  try {
    const data = await wpFetch<{ post: WPPost | null }>(POST_QUERY, { slug });
    return data.post ?? null;
  } catch (err) {
    console.error(`[WordPress] Failed to fetch post "${slug}":`, err);
    return null;
  }
}

export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim();
}
