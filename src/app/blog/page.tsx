import React from 'react';
import { Metadata } from 'next';
import { blogPosts } from './blogData';
import './blog.css';

export const metadata: Metadata = {
  title: 'Blog - Building Approvals Dubai | Latest News & Guides',
  description: 'Read the latest articles, guides, and updates on Dubai building approvals, authority permits, and construction regulations.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/blog',
  },
};

export default function BlogPage() {
  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-container">
          <h1 className="blog-hero-title">Our Blog</h1>
          <p className="blog-hero-subtitle">
            Latest insights, guides, and updates on Dubai building approvals and authority permits
          </p>
        </div>
      </section>

      <section className="blog-list-section">
        <div className="blog-list-container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <a href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-card-image">
                    <img src={post.image} alt={post.title} />
                    <span className="blog-card-category">{post.category}</span>
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-card-date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="blog-card-author">By {post.author}</span>
                    </div>
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <span className="blog-card-read-more">
                      Read More
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
