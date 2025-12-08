'use client';

import React, { useState } from 'react';
import './FAQSection.css';

const FAQSection: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How long does it take to get building approvals in Dubai?',
      answer: 'The timeline varies depending on the type and complexity of approval. Simple permits can take 5-10 working days, while comprehensive building permits typically take 2-4 weeks. With our expertise and authority relationships, we accelerate the process by up to 50%, ensuring faster approvals while maintaining full compliance.'
    },
    {
      question: 'What authorities do I need approval from for my project?',
      answer: 'This depends on your project type and location. Most projects require Dubai Municipality approval. Additional approvals may be needed from Civil Defense (fire safety), DEWA (utilities), community developers (Emaar, Nakheel), and authority-specific entities like JAFZA, DHA, or Tecom. We assess your specific requirements and manage all necessary approvals under one roof.'
    },
    {
      question: 'Can you guarantee first-time approval success?',
      answer: 'Yes. Our meticulous documentation process, pre-submission verification, and deep understanding of authority requirements ensure 100% first-time approval success. We prepare all documents to exact specifications, eliminating the costly delays and resubmissions that plague most applicants.'
    },
    {
      question: 'What documents are typically required for building approvals?',
      answer: 'Common requirements include architectural drawings, structural calculations, MEP designs, NOC from landlord/developer, trade license, title deed or tenancy contract, passport copies, and site plan. Specific requirements vary by project type and authority. We provide you with a complete checklist tailored to your project and handle all documentation preparation.'
    },
    {
      question: 'Do I need separate approvals for fitout and renovation work?',
      answer: 'Yes, any interior modifications, fitouts, or renovations require proper permits even if you\'re not changing the building structure. This includes office fitouts, retail spaces, restaurant modifications, and residential renovations. The approval process is typically faster than new construction, taking 1-3 weeks depending on scope.'
    },
    {
      question: 'What happens if I start work without proper approvals?',
      answer: 'Operating without required approvals can result in significant fines (ranging from AED 5,000 to AED 50,000+), immediate stop-work orders, forced removal of completed work, and potential license suspension. Additionally, you may face difficulties obtaining occupancy certificates or selling/leasing the property. We ensure full compliance from day one to avoid these costly issues.'
    },
    {
      question: 'How much do building approval services cost?',
      answer: 'Costs vary based on project complexity, number of authorities involved, and approval types required. Government fees range from AED 1,000-10,000+ depending on the permits. Our professional service fees are transparent and competitive, typically saving you 30-50% compared to handling delays, resubmissions, and penalties independently. We provide detailed cost estimates upfront with no hidden charges.'
    },
    {
      question: 'Can you help with approvals for free zones like JAFZA or Dubai Internet City?',
      answer: 'Absolutely. We specialize in free zone approvals including JAFZA, Tecom (Dubai Internet City, Media City, Knowledge Park), Trakhees, DDA, and others. Free zones have unique requirements and processes different from mainland Dubai. Our established relationships and expertise in these jurisdictions ensure smooth, expedited approvals.'
    },
    {
      question: 'What if my application gets rejected or requires modifications?',
      answer: 'With our pre-submission verification process, rejections are extremely rare. However, if any authority comments or modifications are requested, we handle all revisions and resubmissions at no additional cost. Our service includes complete follow-through until final approval is secured, with continuous communication keeping you informed at every step.'
    },
    {
      question: 'Do you provide support after approvals are obtained?',
      answer: 'Yes. We offer ongoing compliance support including license renewals, annual inspections, modification permits, and regulatory updates. Our relationship doesn\'t end with approval - we ensure you maintain compliance throughout your project lifecycle. Additionally, we provide 24/7 support for urgent queries and maintain all documentation for easy future reference.'
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        {/* Section Header */}
        <div className="faq-header">
          <span className="faq-badge">FAQ</span>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Everything you need to know about building approvals in Dubai
          </p>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${activeFaq === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={activeFaq === index}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 9L12 16L5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="faq-cta">
          <p className="faq-cta-text">Still have questions?</p>
          <a href="/contact" className="faq-cta-button">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
