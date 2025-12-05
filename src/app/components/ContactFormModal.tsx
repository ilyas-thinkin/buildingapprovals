'use client';

import React, { useState, useEffect } from 'react';
import './ContactFormModal.css';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, selectedService }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    service: selectedService,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format WhatsApp message
    const message = `*New Service Enquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.countryCode}${formData.phone}%0A*Service:* ${formData.service}`;

    // WhatsApp number
    const whatsappNumber = '97143886600';

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

          <form className="contact-form" onSubmit={handleSubmit}>
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
            <select
              id="service"
              name="service"
              className="form-input"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="Civil Defense Approvals">Civil Defense Approvals</option>
              <option value="DEWA Approval Service">DEWA Approval Service</option>
              <option value="Dubai Municipality Approval">Dubai Municipality Approval</option>
              <option value="Emaar Approval Authority">Emaar Approval Authority</option>
              <option value="Nakheel Approval">Nakheel Approval</option>
              <option value="Food Control Department">Food Control Department</option>
              <option value="JAFZA Approval">JAFZA Approval</option>
              <option value="DHA Approval">DHA Approval</option>
            </select>
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
