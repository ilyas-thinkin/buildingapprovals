import React from 'react';
import './ServicesSection.css';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: '🔥',
      title: 'Civil Defense Approvals',
      description: 'Expert assistance in obtaining Dubai Civil Defense permits & NOCs. Fast-track your fire safety approvals with certified consultants.',
      catchyText: 'Fire Safety Compliance Made Easy',
    },
    {
      icon: '⚡',
      title: 'DEWA Approval Service',
      description: 'Handles Dubai Electricity & Water Authority connection permits and power/water application processing.',
      catchyText: 'Power Up Your Project Faster',
    },
    {
      icon: '🏛️',
      title: 'Dubai Municipality Approval',
      description: 'Comprehensive Dubai Municipality permit processing. Fast-track building permits & technical approvals for your projects.',
      catchyText: 'Your Gateway to Building Success',
    },
    {
      icon: '🏢',
      title: 'Emaar Approval Authority',
      description: 'Community NOC and permit services for Emaar master communities.',
      catchyText: 'Master Community Approvals Simplified',
    },
    {
      icon: '🏝️',
      title: 'Nakheel Approval',
      description: 'Development permits and NOCs for Nakheel community projects.',
      catchyText: 'Navigate Nakheel Requirements Effortlessly',
    },
    {
      icon: '🍽️',
      title: 'Food Control Department',
      description: 'Restaurant and café food safety permits and compliance services.',
      catchyText: 'Serve Excellence with Full Compliance',
    },
    {
      icon: '💼',
      title: 'JAFZA Approval',
      description: 'Jebel Ali Free Zone building and operational approvals.',
      catchyText: 'Free Zone Success Starts Here',
    },
    {
      icon: '🏥',
      title: 'DHA Approval',
      description: 'Dubai Health Authority healthcare facility licensing and permits.',
      catchyText: 'Healthcare Licensing Without Headaches',
    },
  ];

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
                <p className="service-description">{service.description}</p>
                <a href="/services" className="service-link">
                  View Details
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
              <div className="service-card-hover-overlay">
                <h4 className="service-catchy-text">{service.catchyText}</h4>
              </div>
              <div className="service-card-accent"></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="services-cta">
          <a href="/services" className="btn-services-primary">
            View All Services
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
