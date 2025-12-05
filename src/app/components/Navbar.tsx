'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <a href="/" className="navbar-logo">
            <img src="/logo/logo.webp" alt="Building Approvals Logo" />
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
                  About
                </a>
              </li>
            </ul>

            {/* CTA Button */}
            <a href="/contact" className="btn-cta">
              Contact Us
            </a>
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
              About
            </a>
          </li>
        </ul>

        <a href="/contact" className="btn-cta btn-cta-mobile" onClick={closeMobileMenu}>
          Contact Us
        </a>
      </div>
    </>
  );
};

export default Navbar;
