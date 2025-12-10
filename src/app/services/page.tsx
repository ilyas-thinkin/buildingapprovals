'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ContactFormModal from '../components/ContactFormModal';
import './services.css';

interface Service {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const ServicesPage: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [isRailHovered, setIsRailHovered] = useState(false);
  const [autoScrollDirection, setAutoScrollDirection] = useState<1 | -1>(1);
  const [isTouching, setIsTouching] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const railSectionRef = useRef<HTMLElement>(null);

  const services = useMemo<Service[]>(() => ([
    {
      id: 'civil-defense',
      title: 'Civil Defense Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Expert assistance in obtaining Dubai Civil Defense permits & NOCs. Fast-track your fire safety approvals with our specialized team handling all technical requirements and documentation.'
    },
    {
      id: 'dewa',
      title: 'DEWA Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Streamlined electricity and water authority connection permits and power/water approval applications. Complete DEWA coordination and technical compliance support.'
    },
    {
      id: 'dubai-municipality',
      title: 'Dubai Municipality Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Comprehensive Dubai Municipality permit processing. Fast-track building permits & technical approvals with expert guidance through all regulatory requirements.'
    },
    {
      id: 'emaar',
      title: 'Emaar Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Professional community NOC and permit services for Emaar master communities. Seamless coordination with Emaar authorities for all development requirements.'
    },
    {
      id: 'nakheel',
      title: 'Nakheel Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Professional development permit services and NOCs for Nakheel projects. Expert handling of community-specific requirements and technical submissions.'
    },
    {
      id: 'jafza',
      title: 'JAFZA Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 21V9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Specialized Jebel Ali Free Zone permit solutions and building approvals. Complete support for industrial and commercial developments in JAFZA.'
    },
    {
      id: 'dha',
      title: 'DHA Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Specialized Dubai Health Authority licensing for healthcare facilities. Complete compliance support for medical establishments and health sector requirements.'
    },
    {
      id: 'dso',
      title: 'DSO Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Specialized Dubai Silicon Oasis authority clearance and technical requirements guidance. Expert navigation of DSO-specific regulations and approvals.'
    },
    {
      id: 'dda',
      title: 'Dubai Development Authority',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Complete DDA permit solutions for development approvals in Dubai zones. Comprehensive support for Dubai Development Authority requirements.'
    },
    {
      id: 'food-control',
      title: 'Food Control Department',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M18 8H19C20.1046 8 21 8.89543 21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10C3 8.89543 3.89543 8 5 8H6" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 12L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8V6C8 4.93913 8.42143 3.92172 9.17157 3.17157C9.92172 2.42143 10.9391 2 12 2C13.0609 2 14.0783 2.42143 14.8284 3.17157C15.5786 3.92172 16 4.93913 16 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Dubai food establishment permits, licensing, and safety approval management. Full compliance support for restaurants and food service businesses.'
    },
    {
      id: 'spa',
      title: 'Spa Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 14C8.13401 14 5 16.2386 5 19V21H19V19C19 16.2386 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 4C6 3 7 2 8 3C9 4 9 5 8 5C7 5 6 5 6 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 4C18 3 17 2 16 3C15 4 15 5 16 5C17 5 18 5 18 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Comprehensive spa licensing and establishment approval solutions. Expert handling of wellness facility permits and regulatory compliance.'
    },
    {
      id: 'shisha',
      title: 'Shisha Cafe License',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M17.5 7C17.5 7 16 9 16 11C16 13 17.5 15 17.5 15C17.5 15 19 13 19 11C19 9 17.5 7 17.5 7Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="17" r="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 17H6C4.89543 17 4 16.1046 4 15V10C4 8.89543 4.89543 8 6 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 11V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Complete licensing and permit solutions for shisha establishments. Specialized support for cafe permits and shisha-specific requirements.'
    },
    {
      id: 'smoking',
      title: 'Smoking Permit',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Assistance with smoking area permits and zone regulation compliance. Expert guidance on designated smoking area approvals.'
    },
    {
      id: 'pool',
      title: 'Swimming Pool Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M2 15C3.5 15 3.5 16 5 16C6.5 16 6.5 15 8 15C9.5 15 9.5 16 11 16C12.5 16 12.5 15 14 15C15.5 15 15.5 16 17 16C18.5 16 18.5 15 20 15C21.5 15 21.5 16 23 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 20C3.5 20 3.5 21 5 21C6.5 21 6.5 20 8 20C9.5 20 9.5 21 11 21C12.5 21 12.5 20 14 20C15.5 20 15.5 21 17 21C18.5 21 18.5 20 20 20C21.5 20 21.5 21 23 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 4L14 8L18 9L15 12L16 16L12 14L8 16L9 12L6 9L10 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Complete permit and safety clearance services for pools. Full coordination for pool construction and maintenance compliance.'
    },
    {
      id: 'solar',
      title: 'Solar Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2V4M12 20V22M22 12H20M4 12H2M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Comprehensive solar installation permit services and energy regulation guidance. Expert support for renewable energy system approvals.'
    },
    {
      id: 'signage',
      title: 'Signage Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Outdoor advertising and signage permits for Dubai requirements. Complete support for branding and display compliance.'
    },
    {
      id: 'tent',
      title: 'Tent Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M3 20L12 4L21 20H3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6.5 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M17.5 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Professional temporary structure permit solutions for facilities. Expert handling of event tent and temporary installation approvals.'
    },
    {
      id: 'rta',
      title: 'RTA Permit and Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 8H22L19 16H16V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
          <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      description: 'Professional RTA permit processing and transport-related approvals. Complete coordination with Roads and Transport Authority.'
    },
    {
      id: 'tecom',
      title: 'Tecom and DCCA Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M12 2L2 7V11C2 16.55 5.84 21.74 11 23C16.16 21.74 20 16.55 20 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Specialized permit processing for technology and creative clusters. Expert navigation of Tecom and DCCA specific requirements.'
    },
    {
      id: 'tpc',
      title: 'Third Party Consultants',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Professional TPC review and approval management. Complete coordination with certified third-party consultants for technical reviews.'
    },
    {
      id: 'trakhees',
      title: 'Trakhees Approval',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="service-icon-svg">
          <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Complete permit and licensing solutions for PCFC territory approvals. Expert handling of Ports, Customs and Free Zone Corporation requirements.'
    }
  ]), []);

