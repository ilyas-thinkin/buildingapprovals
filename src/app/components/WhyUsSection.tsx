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

        {/* Reasons Grid */}
        <div className="whyus-grid">
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
