import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '../blogData';
import { getAllPosts, getPostBySlug } from '@/lib/getAllPosts';
import BlogContent from './BlogContent';
import BlogTOC from './BlogTOC';
import WordPressContent from './WordPressContent';
import BlogBottomActions from '../BlogBottomActions';
import { cleanBlogMetaTitle } from '@/lib/blog-seo';
import './blog-post.css';

// ─── SITE CONFIG ──────────────────────────────────────────────────────────────
const BASE_URL       = 'https://www.buildingapprovals.ae';
const SITE_NAME      = 'Building Approvals Dubai';
const LOGO_URL       = `${BASE_URL}/images/BA OG Logo_imresizer (1).png?v=2`;
const TWITTER_HANDLE = '@buildingapprovalsdubai';
// ──────────────────────────────────────────────────────────────────────────────

function normalizeMetaTitle(title: string): string {
  return cleanBlogMetaTitle(title);
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/** Safely resolves an image path to a full URL — handles both absolute URLs (blob storage) and local paths */
function resolveImageUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  const imageUrl = resolveImageUrl(post.ogImage || post.coverImage || post.image);
  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: { absolute: normalizeMetaTitle(post.metaTitle || post.title) },
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', '),
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
      languages: { en: url, 'x-default': url },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: normalizeMetaTitle(post.metaTitle || post.title),
      description: post.metaDescription || post.excerpt,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.dateModified || post.date,
      authors: [post.author],
      locale: 'en_AE',
    },
    twitter: {
      card: 'summary_large_image',
      title: normalizeMetaTitle(post.metaTitle || post.title),
      description: post.metaDescription || post.excerpt,
      images: [imageUrl],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    other: {
      'article:published_time': post.date,
      'article:modified_time': post.dateModified || post.date,
      'article:author': post.author,
      'article:section': post.category,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const isWordPressPost = post.source === 'wordpress';
  const wpContent = (post as { wpContent?: string }).wpContent;

  const imageUrl = resolveImageUrl(post.ogImage || post.coverImage || post.image);
  const postUrl = `${BASE_URL}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#blogposting`,
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: { '@type': 'ImageObject', url: imageUrl, width: 1200, height: 630 },
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: post.author,
      url: `${BASE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: `${BASE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
        width: 1200,
        height: 1200,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    keywords: post.keywords?.join(', '),
    articleSection: post.category,
    inLanguage: 'en-AE',
  };

  const faqJsonLd = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <div className="blog-post-page">
        <article className="blog-post" itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content={post.title} />
          <meta itemProp="description" content={post.metaDescription || post.excerpt} />
          <meta itemProp="datePublished" content={post.date} />
          <meta itemProp="author" content={post.author} />
          <link itemProp="image" href={imageUrl} />

          <header
            className="blog-post-header"
            style={{ backgroundImage: `url(${post.coverImage || post.image})` }}
          >
            <div className="blog-post-header-content">
              <span className="blog-post-category">{post.category}</span>
              <h1 className="blog-post-title" itemProp="name">{post.title}</h1>
              <div className="blog-post-meta">
                <time dateTime={post.date} itemProp="datePublished">
                  {new Date(post.date).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                {post.dateModified && post.dateModified !== post.date && (
                  <>
                    <span className="blog-post-meta-dot" />
                    <time dateTime={post.dateModified} itemProp="dateModified" className="blog-post-updated">
                      Updated {new Date(post.dateModified).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  </>
                )}
                <span className="blog-post-meta-dot" />
                <span itemProp="author">By {post.author}</span>
              </div>
            </div>
          </header>

          <div className="blog-post-intro-summary" role="note" aria-label="Article summary">
            <p>{post.excerpt}</p>
          </div>

          <div className="blog-post-content" itemProp="articleBody">
            <BlogTOC />
            {isWordPressPost && wpContent
              ? <WordPressContent html={wpContent} />
              : <BlogContent slug={slug} />
            }
          </div>

          <section className="blog-post-approval-cta" aria-label="Building approvals in Dubai">
            <div className="blog-post-approval-icon" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M9 12.75L11.25 15L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.75 6.5L12 3L19.25 6.5V11.25C19.25 15.75 16.4 19.9 12 21.25C7.6 19.9 4.75 15.75 4.75 11.25V6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="blog-post-approval-content">
              <span className="blog-post-approval-kicker">Dubai approval guidance</span>
              <h2>Move your project forward with the right approvals</h2>
              <p>
                Building approvals are an important step before starting any construction, renovation, or fit-out project in Dubai. Proper authority approvals help ensure your project follows local regulations, safety standards, and municipality requirements. Whether you need dubai approvals for commercial spaces, villas, offices, or modifications, getting the right guidance can save time and avoid costly delays. With professional support for approvals dubai, your project can move smoothly from documentation to final approval.
              </p>
              <div className="blog-post-approval-tags" aria-label="Approval support areas">
                <span>Commercial spaces</span>
                <span>Villa modifications</span>
                <span>Fit-out projects</span>
              </div>
              <BlogBottomActions />
            </div>
          </section>

          <div className="related-articles-section">
            <h2 className="related-articles-title">You Might Also Like</h2>
            <p className="related-articles-subtitle">Check out these helpful guides on building approvals in Dubai</p>
            <div className="related-articles-grid">
              {blogPosts
                .filter(p => p.slug !== post!.slug)
                .slice(0, 3)
                .map(relatedPost => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="related-article-card">
                    <div
                      className="related-article-image"
                      style={{ backgroundImage: `url(${relatedPost.image})` }}
                    >
                      <span className="related-article-category">{relatedPost.category}</span>
                    </div>
                    <div className="related-article-content">
                      <h3 className="related-article-title">{relatedPost.title}</h3>
                      <p className="related-article-excerpt">{relatedPost.excerpt}</p>
                      <span className="related-article-date">
                        {new Date(relatedPost.date).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <footer className="blog-post-footer">
            <Link href="/blog" className="back-to-blog">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Blog
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}
