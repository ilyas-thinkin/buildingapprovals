import { blogPosts, BlogPost } from '@/app/blog/blogData';
import { getWordPressPosts, getWordPressPost, stripHtmlTags, WPPost } from './wordpress';

/** Converts a WPPost to the shared BlogPost shape. */
function wpPostToBlogPost(wp: WPPost): BlogPost {
  const image = wp.featuredImage?.node.sourceUrl ?? '/images/blog/default-cover.jpg';
  const category = wp.categories.nodes[0]?.name ?? 'General';
  const keywords = wp.tags.nodes.map(t => t.name);
  const rawExcerpt = stripHtmlTags(wp.excerpt ?? '');

  return {
    id: String(wp.databaseId),
    title: wp.title,
    slug: wp.slug,
    excerpt: rawExcerpt,
    date: wp.date.split('T')[0],
    dateModified: wp.modified.split('T')[0],
    author: 'Building Approvals Dubai',
    category,
    image,
    coverImage: image,
    metaTitle: wp.seo?.title || wp.title,
    metaDescription: wp.seo?.metaDesc || rawExcerpt,
    keywords,
    ogImage: wp.seo?.opengraphImage?.sourceUrl || image,
    source: 'wordpress',
  };
}

/**
 * Returns all blog posts — local static posts first (newest first),
 * then WordPress posts sorted by publish date descending.
 * WordPress posts with a slug that matches a local post are skipped (local wins).
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const wpRaw = await getWordPressPosts();
  const localSlugs = new Set(blogPosts.map(p => p.slug));

  const wpPosts = wpRaw
    .filter(wp => !localSlugs.has(wp.slug))
    .map(wpPostToBlogPost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return [...wpPosts, ...blogPosts];
}

/**
 * Looks up a post by slug: checks local posts first, then WordPress.
 * For WordPress posts, fetches the full content in a single query.
 */
export async function getPostBySlug(slug: string): Promise<(BlogPost & { wpContent?: string }) | null> {
  const local = blogPosts.find(p => p.slug === slug);
  if (local) return local;

  const wp = await getWordPressPost(slug);
  if (!wp) return null;

  return { ...wpPostToBlogPost(wp), wpContent: wp.content };
}
