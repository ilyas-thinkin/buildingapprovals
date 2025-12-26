import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts } from '../blogData';
import './blog-post.css';
import DubaiMunicipalityApprovalContent from './content/dubai-municipality-approval-process-2026';

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

  return {
    title: `${post.title} | Building Approvals Dubai`,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.buildingapprovals.ae/blog/${post.slug}`,
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

    return null;
  };

  return (
    <div className="blog-post-page">
      <article className="blog-post">
        <header
          className="blog-post-header"
          style={{
            backgroundImage: `url(${post.coverImage || post.image})`
          }}
        >
          <div className="blog-post-header-content">
            <span className="blog-post-category">{post.category}</span>
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span className="blog-post-date">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="blog-post-author">By {post.author}</span>
            </div>
          </div>
        </header>

        <div className="blog-post-content">
          {renderContent()}
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
  );
}
