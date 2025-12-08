"use client";

import React, { useState } from 'react';
import './contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    service: 'General Enquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappNumber = '97143886600';
    const text = `*New Enquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.countryCode} ${formData.phone}%0A*Service:* ${formData.service}%0A*Message:* ${formData.message}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
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
              <div className="contact-icon" aria-hidden="true">📍</div>
              <div>
                <p className="contact-list-label">Address</p>
                <p className="contact-text">
                  Office No: 302-2, Al Babtain building, 2nd St – Port Saeed, Dubai, UAE
                </p>
                <p className="contact-small">Opening hours: Mon - Sat · 9AM - 12PM</p>
              </div>
            </div>
            <div className="contact-list-item">
              <div className="contact-icon" aria-hidden="true">📞</div>
              <div>
                <p className="contact-list-label">Phone / WhatsApp</p>
                <a href="tel:+971589575610">+971 589575610</a>
                <p className="contact-small">Get a free consultation and cost calculation now.</p>
              </div>
            </div>
            <div className="contact-list-item">
              <div className="contact-icon" aria-hidden="true">✉️</div>
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
          <form className="contact-form" onSubmit={handleSubmit}>
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
              <select name="service" value={formData.service} onChange={handleChange} required>
                <option>General Enquiry</option>
                <option>Civil Defense Approval</option>
                <option>DEWA Approval</option>
                <option>Dubai Municipality Approval</option>
                <option>Community / Developer NOC</option>
                <option>Food Control / Health</option>
                <option>Signage / Fit-out</option>
                <option>Other</option>
              </select>
            </label>

            <label className="form-full">
              Project / Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share timeline, location, authority, and any drawings available"
                rows={4}
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
