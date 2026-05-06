'use client';

import { useState } from 'react';
import ContactFormModal from '../components/ContactFormModal';

export default function BlogBottomActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="blog-bottom-copy-actions">
        <button type="button" onClick={() => setIsModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6.75C4 5.78 4.78 5 5.75 5H18.25C19.22 5 20 5.78 20 6.75V17.25C20 18.22 19.22 19 18.25 19H5.75C4.78 19 4 18.22 4 17.25V6.75Z" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M5 7L12 12.25L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Get in touch
        </button>
        <a href="tel:+971589575610">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.6 10.8C8.05 13.65 10.35 15.95 13.2 17.4L15.4 15.2C15.68 14.92 16.08 14.83 16.44 14.95C17.58 15.33 18.78 15.53 20 15.53C20.55 15.53 21 15.98 21 16.53V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.48C8.03 3 8.48 3.45 8.48 4C8.48 5.22 8.68 6.42 9.05 7.56C9.16 7.92 9.08 8.31 8.79 8.6L6.6 10.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          </svg>
          058 957 5610
        </a>
      </div>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService=""
      />
    </>
  );
}
