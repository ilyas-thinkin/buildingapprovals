import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts } from '../blogData';
import './blog-post.css';
import DubaiMunicipalityApprovalContent from './content/dubai-municipality-approval-process-2026';
import DubaiMunicipalityUpdatedRulesContent from './content/dubai-municipality-approvals-2026-updated-rules';
import DubaiCivilDefenceApprovalDcdCompleteGuideFor2026Content from './content/dubai-civil-defence-approval-dcd-complete-guide-for-2026';
import FitOutApprovalDubaiSimplePracticalGuide2026Content from './content/fit-out-approval-dubai-simple-practical-guide-2026';
import HowToGetDewaApprovalsInDubaiStepByStepProcessChecklistContent from './content/how-to-get-dewa-approvals-in-dubai-step-by-step-process-checklist';
import HowToSecureANakheelNocInDubai2026Content from './content/how-to-secure-a-nakheel-noc-in-dubai-2026';
import DubaiMunicipalityApproval2026CompleteGuideForConstructionFitOutEngineeringProjectsInDubaiContent from './content/dubai-municipality-approval-2026-complete-guide-for-construction-fit-out-engineering-projects-in-dubai';
import 10CommonFitOutApprovalMistakesThatDelayProjectsInDubaiContent from './content/10-common-fit-out-approval-mistakes-that-delay-projects-in-dubai';


interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const imageUrl = `https://www.buildingapprovals.ae${post.ogImage || post.coverImage || post.image}`;
  const url = `https://www.buildingapprovals.ae/blog/${post.slug}`;

  return {
    title: post.metaTitle || `${post.title} | Building Approvals Dubai`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', '),
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: 'Building Approvals Dubai',
    alternates: {
      canonical: url,
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
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.metaTitle || post.title,
        },
      ],
      url: url,
      siteName: 'Building Approvals Dubai',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      locale: 'en_AE',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [imageUrl],
      creator: '@buildingapprovalsdubai',
      site: '@buildingapprovalsdubai',
    },
    other: {
      'article:published_time': post.date,
      'article:author': post.author,
      'article:section': post.category,
    },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Render content based on slug
  const renderContent = () => {
    if (post.slug === 'dubai-municipality-approval-process-2026') {
      return <DubaiMunicipalityApprovalContent />;
    }

    if (post.slug === 'dubai-municipality-approvals-2026-updated-rules') {
      return <DubaiMunicipalityUpdatedRulesContent />;
    }

    if (post.slug === 'dubai-civil-defence-approval-dcd-complete-guide-for-2026') {
      return <DubaiCivilDefenceApprovalDcdCompleteGuideFor2026Content />;
    }

    if (post.slug === 'fit-out-approval-dubai-simple-practical-guide-2026') {
      return <FitOutApprovalDubaiSimplePracticalGuide2026Content />;
    }

        if (post.slug === 'how-to-get-dewa-approvals-in-dubai-step-by-step-process-checklist') {
      return <HowToGetDewaApprovalsInDubaiStepByStepProcessChecklistContent />;
    }
        if (post.slug === 'how-to-secure-a-nakheel-noc-in-dubai-2026') {
      return <HowToSecureANakheelNocInDubai2026Content />;
    }

        if (post.slug === 'dubai-municipality-approval-2026-complete-guide-for-construction-fit-out-engineering-projects-in-dubai') {
      return <DubaiMunicipalityApproval2026CompleteGuideForConstructionFitOutEngineeringProjectsInDubaiContent />;
    }
        if (post.slug === '10-common-fit-out-approval-mistakes-that-delay-projects-in-dubai') {
      return <10CommonFitOutApprovalMistakesThatDelayProjectsInDubaiContent />;
    }

    return null;
  };

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: {
      '@type': 'ImageObject',
      url: `https://www.buildingapprovals.ae${post.ogImage || post.coverImage || post.image}`,
      width: 1200,
      height: 630,
      caption: post.metaTitle || post.title,
    },
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://www.buildingapprovals.ae',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Building Approvals Dubai',
      url: 'https://www.buildingapprovals.ae',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.buildingapprovals.ae/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.buildingapprovals.ae/blog/${post.slug}`,
    },
    keywords: post.keywords?.join(', '),
    articleSection: post.category,
    inLanguage: 'en-AE',
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.buildingapprovals.ae',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.buildingapprovals.ae/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://www.buildingapprovals.ae/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="blog-post-page">
        <article className="blog-post" itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content={post.title} />
          <meta itemProp="description" content={post.metaDescription || post.excerpt} />
          <meta itemProp="datePublished" content={post.date} />
          <meta itemProp="author" content={post.author} />
          <link itemProp="image" href={`https://www.buildingapprovals.ae${post.ogImage || post.coverImage || post.image}`} />

          <header
            className="blog-post-header"
            style={{
              backgroundImage: `url(${post.coverImage || post.image})`
            }}
          >
            <div className="blog-post-header-content">
              <span className="blog-post-category">{post.category}</span>
              <h1 className="blog-post-title" itemProp="name">{post.title}</h1>
              <div className="blog-post-meta">
                <span className="blog-post-date">
                  <time dateTime={post.date} itemProp="datePublished">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </span>
                <span className="blog-post-author" itemProp="author">By {post.author}</span>
              </div>
            </div>
          </header>

          <div className="blog-post-content" itemProp="articleBody">
            {renderContent()}
          </div>

          {/* Related Articles Section */}
          <div className="related-articles-section">
            <h2 className="related-articles-title">You Might Also Like</h2>
            <p className="related-articles-subtitle">Check out these helpful guides on building approvals in Dubai</p>
            <div className="related-articles-grid">
              {blogPosts
                .filter(p => p.slug !== post.slug)
                .slice(0, 3)
                .map((relatedPost) => (
                  <a
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="related-article-card"
                  >
                    <div
                      className="related-article-image"
                      style={{
                        backgroundImage: `url(${relatedPost.image})`
                      }}
                    >
                      <span className="related-article-category">{relatedPost.category}</span>
                    </div>
                    <div className="related-article-content">
                      <h3 className="related-article-title">{relatedPost.title}</h3>
                      <p className="related-article-excerpt">{relatedPost.excerpt}</p>
                      <span className="related-article-date">
                        {new Date(relatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </a>
                ))}
            </div>
          </div>

          <footer className="blog-post-footer">
            <a href="/blog" className="back-to-blog">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Blog
            </a>
          </footer>
        </article>
      </div>
    </>
  );
}
