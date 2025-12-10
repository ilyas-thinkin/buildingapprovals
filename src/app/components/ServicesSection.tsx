"use client";

import React, { useState, useRef, useEffect } from 'react';
import './ServicesSection.css';
// import ContactFormModal from './ContactFormModal';

const ServicesSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const MOBILE_CARD_GAP = 16;
  const [slideOffset, setSlideOffset] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: 'civil-defense',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Civil Defense Approvals',
      description:
        'Expert assistance in obtaining Dubai Civil Defense permits & NOCs. Fast-track your fire safety approvals with certified consultants.',
    },
    {
      id: 'dewa',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'DEWA Approval Service',
      description: 'Handles Dubai Electricity & Water Authority connection permits and power/water application processing.',
    },
    {
      id: 'dubai-municipality',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Dubai Municipality Approval',
      description:
        'Comprehensive Dubai Municipality permit processing. Fast-track building permits & technical approvals for your projects.',
    },
    {
      id: 'emaar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Emaar Approval Authority',
      description: 'Community NOC and permit services for Emaar master communities.',
    },
    {
      id: 'nakheel',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Nakheel Approval',
      description: 'Development permits and NOCs for Nakheel community projects.',
    },
    {
      id: 'food-control',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M18 8H19C20.1046 8 21 8.89543 21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10C3 8.89543 3.89543 8 5 8H6" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 12L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8V6C8 4.93913 8.42143 3.92172 9.17157 3.17157C9.92172 2.42143 10.9391 2 12 2C13.0609 2 14.0783 2.42143 14.8284 3.17157C15.5786 3.92172 16 4.93913 16 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Food Control Department',
      description: 'Restaurant and café food safety permits and compliance services.',
    },
    {
      id: 'jafza',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'JAFZA Approval',
      description: 'Jebel Ali Free Zone building and operational approvals.',
    },
    {
      id: 'dha',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'DHA Approval',
      description: 'Dubai Health Authority healthcare facility licensing and permits.',
    },
  ];

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedService, setSelectedService] = useState('');

  // const openEnquiryModal = (serviceTitle: string) => {
  //   setSelectedService(serviceTitle);
  //   setIsModalOpen(true);
  // };

  // const openGenericEnquiry = () => {
  //   setSelectedService('');
  //   setIsModalOpen(true);
  // };

  // const closeEnquiryModal = () => {
  //   setIsModalOpen(false);
  // };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Capture mobile slide width plus gap so transforms center each card
  useEffect(() => {
    const updateSlideOffset = () => {
      if (!carouselRef.current || !isMobile) {
        setSlideOffset(0);
        setStartOffset(0);
        return;
      }

      const cards = carouselRef.current.querySelectorAll('.service-card') as NodeListOf<HTMLElement>;
      if (!cards.length) return;

      const firstCard = cards[0];
      const firstCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2;
      const containerCenter = carouselRef.current.offsetWidth / 2;

      setStartOffset(containerCenter - firstCenter);

      if (cards.length > 1) {
        const secondCard = cards[1];
        const secondCenter = secondCard.offsetLeft + secondCard.offsetWidth / 2;
        setSlideOffset(secondCenter - firstCenter);
      } else {
        setSlideOffset(firstCard.offsetWidth + MOBILE_CARD_GAP);
      }
    };

    updateSlideOffset();
    window.addEventListener('resize', updateSlideOffset);
    return () => window.removeEventListener('resize', updateSlideOffset);
  }, [isMobile]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - next slide
        setCurrentSlide((prev) => Math.min(prev + 1, services.length - 1));
      } else {
        // Swipe right - previous slide
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const mobileTransform = isMobile
    ? {
        transform: `translateX(${startOffset - currentSlide * slideOffset}px)`,
      }
    : undefined;

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        {/* Section Header */}
        <div className="services-header">
          <div className="services-header-content">
            <h2 className="services-title">Our Services</h2>
            <p className="services-subtitle">
              Comprehensive authority approval solutions for every project need in Dubai
            </p>
          </div>
          <a href="/services" className="btn-view-all-services">
            View All Services
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 14L14 4M14 4H6M14 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Services Grid / Carousel */}
        <div className="services-carousel-wrapper">
          <div
            className={`services-grid ${isMobile ? 'mobile-carousel' : ''}`}
            ref={carouselRef}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            style={mobileTransform}
          >
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-card-icon">
                  {service.icon}
                </div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-description">{service.description}</p>
                <a href={`/services/${service.id}`} className="service-card-cta">
                  Read More
                  <span className="service-card-cta-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M7 5L10 8L7 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              </div>
            ))}
          </div>

          {/* Carousel Dots - Mobile Only */}
          {isMobile && (
            <div className="carousel-dots">
              {services.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="services-cta">
          <a href="/services" className="btn-services-primary">
            View All Services
          </a>
        </div>
      </div>

      {/* <button
        type="button"
        className="enquiry-float"
        onClick={openGenericEnquiry}
        aria-label="Open enquiry form"
      >
        Enquire
      </button> */}

      {/* <a
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
      </a> */}

      {/* <ContactFormModal
        isOpen={isModalOpen}
        onClose={closeEnquiryModal}
        selectedService={selectedService}
      /> */}
    </section>
  );
};

export default ServicesSection;
