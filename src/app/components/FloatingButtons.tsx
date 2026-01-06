'use client';

import React, { useEffect, useState } from 'react';
import './FloatingButtons.css';

const FloatingButtons: React.FC = () => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* <button
        type="button"
        className="enquiry-float"
        onClick={openModal}
        aria-label="Send Enquiry"
      >
        Send Enquiry
      </button> */}

      <a
        href="tel:+971589575610"
        className={`call-float ${showText ? 'show-text' : ''}`}
        aria-label="Call us"
      >
        <svg className="call-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="#006efe"/>
        </svg>
        <span className="call-text">Let&apos;s Get Your Approval Done!</span>
      </a>
    </>
  );
};

export default FloatingButtons;
