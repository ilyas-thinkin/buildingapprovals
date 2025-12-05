import React from 'react';
import Image from 'next/image';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Column - Content */}
        <div className="hero-content">
          {/* Main Headline */}
          <h1 className="hero-headline">
            Authority approvals. Done right. On time.
          </h1>

          {/* Subheadline */}
          <p className="hero-subheadline">
            Dubai's specialist consultancy for contractors, consultants, and developers who need regulatory certainty—not surprises.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <a href="/contact" className="btn-primary">
              Get Approval Support
            </a>
            <a href="#process" className="btn-secondary">
              View Our Process
            </a>
          </div>

          {/* Trust Badge Strip */}
          <div className="hero-trust-badges">
            <div className="trust-badge">
              <span className="trust-badge-text">10+ Authorities</span>
            </div>
            <div className="trust-badge-divider">•</div>
            <div className="trust-badge">
              <span className="trust-badge-text">500+ Projects</span>
            </div>
            <div className="trust-badge-divider">•</div>
            <div className="trust-badge">
              <span className="trust-badge-text">Zero Resubmissions</span>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="hero-image-wrapper">
          <Image
            src="/images/heroimg1.png"
            alt="Dubai Building Approvals"
            width={600}
            height={600}
            priority
            className="hero-image"
          />
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="scroll-arrow"
          >
            <path
              d="M12 5V19M12 19L5 12M12 19L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
