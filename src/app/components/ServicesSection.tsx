"use client";

import React, { useState } from 'react';
import './ServicesSection.css';
import ContactFormModal from './ContactFormModal';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: '🔥',
      title: 'Civil Defense Approvals',
      description:
        'Expert assistance in obtaining Dubai Civil Defense permits & NOCs. Fast-track your fire safety approvals with certified consultants.',
      mobileBlurb: 'Fast NOCs and fire-safety approvals handled by certified experts.',
      catchyText: 'Fire Safety Compliance Made Easy',
    },
    {
      icon: '⚡',
      title: 'DEWA Approval Service',
      description: 'Handles Dubai Electricity & Water Authority connection permits and power/water application processing.',
      mobileBlurb: 'Speedy DEWA power and water connections without paperwork stress.',
      catchyText: 'Power Up Your Project Faster',
    },
    {
      icon: '🏛️',
      title: 'Dubai Municipality Approval',
      description:
        'Comprehensive Dubai Municipality permit processing. Fast-track building permits & technical approvals for your projects.',
      mobileBlurb: 'Building permits and technical approvals fast-tracked for your project.',
      catchyText: 'Your Gateway to Building Success',
    },
    {
      icon: '🏢',
      title: 'Emaar Approval Authority',
      description: 'Community NOC and permit services for Emaar master communities.',
      mobileBlurb: 'Emaar community NOCs guided from paperwork to approval.',
      catchyText: 'Master Community Approvals Simplified',
    },
    {
      icon: '🏝️',
      title: 'Nakheel Approval',
      description: 'Development permits and NOCs for Nakheel community projects.',
      mobileBlurb: 'Smooth Nakheel permits for villas, towers, and retail builds.',
      catchyText: 'Navigate Nakheel Requirements Effortlessly',
    },
    {
      icon: '🍽️',
      title: 'Food Control Department',
      description: 'Restaurant and café food safety permits and compliance services.',
      mobileBlurb: 'Kitchen and café permits cleared with food safety compliance built in.',
      catchyText: 'Serve Excellence with Full Compliance',
    },
    {
      icon: '💼',
      title: 'JAFZA Approval',
      description: 'Jebel Ali Free Zone building and operational approvals.',
      mobileBlurb: 'Free zone fit-out and operational approvals done right and fast.',
      catchyText: 'Free Zone Success Starts Here',
    },
    {
      icon: '🏥',
      title: 'DHA Approval',
      description: 'Dubai Health Authority healthcare facility licensing and permits.',
      mobileBlurb: 'Clinic and healthcare licensing with compliance handled for you.',
      catchyText: 'Healthcare Licensing Without Headaches',
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const openEnquiryModal = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    setIsModalOpen(true);
  };

  const openGenericEnquiry = () => {
    setSelectedService('');
    setIsModalOpen(true);
  };

  const closeEnquiryModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Section Header */}
        <div className="services-header">
          <h2 className="services-title">Our Services</h2>
          <p className="services-subtitle">
            Comprehensive authority approval solutions for every project need in Dubai
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-card-content">
                <div className="service-icon-circle">
                  <span className="service-icon">{service.icon}</span>
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">
                  <span className="service-description-full">{service.description}</span>
                  <span className="service-description-compact">{service.mobileBlurb}</span>
                </p>
                <a href="/services" className="service-link">
                  View Details
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <button
                  type="button"
                  className="service-card-inline-cta"
                  onClick={() => openEnquiryModal(service.title)}
                  aria-label={`Send enquiry about ${service.title}`}
                >
                  Send Enquiry
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className="service-card-hover-overlay"
                onClick={() => openEnquiryModal(service.title)}
                aria-label={`Send enquiry about ${service.title}`}
              >
                <h4 className="service-catchy-text">Send Enquiry</h4>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="service-card-accent"></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="services-cta">
          <a href="/services" className="btn-services-primary">
            View All Services
          </a>
          <button type="button" className="btn-services-secondary" onClick={openGenericEnquiry}>
            Enquire
          </button>
        </div>
      </div>

      <button
        type="button"
        className="enquiry-float"
        onClick={openGenericEnquiry}
        aria-label="Open enquiry form"
      >
        Enquire
      </button>

      <a
        className="whatsapp-float"
        href="https://wa.me/97143886600?text=Hello%20I%20have%20an%20enquiry"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12.04 2C6.57 2 2.1 6.28 2.1 11.5c0 1.77.5 3.41 1.38 4.84L2 22l5.87-1.53a10.4 10.4 0 0 0 4.17.85c5.47 0 9.94-4.28 9.94-9.5C22 6.28 17.52 2 12.04 2Z"
            fill="#006efe"
          />
          <path
            d="M17.08 14.39c-.26-.13-1.56-.77-1.8-.86-.24-.09-.41-.13-.59.13-.18.26-.68.86-.83 1.03-.15.17-.3.2-.56.07-.26-.13-1.1-.42-2.1-1.33-.78-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.12-.53.12-.12.26-.33.38-.5.13-.17.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.38-.81-1.9-.21-.5-.42-.43-.59-.44-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.32-.24.26-.9.88-.9 2.16 0 1.27.93 2.5 1.06 2.67.12.17 1.83 2.9 4.46 3.95.62.25 1.1.4 1.48.51.62.2 1.18.17 1.62.1.49-.07 1.56-.63 1.78-1.24.22-.61.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3Z"
            fill="#ffffff"
          />
        </svg>
      </a>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={closeEnquiryModal}
        selectedService={selectedService}
      />
    </section>
  );
};

export default ServicesSection;
