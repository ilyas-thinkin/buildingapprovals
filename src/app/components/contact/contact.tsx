"use client";

import React, { useEffect, useRef, useState } from 'react';
import './contact.css';

const Contact: React.FC = () => {
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
    service: 'General Enquiry',
    message: '',
  });
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const serviceWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappNumber = '971589575610';
    const text = `*New Enquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.countryCode} ${formData.phone}%0A*Service:* ${formData.service}%0A*Message:* ${formData.message}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const ensureServiceDropdownInView = () => {
    const wrapper = serviceWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const dropdownHeight = 220;
    const margin = 16;
    const neededBottom = rect.bottom + dropdownHeight + margin;
    if (neededBottom > window.innerHeight) {
      const scrollAmount = neededBottom - window.innerHeight;
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceWrapperRef.current && !serviceWrapperRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsServiceOpen(false);
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

  const toggleServiceDropdown = () => setIsServiceOpen((prev) => !prev);

  const handleServiceSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }));
    setIsServiceOpen(false);
  };

  return (
    <section className="contact-shell" id="contact">
      <div className="contact-hero">
        <div className="contact-badge">We respond fast</div>
        <h1>Let&apos;s talk approvals</h1>
        <p>Share your project details and we&apos;ll get back with a clear approval plan.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card contact-card-primary">
          <h2>Contact details</h2>
          <div className="contact-list">
            <div className="contact-list-item">
              <div className="contact-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="contact-list-label">Address</p>
                <p className="contact-text">
                  Office No: 302-2, Al Babtain building, 2nd St – Port Saeed, Dubai, UAE
                </p>
                <p className="contact-small">Opening hours: Mon - Sat · 9AM - 12PM</p>
              </div>
            </div>
            <div className="contact-list-item">
              <div className="contact-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="contact-list-label">Phone / WhatsApp</p>
                <a href="tel:+971589575610">+971 589575610</a>
                <p className="contact-small">Get a free consultation and cost calculation now.</p>
              </div>
            </div>
            <div className="contact-list-item">
              <div className="contact-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="contact-list-label">Email</p>
                <a href="mailto:info@buildingapprovals.ae">info@buildingapprovals.ae</a>
              </div>
            </div>
          </div>
          <div className="contact-note">Need it urgent? WhatsApp us directly for priority handling.</div>
          <a
            className="contact-map-link"
            href="https://www.google.com/maps/search/?api=1&query=Office+No.+302-2,+Al+Babtain+building,+2nd+St+-+Port+Saeed,+Dubai,+UAE"
            target="_blank"
            rel="noreferrer"
          >
            Go to map
          </a>
        </div>

        <div className="contact-card contact-form-card">
          <h2>Send an enquiry</h2>
          <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
            <div className="form-row">
              <label>
                Full Name*
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </label>
              <label>
                Email*
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <div className="form-row form-row-phone">
              <label>
                Phone / WhatsApp*
                <div className="contact-phone-wrap">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="contact-phone-code"
                  >
                    <option value="+971">+971 (UAE)</option>
                    <option value="+966">+966 (KSA)</option>
                    <option value="+974">+974 (Qatar)</option>
                    <option value="+965">+965 (Kuwait)</option>
                    <option value="+968">+968 (Oman)</option>
                    <option value="+20">+20 (Egypt)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+91">+91 (India)</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="50 123 4567"
                    required
                    className="contact-phone-input"
                  />
                </div>
              </label>
            </div>

            <label className="form-full">
              Service*
              <div className="service-select-wrapper" ref={serviceWrapperRef}>
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
                    {serviceOptions.map((option) => (
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
            </label>

            <label className="form-full">
              Project / Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share timeline, location, authority, and any drawings available"
                rows={3}
              />
            </label>

            <button type="submit" className="contact-submit">
              Send via WhatsApp
            </button>
          </form>
        </div>
      </div>

      <div className="contact-map-embed">
        <iframe
          title="Office location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.7400000000002!2d55.3295!3d25.2525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDE1JzA5LjAiTiA1NcKwMTknNDYuMiJF!5e0!3m2!1sen!2sae!4v1234567890"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
};

export default Contact;
