import React from 'react';
import Image from 'next/image';
import './StandoutSection.css';

const StandoutSection: React.FC = () => {
  const features = [
    'One-Stop Approval Command Center',
    'Single Point of Contact for 20+ Dubai Authorities',
    'No Need to Juggle Multiple Consultants',
    'Centralized Tracking of All Your Approvals',
    'End-to-End Management from Submission to Completion',
    'Guaranteed Timeline Delivery',
    'Clear, Committed Timelines for Each Approval',
    'Fast-Track Processing Through Established Authority Channels',
    'Real-Time Progress Updates',
    'No More Unpredictable Waiting Periods or Delays',
    'Authority Relationship Advantage',
    'Direct Working Relationships with Key Dubai Authorities',
    'Deep Understanding of Latest Regulations and Requirements',
    'Proven Track Record with Civil Defense, DEWA, DM, and More',
  ];

  return (
    <section className="standout-section" id="standout">
      <div className="standout-container">
        {/* Section Header */}
        <div className="standout-header">
          <h2 className="standout-title">What Makes Us Stand Out From The Rest</h2>
          <p className="standout-subtitle">
            Your trusted partner for seamless building approvals across all Dubai authorities
          </p>
        </div>

        {/* Content Grid */}
        <div className="standout-content">
          {/* Left Column - Features List */}
          <div className="standout-features">
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.6667 5L7.5 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">{feature}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="standout-image-wrapper">
            <div className="standout-image-container">
              <Image
                src="/images/standout-office.png"
                alt="Professional building approvals consultancy office in Dubai by Building Approvals Dubai"
                width={500}
                height={700}
                className="standout-image"
              />
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StandoutSection;
