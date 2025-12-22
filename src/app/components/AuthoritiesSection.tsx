"use client";

import React from 'react';
import './AuthoritiesSection.css';

const AuthoritiesSection: React.FC = () => {
  const authorities = [
    {
      name: 'Civil Defense',
      logo: '/images/authorities/civil-defense.png',
      alt: 'Civil Defense approval by Building Approvals Dubai'
    },
    {
      name: 'Dubai Municipality',
      logo: '/images/authorities/dubai-municipality.png',
      alt: 'Dubai Municipality approval by Building Approvals Dubai'
    },
    {
      name: 'Emaar',
      logo: '/images/authorities/emaar.png',
      alt: 'Emaar approval by Building Approvals Dubai'
    },
    {
      name: 'Nakheel',
      logo: '/images/authorities/nakheel.png',
      alt: 'Nakheel approval by Building Approvals Dubai'
    },
    {
      name: 'JAFZA',
      logo: '/images/authorities/jafza.png',
      alt: 'JAFZA approval by Building Approvals Dubai'
    },
    {
      name: 'DHA',
      logo: '/images/authorities/dha.png',
      alt: 'Dubai Healthcare Authority approval by Building Approvals Dubai'
    },
    {
      name: 'DSO',
      logo: '/images/authorities/dso.png',
      alt: 'Dubai Silicon Oasis approval by Building Approvals Dubai'
    },
    {
      name: 'DDA',
      logo: '/images/authorities/dda.png',
      alt: 'Dubai Development Authority approval by Building Approvals Dubai'
    },
    {
      name: 'Trakhees',
      logo: '/images/authorities/trakhees.png',
      alt: 'Trakhees approval by Building Approvals Dubai'
    }
  ];

  return (
    <section className="authorities-section">
      <div className="authorities-container">
        <div className="authorities-header">
          <h2 className="authorities-title">Our Authorities</h2>
          <p className="authorities-subtitle">
            One-stop engineering approval solutions for all authorities across Dubai
          </p>
        </div>

        <div className="authorities-scroll-wrapper">
          <div className="authorities-scroll-track">
            {/* First set of logos */}
            {authorities.map((authority, index) => (
              <div
                key={`first-${index}`}
                className="authority-item"
              >
                <img
                  src={authority.logo}
                  alt={authority.alt}
                  className="authority-logo"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {authorities.map((authority, index) => (
              <div
                key={`second-${index}`}
                className="authority-item"
              >
                <img
                  src={authority.logo}
                  alt={authority.alt}
                  className="authority-logo"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthoritiesSection;
