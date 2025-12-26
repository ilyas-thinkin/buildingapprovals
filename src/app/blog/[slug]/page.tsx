import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts } from '../blogData';
import './blog-post.css';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug);

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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Content for Dubai Municipality Approval Process 2026
  const renderContent = () => {
    if (post.slug === 'dubai-municipality-approval-process-2026') {
      return (
        <>
          <p className="blog-intro">
            Dubai's construction sector continues to grow rapidly in 2026, with strict regulations designed to ensure safety, sustainability, and compliance with international standards. Whether you are planning a villa, office fit-out, commercial building, or warehouse, understanding the <strong>Dubai Municipality approval process 2026</strong> is crucial to secure your building approvals in Dubai without delays.
          </p>
          <p>
            This step-by-step guide covers each stage of the process, required documents, estimated timelines, and practical tips for a smooth approval journey.
          </p>

          <h2>Step 1: Prepare Your Application Documents</h2>
          <p>
            Before submitting your project, ensure all documentation meets Dubai Municipality requirements:
          </p>
          <ul>
            <li>Complete architectural drawings (plans, elevations, sections)</li>
            <li>Site plans showing plot details, setbacks, and access routes</li>
            <li>Proof of compliance with updated <strong>Dubai building codes</strong></li>
            <li>Supporting documents for approvals and compliance certificates</li>
            <li>Final review to avoid missing or inconsistent information</li>
          </ul>
          <div className="pro-tip">
            <strong>Pro Tip:</strong> Double-check all drawings and documents before submission to reduce back-and-forth revisions.
          </div>

          <h2>Step 2: Technical Assessment</h2>
          <p>
            Dubai Municipality conducts a detailed technical review to verify:
          </p>
          <ul>
            <li>Compliance with zoning regulations</li>
            <li>Adherence to building codes and safety standards</li>
            <li>Setback, height, and coverage requirements</li>
            <li>Overall conformity of the project with regulatory frameworks</li>
          </ul>
          <p>
            Projects that meet all technical requirements are forwarded for multi-department review.
          </p>

          <h2>Step 3: Multi-Departmental Review</h2>
          <p>
            Several departments assess your application:
          </p>
          <ul>
            <li><strong>Building Department:</strong> Ensures structural and construction compliance</li>
            <li><strong>Planning Department:</strong> Verifies land use, zoning, and urban planning adherence</li>
            <li><strong>Health Department:</strong> Confirms safety, hygiene, and health standards</li>
            <li><strong>Environment Department:</strong> Checks environmental impact and sustainability measures</li>
          </ul>
          <p>
            Coordinated assessment ensures your project meets all regulatory requirements.
          </p>

          <h2>Step 4: Address Modifications and Clarifications</h2>
          <p>
            Authorities may request changes or additional information:
          </p>
          <ul>
            <li>Respond promptly to all queries from departments</li>
            <li>Update drawings, documents, or technical reports as required</li>
            <li>Resubmit the revised application for final consideration</li>
          </ul>
          <div className="tip">
            <strong>Tip:</strong> Quick response to modification requests significantly speeds up the approval timeline.
          </div>

          <h2>Step 5: Obtain Preliminary Approval</h2>
          <p>
            Once your application passes reviews:
          </p>
          <ul>
            <li>Receive preliminary approval notification</li>
            <li>Review conditions and requirements attached to the approval</li>
            <li>Gain authorization to commence project planning and preparation</li>
          </ul>

          <h2>Step 6: Secure the Final Building Permit</h2>
          <p>
            The last step allows you to legally begin construction:
          </p>
          <ul>
            <li>Obtain the final building permit from Dubai Municipality</li>
            <li>Ensure all conditions and compliance requirements are fully met</li>
          </ul>

          <h2>Typical Approval Timelines</h2>
          <div className="timeline-table">
            <table>
              <thead>
                <tr>
                  <th>Project Type</th>
                  <th>Timeline (Approx.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residential</td>
                  <td>3–8 weeks</td>
                </tr>
                <tr>
                  <td>Commercial</td>
                  <td>6–12 weeks</td>
                </tr>
              </tbody>
            </table>
            <p className="table-note"><em>Timelines vary based on project complexity, size, and required permits.</em></p>
          </div>

          <h2>Why Professional Support Speeds Up Dubai Building Approvals</h2>
          <p>
            Hiring experts can help you navigate the complexities of <strong>Dubai Municipality approvals:</strong>
          </p>
          <ul>
            <li>Ensure submissions comply with the latest building codes</li>
            <li>Coordinate efficiently with architects, engineers, and consultants</li>
            <li>Identify compliance issues before submission to avoid rejections</li>
            <li>Manage documents and follow up with authorities</li>
            <li>Receive regular updates on application status</li>
            <li>Increase the likelihood of first-time approval</li>
          </ul>

          <h2>Common Challenges We Manage for Smooth Approvals</h2>
          <p>
            Dubai building approvals may face obstacles such as:
          </p>
          <ul>
            <li>Extended processing times due to municipal backlogs</li>
            <li>Rejections from incomplete or inaccurate documentation</li>
            <li>Non-compliance with updated building codes</li>
            <li>Coordination across multiple departments</li>
            <li>Heritage preservation requirements in historic areas</li>
            <li>Adhering to sustainable building practices</li>
          </ul>

          <h2>Key Takeaways</h2>
          <ul className="key-takeaways">
            <li>Understanding the <strong>Dubai Municipality approval process 2026</strong> is essential for timely building approvals</li>
            <li>Preparation, accurate documentation, and professional guidance can reduce delays</li>
            <li>Following a structured step-by-step process ensures smooth approval for residential and commercial projects</li>
          </ul>

          <div className="cta-box">
            <h3>Need Help with Dubai Municipality Approvals?</h3>
            <p>Our expert team can guide you through every step of the approval process, ensuring compliance and fast-tracking your project.</p>
            <a href="/contact" className="cta-button">Get a Free Consultation</a>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="blog-post-page">
      <article className="blog-post">
        <header className="blog-post-header">
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

        <div className="blog-post-image">
          <img src={post.image} alt={post.title} />
        </div>

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
