import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Cookies Policy | Building Approvals Dubai' },
  description: 'Learn how Building Approvals Dubai uses cookies to improve website performance, user experience, analytics, and marketing.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/cookies',
  },
};

const cookieTypes = [
  {
    label: 'Essential',
    icon: '🔒',
    description: 'Required for the website to function properly — page navigation, form submission, security, and loading. Disabling these may prevent parts of the site from working correctly.',
  },
  {
    label: 'Performance & Analytics',
    icon: '📊',
    description: 'Help us understand how visitors interact with the website — which pages are visited, how long users stay, and where improvements are needed across our approval service pages.',
  },
  {
    label: 'Functional',
    icon: '⚙️',
    description: 'Remember basic preferences, form details, or browsing choices to make the website more convenient to use across sessions.',
  },
  {
    label: 'Marketing & Advertising',
    icon: '📢',
    description: 'Measure advertising performance and show relevant ads to users who have visited our website. For example, helping us reach visitors who have shown interest in fit-out or villa renovation approvals.',
  },
];

const sections = [
  {
    number: '01',
    title: 'What Are Cookies?',
    content: (
      <p>Cookies are small text files stored on your device when you visit a website. They help websites remember certain information about your visit — such as pages viewed, browser preferences, session activity, and user interactions. Cookies do not usually identify you personally on their own, but may be linked with other information if you submit an enquiry.</p>
    ),
  },
  {
    number: '02',
    title: 'Why We Use Cookies',
    content: (
      <>
        <p>Building Approvals Dubai may use cookies to improve website functionality, understand visitor behaviour, measure traffic and page performance, track enquiry form activity, support marketing campaigns, and improve the overall browsing experience for users researching building approvals in Dubai.</p>
      </>
    ),
  },
  {
    number: '03',
    title: 'Third-Party Cookies',
    content: (
      <>
        <p>We may use third-party tools for analytics, advertising, website performance, or enquiry tracking. These tools may place cookies on your device and include:</p>
        <ul>
          <li>Website analytics platforms</li>
          <li>Advertising platforms</li>
          <li>Call and form tracking tools</li>
          <li>Embedded maps or media</li>
          <li>Website performance tools</li>
        </ul>
        <p>These third parties may collect data according to their own privacy and cookie policies.</p>
      </>
    ),
  },
  {
    number: '04',
    title: 'Cookies and Personal Data',
    content: (
      <p>Some cookies may collect technical or behavioural information such as device type, browser type, pages visited, and general location data. If cookie data is connected with personal information submitted through a form, it may be treated as personal data under the UAE Personal Data Protection Law.</p>
    ),
  },
  {
    number: '05',
    title: 'Managing Cookies',
    content: (
      <>
        <p>You can manage or disable cookies through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>View and delete cookies stored on your device</li>
          <li>Block third-party or all cookies</li>
          <li>Set preferences for specific websites</li>
        </ul>
        <p>Please note that disabling certain cookies may affect website performance or prevent some features from working properly.</p>
      </>
    ),
  },
  {
    number: '06',
    title: 'Cookie Consent',
    content: (
      <p>Depending on your location and applicable regulations, we may display a cookie notice or consent banner when you visit our website. You may be able to accept, reject, or customise cookie preferences through the banner or browser settings.</p>
    ),
  },
  {
    number: '07',
    title: 'How Long Cookies Stay on Your Device',
    content: (
      <p>Cookies may be session-based (deleted when you close your browser) or persistent (remaining on your device for a set period or until manually deleted). The duration depends on the type of cookie and the tool that places it.</p>
    ),
  },
  {
    number: '08',
    title: 'Updates to This Policy',
    content: (
      <p>We may update this Cookies Policy from time to time to reflect changes in our website, tools, analytics setup, advertising platforms, or legal requirements. The latest version will always be available on this page.</p>
    ),
  },
  {
    number: '09',
    title: 'Contact Us',
    content: (
      <>
        <p>For questions about how Building Approvals Dubai uses cookies or handles website data, please contact us through the contact details provided on our website.</p>
        <p style={{ marginTop: 8 }}><strong>Building Approvals Dubai</strong><br />Dubai, United Arab Emirates</p>
      </>
    ),
  },
];

export default function CookiesPage() {
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
          Cookies Policy
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#1f3d73',
          lineHeight: 1.75,
          maxWidth: 680,
          margin: '0 auto 28px',
        }}>
          This Cookies Policy explains how Building Approvals Dubai uses cookies and similar technologies on our website to improve your experience and support our services.
        </p>
        <p style={{ fontSize: 14, color: '#6b7a99' }}>Last updated: May 2026</p>
      </section>

      {/* Cookie types grid */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#0c1f3f',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          Types of Cookies We Use
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}>
          {cookieTypes.map((ct) => (
            <div key={ct.label} style={{
              background: '#ffffff',
              border: '1px solid #e7edff',
              borderRadius: 18,
              padding: '24px 24px',
              boxShadow: '0 4px 20px rgba(12,31,63,0.05)',
            }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{ct.icon}</div>
              <h3 style={{
                margin: '0 0 8px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#0c1f3f',
              }}>
                {ct.label}
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1f3d73', lineHeight: 1.65 }}>
                {ct.description}
              </p>
            </div>
          ))}
        </div>
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

        {/* Related links */}
        <div style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          <Link href="/privacy" style={{
            display: 'block',
            padding: '22px 24px',
            background: '#ffffff',
            border: '1px solid #e7edff',
            borderRadius: 18,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(12,31,63,0.05)',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🔐</div>
            <div style={{ fontWeight: 700, color: '#0c1f3f', fontSize: '0.95rem', marginBottom: 4 }}>Privacy Policy</div>
            <div style={{ color: '#006efe', fontSize: '0.85rem', fontWeight: 600 }}>Read more →</div>
          </Link>
          <Link href="/terms" style={{
            display: 'block',
            padding: '22px 24px',
            background: '#ffffff',
            border: '1px solid #e7edff',
            borderRadius: 18,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(12,31,63,0.05)',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>📋</div>
            <div style={{ fontWeight: 700, color: '#0c1f3f', fontSize: '0.95rem', marginBottom: 4 }}>Terms and Conditions</div>
            <div style={{ color: '#006efe', fontSize: '0.85rem', fontWeight: 600 }}>Read more →</div>
          </Link>
          <Link href="/contact" style={{
            display: 'block',
            padding: '22px 24px',
            background: 'linear-gradient(135deg, #0b347a 0%, #006efe 100%)',
            borderRadius: 18,
            textDecoration: 'none',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginBottom: 4 }}>Have a Question?</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600 }}>Contact us →</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
