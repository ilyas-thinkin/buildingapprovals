'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ContactFormModal from './ContactFormModal';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openConsultationModal = () => {
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeConsultationModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <a href="/" className="navbar-logo">
            <img src="/images/Building Approvals OG Logo.png" alt="Building Approvals Dubai logo" />
          </a>

          {/* Desktop Navigation */}
          <div className="navbar-menu">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a href="/services" className={`nav-link ${pathname === '/services' ? 'active' : ''}`}>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a href="/blog" className={`nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`}>
                  Blog
                </a>
              </li>
              <li className="nav-item">
                <a href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>
                  Contact Us
                </a>
              </li>
            </ul>

            {/* CTA Button */}
            <button type="button" className="btn-cta" onClick={openConsultationModal}>
              Get in touch
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeMobileMenu();
          }
        }}
      >
        <button
          className="mobile-menu-close"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <ul className="mobile-nav">
          <li className="mobile-nav-item">
            <a href="/" className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
              Home
            </a>
          </li>
          <li className="mobile-nav-item">
            <a
              href="/services"
              className={`mobile-nav-link ${pathname === '/services' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Services
            </a>
          </li>
          <li className="mobile-nav-item">
            <a
              href="/about"
              className={`mobile-nav-link ${pathname === '/about' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              About Us
            </a>
          </li>
          <li className="mobile-nav-item">
            <a
              href="/blog"
              className={`mobile-nav-link ${pathname?.startsWith('/blog') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Blog
            </a>
          </li>
          <li className="mobile-nav-item">
            <a
              href="/contact"
              className={`mobile-nav-link ${pathname === '/contact' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Contact Us
            </a>
          </li>
        </ul>

        <button type="button" className="btn-cta btn-cta-mobile" onClick={openConsultationModal}>
          Free Consultation
        </button>
      </div>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={closeConsultationModal}
        selectedService=""
      />
    </>
  );
};

export default Navbar;
