'use client';

import React, { useState, useEffect, useRef } from 'react';
import './WhyUsSection.css';

const WhyUsSection: React.FC = () => {
  const [counters, setCounters] = useState({
    projects: 0,
    authorities: 0,
    satisfaction: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const MOBILE_CARD_GAP = 16;
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);

      setCounters({
        projects: Math.round(easeOutQuad * 500),
        authorities: Math.round(easeOutQuad * 10),
        satisfaction: Math.round(easeOutQuad * 100),
      });

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Capture mobile slide width plus gap so transforms keep cards centered
  useEffect(() => {
    const updateSlideOffset = () => {
      if (!carouselRef.current || !isMobile) {
        setSlideOffset(0);
        setStartOffset(0);
        return;
      }

      const cards = carouselRef.current.querySelectorAll('.whyus-card') as NodeListOf<HTMLElement>;
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
  }, [isMobile, currentSlide]);

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
        setCurrentSlide((prev) => Math.min(prev + 1, reasons.length - 1));
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

  const reasons = [
    {
      number: '01',
      title: 'Expert Knowledge',
      description: 'Deep understanding of Dubai\'s regulatory landscape across 10+ authorities. Our certified consultants navigate complex approval processes with precision.',
      highlight: '10+ Years Experience',
    },
    {
      number: '02',
      title: 'Zero Resubmissions',
      description: 'First-time approval success through meticulous documentation and pre-submission verification. We get it right the first time, every time.',
      highlight: '100% Success Rate',
    },
    {
      number: '03',
      title: 'Fast-Track Processing',
      description: 'Accelerated approval timelines through established authority relationships and streamlined processes. Your project stays on schedule.',
      highlight: '50% Faster Approvals',
    },
    {
      number: '04',
      title: 'End-to-End Support',
      description: 'Comprehensive project guidance from initial consultation to final approval. Single point of contact for all authority requirements.',
      highlight: 'Full Project Coverage',
    },
  ];

  return (
    <section className="whyus-section" id="why-us">
      <div className="whyus-container">
        {/* Section Header */}
        <div className="whyus-header">
          <span className="whyus-badge">Why Choose Us</span>
          <h2 className="whyus-title">Your Trusted Authority Approval Partner</h2>
          <p className="whyus-subtitle">
            We combine regulatory expertise with operational excellence to deliver
            approval certainty for Dubai's most demanding projects
          </p>
        </div>

        {/* Reasons Grid / Carousel */}
        <div className="whyus-carousel-wrapper">
          <div
            className={`whyus-grid ${isMobile ? 'mobile-carousel' : ''}`}
            ref={carouselRef}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            style={mobileTransform}
          >
            {reasons.map((reason, index) => (
              <div key={index} className="whyus-card">
                <div className="card-number">{reason.number}</div>
                <div className="card-content">
                  <h3 className="card-title">{reason.title}</h3>
                  <p className="card-description">{reason.description}</p>
                  <div className="card-highlight">
                    <span className="highlight-icon">✓</span>
                    <span className="highlight-text">{reason.highlight}</span>
                  </div>
                </div>
                <div className="card-decoration"></div>
              </div>
            ))}
          </div>

          {/* Carousel Dots - Mobile Only */}
          {isMobile && (
            <div className="carousel-dots">
              {reasons.map((_, index) => (
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

        {/* Stats Bar */}
        <div className="whyus-stats" ref={statsRef}>
          <div className="stat-item">
            <div className="stat-number">{counters.projects}+</div>
            <div className="stat-label">Projects Approved</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">{counters.authorities}+</div>
            <div className="stat-label">Authority Partners</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">{counters.satisfaction}%</div>
            <div className="stat-label">Client Satisfaction</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Project Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
