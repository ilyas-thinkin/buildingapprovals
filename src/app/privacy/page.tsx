import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | Building Approvals Dubai' },
  description: 'Learn how Building Approvals Dubai collects, uses, and protects personal data submitted through our website and enquiry forms.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/privacy',
  },
};

const sections = [
  {
    number: '01',
    title: 'Information We Collect',
    content: (
      <>
        <p>We may collect personal and project-related information when you contact us or submit an enquiry through our website. This may include:</p>
        <ul>
          <li>Your name, phone number, and email address</li>
          <li>Company name, if applicable</li>
          <li>Project location, type, and property details</li>
          <li>Approval requirements and enquiry details</li>
          <li>Documents or drawings shared by you</li>
          <li>Basic technical data such as browser type and pages visited</li>
        </ul>
      </>
    ),
  },
  {
    number: '02',
    title: 'How We Use Your Information',
    content: (
      <>
        <p>We use your information to respond to enquiries, prepare proposals, coordinate approval requirements, improve our services, and maintain internal business records. We do not sell your personal information to third parties.</p>
      </>
    ),
  },
  {
    number: '03',
    title: 'Legal and Compliance Basis',
    content: (
      <>
        <p>The UAE's Personal Data Protection Law governs the handling of personal data, giving individuals rights including access, correction, deletion, restriction, and objection. We aim to handle your information responsibly and only for relevant business purposes.</p>
      </>
    ),
  },
  {
    number: '04',
    title: 'Sharing of Information',
    content: (
      <>
        <p>We only share your information when required for service delivery — for example, coordinating with Dubai authorities, developers, approved consultants, contractors, or service providers supporting our systems. We disclose only what is necessary, and may also share information if required by law or legal process.</p>
      </>
    ),
  },
  {
    number: '05',
    title: 'Project Documents and Drawings',
    content: (
      <>
        <p>Documents you share — such as drawings, title deeds, NOC documents, or trade licenses — are used solely for reviewing requirements, preparing submissions, and coordinating with relevant parties. Clients are responsible for ensuring all shared documents are accurate, valid, and authorized for use.</p>
      </>
    ),
  },
  {
    number: '06',
    title: 'Data Storage and Security',
    content: (
      <>
        <p>We take reasonable steps to protect your information from unauthorized access, misuse, loss, or disclosure. However, no online communication or electronic storage is completely secure, and we cannot guarantee absolute security.</p>
      </>
    ),
  },
  {
    number: '07',
    title: 'Marketing Communication',
    content: (
      <>
        <p>If you contact us, we may use your details to follow up on your request or share service-related updates about building approvals in Dubai. You may request to stop receiving such communication at any time.</p>
      </>
    ),
  },
  {
    number: '08',
    title: 'Cookies and Tracking Tools',
    content: (
      <>
        <p>Our website may use cookies and similar technologies to improve user experience, understand performance, and support marketing. For full details, please read our{' '}
          <Link href="/cookies" style={{ color: '#006efe', fontWeight: 600 }}>Cookies Policy</Link>.
        </p>
      </>
    ),
  },
  {
    number: '09',
    title: 'Third-Party Links',
    content: (
      <>
        <p>Our website may link to third-party websites, authority portals, or external resources. We are not responsible for their privacy practices, content, or security and recommend reviewing their privacy policies before sharing personal information.</p>
      </>
    ),
  },
  {
    number: '10',
    title: 'Your Rights',
    content: (
      <>
        <p>Depending on applicable law, you may have the right to access, correct, or delete your personal data, withdraw consent for certain uses, stop marketing communication, or request clarification on how your data is used. Contact us through our website to make a request.</p>
      </>
    ),
  },
  {
    number: '11',
    title: 'Retention of Information',
    content: (
      <>
        <p>We keep your information only for as long as reasonably necessary for enquiry handling, service delivery, business records, legal compliance, or dispute resolution. When no longer needed, information is deleted, archived, or securely stored.</p>
      </>
    ),
  },
  {
    number: '12',
    title: 'Children\'s Privacy',
    content: (
      <>
        <p>Our services are intended for property owners, tenants, businesses, contractors, consultants, and project stakeholders. We do not knowingly collect personal information from children.</p>
      </>
    ),
  },
  {
    number: '13',
    title: 'Updates to This Policy',
    content: (
      <>
        <p>We may update this Privacy Policy from time to time to reflect changes in our business process, website features, legal requirements, or data handling practices. The latest version will always be available on this page.</p>
      </>
    ),
  },
  {
    number: '14',
    title: 'Contact Us',
    content: (
      <>
        <p>For questions about this Privacy Policy or how your information is handled, please contact us through the contact details provided on our website.</p>
        <p style={{ marginTop: 8 }}><strong>Building Approvals Dubai</strong><br />Dubai, United Arab Emirates</p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main style={{ background: 'linear-gradient(180deg, #f1f6ff 0%, #ffffff 50%)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '120px 24px 64px',
        textAlign: 'center',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <span style={{
          display: 'inline-block',
          padding: '8px 18px',
          background: 'rgba(0,110,254,0.08)',
          color: '#006efe',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Legal &amp; Compliance
        </span>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#0c1f3f',
          lineHeight: 1.15,
          margin: '0 0 20px',
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#1f3d73',
          lineHeight: 1.75,
          maxWidth: 680,
          margin: '0 auto 28px',
        }}>
          At Building Approvals Dubai, we respect your privacy and are committed to protecting the personal information you share with us. This policy explains how we collect, use, store, and protect your data.
        </p>
        <p style={{ fontSize: 14, color: '#6b7a99' }}>Last updated: May 2026</p>
      </section>

      {/* Sections */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((s) => (
            <div key={s.number} style={{
              background: '#ffffff',
              border: '1px solid #e7edff',
              borderRadius: 20,
              padding: '32px 36px',
              boxShadow: '0 4px 24px rgba(12,31,63,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <span style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(0,110,254,0.08)',
                  color: '#006efe',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.04em',
                }}>
                  {s.number}
                </span>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#0c1f3f',
                    margin: '0 0 12px',
                    lineHeight: 1.3,
                  }}>
                    {s.title}
                  </h2>
                  <div style={{ color: '#1f3d73', lineHeight: 1.75, fontSize: '0.97rem' }}>
                    {s.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: 40,
          padding: '24px 28px',
          background: '#f7faff',
          borderRadius: 16,
          border: '1px solid #e7edff',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7a99', lineHeight: 1.7, fontStyle: 'italic' }}>
            Disclaimer: The information on this page is for general business and website use only. Approval requirements, authority procedures, privacy obligations, and regulatory requirements may change from time to time. Please contact Building Approvals Dubai or seek professional advice before relying on this information for legal, technical, or compliance decisions.
          </p>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 40,
          padding: '40px 36px',
          background: 'linear-gradient(135deg, #0b347a 0%, #006efe 100%)',
          borderRadius: 24,
          textAlign: 'center',
          color: '#ffffff',
        }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 700 }}>Have questions about your data?</h3>
          <p style={{ margin: '0 0 24px', opacity: 0.85, fontSize: '0.97rem' }}>Our team is happy to clarify how we handle your information.</p>
          <Link href="/contact" style={{
            display: 'inline-block',
            padding: '13px 28px',
            background: '#ffffff',
            color: '#0b347a',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
          }}>
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
