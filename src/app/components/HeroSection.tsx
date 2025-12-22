'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ContactFormModal from './ContactFormModal';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Column - Content */}
        <div className="hero-content">
          {/* Main Headline */}
          <h1 className="hero-headline">
            Dubai&apos;s Leading Approval Service Experts
          </h1>

          {/* Subheadline */}
          <p className="hero-subheadline">
            We handle all major authority requirements, including Dubai Municipality approval, Civil Defence approval, DEWA approval, Nakheel approval, DHA approval, and other relevant approvals. We ensure your project progresses smoothly, compliantly, and without delays.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-group">
            <button type="button" className="btn-primary" onClick={openModal}>
              Free Quote
            </button>
            <a href="/services" className="btn-secondary">
              Our Services
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
            src="/images/HeroImage.png"
            alt="Dubai building approvals and authority services by Building Approvals Dubai"
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
    <ContactFormModal
      isOpen={isModalOpen}
      onClose={closeModal}
      selectedService=""
    />
    </>
  );
};

export default HeroSection;
