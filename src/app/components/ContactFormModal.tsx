'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ContactFormModal.css';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, selectedService }) => {
  const serviceOptions = [
    'General Enquiry',
    'Civil Defense Approval',
    'DEWA Approval',
    'Dubai Municipality Approval',
    'Emaar Approval',
    'Nakheel Approval',
    'JAFZA Approval',
    'DHA Approval',
    'DSO Approval',
    'Dubai Development Authority',
    'Food Control Department',
    'Spa Approval',
    'Shisha Cafe License',
    'Smoking Permit',
    'Swimming Pool Approval',
    'Solar Approval',
    'Signage Approval',
    'Tent Approval',
    'RTA Permit and Approval',
    'Tecom and DCCA Approval',
    'Third Party Consultants',
    'Trakhees Approval',
    'Other',
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    service: selectedService,
  });
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, service: selectedService }));
  }, [selectedService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const ensureServiceDropdownInView = () => {
    if (!formRef.current || !serviceDropdownRef.current) return;
    const formRect = formRef.current.getBoundingClientRect();
    const dropdownRect = serviceDropdownRef.current.getBoundingClientRect();
    const spaceBelow = formRect.bottom - dropdownRect.bottom;
    const requiredSpace = 210; // room for options list and breathing space

    if (spaceBelow < requiredSpace) {
      const scrollDelta = requiredSpace - spaceBelow;
      formRef.current.scrollTo({
        top: formRef.current.scrollTop + scrollDelta,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (isServiceOpen) {
      requestAnimationFrame(ensureServiceDropdownInView);
    }
  }, [isServiceOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format WhatsApp message
    const message = `*New Service Enquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.countryCode}${formData.phone}%0A*Service:* ${formData.service}`;

    // WhatsApp number
    const whatsappNumber = '971589575610';

    // Open WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    // Close modal and reset form
    onClose();
    setFormData({
      name: '',
      email: '',
      countryCode: '+971',
      phone: '',
      service: selectedService,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleServiceDropdown = () => setIsServiceOpen(prev => !prev);

  const handleServiceSelect = (value: string) => {
    setFormData(prev => ({ ...prev, service: value }));
    setIsServiceOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-wrapper">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">Send Enquiry</h2>
            <p className="modal-subtitle">Get in touch with us for your approval needs</p>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number *</label>
            <div className="phone-input-group">
              <select
                name="countryCode"
                className="country-code-select"
                value={formData.countryCode}
                onChange={handleChange}
              >
                <option value="+971">🇦🇪 +971</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+966">🇸🇦 +966</option>
                <option value="+974">🇶🇦 +974</option>
                <option value="+965">🇰🇼 +965</option>
                <option value="+968">🇴🇲 +968</option>
                <option value="+973">🇧🇭 +973</option>
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input phone-input"
                placeholder="50 123 4567"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="service" className="form-label">Service *</label>
            <div className="service-select-wrapper" ref={serviceDropdownRef}>
              <button
                type="button"
                className={`form-input service-trigger ${isServiceOpen ? 'is-open' : ''}`}
                onClick={toggleServiceDropdown}
                aria-haspopup="listbox"
                aria-expanded={isServiceOpen}
              >
                <span>{formData.service || 'Select a service'}</span>
                <svg className="service-trigger-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isServiceOpen && (
                <div className="service-options" role="listbox">
                  {serviceOptions.map(option => (
                    <button
                      type="button"
                      key={option}
                      className={`service-option ${formData.service === option ? 'active' : ''}`}
                      onClick={() => handleServiceSelect(option)}
                      role="option"
                      aria-selected={formData.service === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Send via WhatsApp
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5 2.5L8.75 11.25M17.5 2.5L11.875 17.5L8.75 11.25M17.5 2.5L2.5 8.125L8.75 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ContactFormModal;
