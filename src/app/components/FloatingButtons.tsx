'use client';

import React, { useEffect, useState } from 'react';
import './FloatingButtons.css';

const FloatingButtons: React.FC = () => {
  const [showText, setShowText] = useState(false);
  const [startHopping, setStartHopping] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowText(true);
    }, 1600);

    const hopTimer = setTimeout(() => {
      setStartHopping(true);
    }, 2600); // 1600ms entrance + 1000ms delay = 2600ms

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hopTimer);
    };
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
        href="https://wa.me/971589575610"
        target="_blank"
        rel="noopener noreferrer"
        className={`whatsapp-float ${startHopping ? 'wa-pulse' : ''}`}
        aria-label="Chat on WhatsApp"
      >
        <svg className="wa-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.67-.5-5.25-1.44l-.38-.22-3.67.96.98-3.58-.25-.38A9.93 9.93 0 012 12C2 6.48 6.48 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0122 12c0 5.52-4.48 10-10 10zm5.47-7.47c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51H6.6c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" fill="#ffffff"/>
        </svg>
        <span className="wa-ring"></span>
      </a>

      <a
        href="tel:+971589575610"
        className={`call-float ${showText ? 'show-text' : ''} ${startHopping ? 'hopping' : ''}`}
        aria-label="Call us"
      >
        <svg className="call-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="#ffffff"/>
        </svg>
        <span className="call-text">Let&apos;s Get Your Approval Done!</span>
      </a>
    </>
  );
};

export default FloatingButtons;
