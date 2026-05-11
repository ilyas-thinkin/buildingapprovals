import type { Metadata } from 'next';
import Image from 'next/image';
import { getAllPosts } from '@/lib/getAllPosts';
import BlogBottomActions from './BlogBottomActions';
import './blog.css';

// ─── SITE CONFIG ──────────────────────────────────────────────────────────────
const SITE_NAME = 'Building Approvals Dubai';
const SITE_URL  = 'https://www.buildingapprovals.ae';
// ──────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: 'Expert guides and insights on Dubai building approvals, authority permits, and construction regulations from the Building Approvals Dubai team.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: { en: `${SITE_URL}/blog`, 'x-default': `${SITE_URL}/blog` },
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: 'Expert guides and insights on Dubai building approvals, authority permits, and construction regulations.',
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_AE',
    images: [
      {
        url: `${SITE_URL}/images/BA OG Logo_imresizer (1).png?v=2`,
        width: 1200,
        height: 1200,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog | ${SITE_NAME}`,
    description: 'Expert guides and insights on Dubai building approvals, authority permits, and construction regulations.',
    images: [`${SITE_URL}/images/BA OG Logo_imresizer (1).png?v=2`],
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-container">
          <span className="blog-hero-tag">Our Blog</span>
          <h1 className="blog-hero-title">
            Dubai Approvals <span>Insider</span>
          </h1>
          <p className="blog-hero-subtitle">
            Expert articles written by the {SITE_NAME} team.
          </p>
        </div>
      </section>

      <section className="blog-intro-section">
        <div className="blog-intro-container">
          <p className="blog-intro-text">
            Our blog shares practical guidance on navigating Dubai&apos;s building approval process. We cover Dubai Municipality, Civil Defence, DEWA, free zone approvals, and more — written clearly and kept up to date for 2026.
          </p>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="blog-list-container">
          <div className="blog-section-heading">
            <span className="blog-section-kicker">Latest Articles</span>
            <h2 className="blog-section-title">Fresh from the team</h2>
          </div>
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.id} className="blog-card">
                <a href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-image">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={240}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="blog-card-category">{post.category}</span>
                  </div>
                  <div className="blog-card-content">
                    <h2 className="blog-card-title">{post.title}</h2>
                    <button className="blog-card-arrow" aria-label="Read more">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-bottom-copy-section" aria-label="Building approvals in Dubai">
        <div className="blog-bottom-copy-container">
          <div className="blog-bottom-copy-mark" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M9 12.75L11.25 15L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.75 6.5L12 3L19.25 6.5V11.25C19.25 15.75 16.4 19.9 12 21.25C7.6 19.9 4.75 15.75 4.75 11.25V6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="blog-bottom-copy-content">
            <span className="blog-bottom-copy-kicker">Dubai approval guidance</span>
            <h2>Move your project forward with the right approvals</h2>
            <p>
              Building approvals are an important step before starting any construction, renovation, or fit-out project in Dubai. Proper authority approvals help ensure your project follows local regulations, safety standards, and municipality requirements. Whether you need dubai approvals for commercial spaces, villas, offices, or modifications, getting the right guidance can save time and avoid costly delays. With professional support for approvals dubai, your project can move smoothly from documentation to final approval.
            </p>
            <div className="blog-bottom-copy-tags" aria-label="Approval support areas">
              <span>Commercial spaces</span>
              <span>Villa modifications</span>
              <span>Fit-out projects</span>
            </div>
            <BlogBottomActions />
          </div>
        </div>
      </section>
    </div>
  );
}