  const handleClosePanel = () => {
    setActiveService(null);
  };

  const handleServiceClick = (serviceId: string) => {
    if (activeService === serviceId) {
      handleClosePanel();
      return;
    }

    setActiveService(serviceId);

    // Scroll to show both rail and panel in viewport
    setTimeout(() => {
      if (railSectionRef.current) {
        const yOffset = -20; // Small offset from top
        const element = railSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleEnquiry = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const handleTouchStart = () => {
    setIsTouching(true);
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
  };

  const activeServiceData = services.find(s => s.id === activeService);

  useEffect(() => {
    if (activeService || isRailHovered || isTouching) return;

    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;

    const interval = window.setInterval(() => {
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      const next = scrollEl.scrollLeft + autoScrollDirection * 1.2;

      if (next <= 0) {
        scrollEl.scrollTo({ left: 0, behavior: 'smooth' });
        setAutoScrollDirection(1);
      } else if (next >= maxScroll) {
        scrollEl.scrollTo({ left: maxScroll, behavior: 'smooth' });
        setAutoScrollDirection(-1);
      } else {
        scrollEl.scrollBy({ left: autoScrollDirection * 1.2, behavior: 'smooth' });
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [activeService, autoScrollDirection, isRailHovered, isTouching]);

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-content">
          <h1 className="services-hero-title">Our Services</h1>
          <p className="services-hero-subtitle">
            Comprehensive building approval solutions across Dubai. Expert guidance for all regulatory requirements.
          </p>
        </div>
      </section>

      {/* Interactive Services Rail */}
      <section className="services-rail-section" ref={railSectionRef}>
        <div className="services-rail-header">
          <h2 className="services-rail-title">Quick View: Explore Approvals</h2>
          <p className="services-rail-subtitle">Tap an icon to preview details instantly.</p>
        </div>
        <div className="services-rail-container">
          <button
            className="rail-arrow rail-arrow-left"
            onClick={scrollLeft}
            onMouseEnter={() => setIsRailHovered(true)}
            onMouseLeave={() => setIsRailHovered(false)}
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            className="services-rail-scroll"
            ref={scrollContainerRef}
            onMouseEnter={() => setIsRailHovered(true)}
            onMouseLeave={() => setIsRailHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="services-rail">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`service-rail-item ${activeService === service.id ? 'active' : ''}`}
                  onClick={() => handleServiceClick(service.id)}
                  aria-label={`View ${service.title}`}
                >
                  <div className="service-rail-icon">
                    {service.icon}
                  </div>
                  <span className="service-rail-label">{service.title}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className="rail-arrow rail-arrow-right"
            onClick={scrollRight}
            onMouseEnter={() => setIsRailHovered(true)}
            onMouseLeave={() => setIsRailHovered(false)}
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Service Description Panel */}
        {activeServiceData && (
          <div
            className="service-detail-panel"
          >
            <button
              className="panel-close"
              onClick={handleClosePanel}
              aria-label="Close panel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div
              className="panel-content"
            >
              <div className="panel-icon-badge">
                {activeServiceData.icon}
              </div>
              <div className="panel-heading">
                <div className="panel-title-section">
                  <h3 className="panel-title">{activeServiceData.title}</h3>
                  <p className="panel-description">{activeServiceData.description}</p>
                </div>
                <div className="panel-cta-group">
                  <button
                    className="panel-cta"
                    onClick={() => handleEnquiry(activeServiceData.title)}
                  >
                    Send Enquiry
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 14L14 4M14 4H6M14 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <a
                    href={`/services/${activeServiceData.id}`}
                    className="panel-cta panel-cta-secondary"
                  >
                    View Service
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 14L14 4M14 4H6M14 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="services-grid-container">
          <div className="services-grid-header">
            <h2 className="services-grid-title">Complete Service Portfolio</h2>
            <p className="services-grid-subtitle">
              Professional approval services for every regulatory requirement in Dubai
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-icon">
                  {service.icon}
                </div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-description">{service.description}</p>
                <a
                  href={`/services/${service.id}`}
                  className="service-card-cta"
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
