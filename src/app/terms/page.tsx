import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Terms and Conditions | Building Approvals Dubai' },
  description: 'Read the terms and conditions for using Building Approvals Dubai services for fit-out, villa renovation, and modification project approvals.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/terms',
  },
};

const sections = [
  {
    number: '01',
    title: 'About Building Approvals Dubai',
    content: (
      <>
        <p>Building Approvals Dubai provides consultancy and support services for authority approval requirements in Dubai, including:</p>
        <ul>
          <li>Building approvals for fit-out projects</li>
          <li>Villa renovation projects</li>
          <li>Internal modification projects</li>
          <li>Commercial renovation approvals</li>
          <li>Authority NOC and permit coordination</li>
          <li>Fit-out and construction-related approval support</li>
        </ul>
        <p>Information on this website is for general guidance only. Approval requirements may vary depending on project type, location, developer, authority, and current regulations.</p>
      </>
    ),
  },
  {
    number: '02',
    title: 'Use of Website Content',
    content: (
      <>
        <p>All content on this website is for general informational and business communication purposes. You may use it to understand our services and submit enquiries. You may not copy, reproduce, republish, sell, or misuse any content without written permission from Building Approvals Dubai.</p>
      </>
    ),
  },
  {
    number: '03',
    title: 'Service Information',
    content: (
      <>
        <p>We make reasonable efforts to provide accurate information about Dubai building approvals. However, authority rules, submission procedures, and timelines may change. Information on this website should not be treated as final legal, technical, or authority-confirmed advice. Always confirm the latest requirements with our team or the relevant authority before starting a project.</p>
      </>
    ),
  },
  {
    number: '04',
    title: 'Enquiries and Communication',
    content: (
      <>
        <p>When you contact us through any channel, you agree to provide accurate and complete information. Submitting an enquiry does not create a confirmed service agreement unless both parties agree on the scope, fee, timeline, and required deliverables.</p>
      </>
    ),
  },
  {
    number: '05',
    title: 'Project Scope and Approval Support',
    content: (
      <>
        <p>The scope of service for each project depends on the nature of work, authority requirements, project location, developer guidelines, and available documents. Building Approvals Dubai may assist with documentation, coordination, drawing review, submission guidance, and authority follow-up. Final approval decisions are always made by the relevant authority, developer, or regulatory body. We do not guarantee approval unless the project fully complies with all applicable requirements.</p>
      </>
    ),
  },
  {
    number: '06',
    title: 'Client Responsibilities',
    content: (
      <>
        <p>Clients are responsible for providing correct, complete, and updated project details, including:</p>
        <ul>
          <li>Property documents and existing drawings</li>
          <li>Proposed drawings and project scope</li>
          <li>Tenant or owner details</li>
          <li>Trade license and NOC documents, if required</li>
          <li>Any previous authority comments or rejection notes</li>
        </ul>
        <p>Delays may occur if required documents are incomplete, inaccurate, expired, or not provided on time.</p>
      </>
    ),
  },
  {
    number: '07',
    title: 'Approval Timelines',
    content: (
      <>
        <p>Approval timelines vary depending on project type, authority workload, document quality, site conditions, developer requirements, inspection comments, and resubmission needs. Any timeline shared by Building Approvals Dubai is an estimate and should not be treated as a guaranteed completion date.</p>
      </>
    ),
  },
  {
    number: '08',
    title: 'Fees and Payment',
    content: (
      <>
        <p>Service fees, government charges, authority fees, drawing charges, and other project-related costs vary depending on the scope of work. Quoted fees are based on information available at the time of enquiry. Additional charges may apply if the project scope changes, extra documents are required, or new requirements are introduced during the process.</p>
      </>
    ),
  },
  {
    number: '09',
    title: 'Third-Party Authorities and Developers',
    content: (
      <>
        <p>Building Approvals Dubai may coordinate with authorities, developers, consultants, and contractors as part of the approval process. We are not responsible for delays, rejections, policy changes, portal issues, inspection delays, or decisions made by third-party authorities or developers.</p>
      </>
    ),
  },
  {
    number: '10',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>We will make reasonable efforts to support your approval process professionally. However, we are not liable for any direct or indirect loss caused by authority rejection, approval delays, incomplete client documents, regulatory changes, developer restrictions, site conditions, or contractor issues. Clients should not begin any fit-out, renovation, or modification work without obtaining required approvals where applicable.</p>
      </>
    ),
  },
  {
    number: '11',
    title: 'No Legal or Engineering Warranty',
    content: (
      <>
        <p>Website content does not replace legal, engineering, architectural, or official authority advice. For technical projects, structural changes, fire safety changes, or regulated construction works, review by licensed professionals may be required.</p>
      </>
    ),
  },
  {
    number: '12',
    title: 'Website Availability',
    content: (
      <>
        <p>We aim to keep the website accessible and updated. However, we do not guarantee the website will always be available, error-free, or uninterrupted. We may update, modify, remove, or improve content at any time without prior notice.</p>
      </>
    ),
  },
  {
    number: '13',
    title: 'Intellectual Property',
    content: (
      <>
        <p>All website content, branding, design elements, and written materials belong to Building Approvals Dubai unless otherwise stated. Unauthorized use of our content, name, or materials is not permitted.</p>
      </>
    ),
  },
  {
    number: '14',
    title: 'Changes to These Terms',
    content: (
      <>
        <p>We may update these Terms and Conditions from time to time to reflect changes in our services, website, or legal requirements. The updated version will be published on this page.</p>
      </>
    ),
  },
  {
    number: '15',
    title: 'Contact Us',
    content: (
      <>
        <p>For questions about these Terms and Conditions or our approval services, you may contact us through the contact details provided on our website.</p>
        <p style={{ marginTop: 8 }}><strong>Building Approvals Dubai</strong><br />Dubai, United Arab Emirates</p>
      </>
    ),
  },
];

export default function TermsPage() {
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
          Terms and Conditions
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: '#1f3d73',
          lineHeight: 1.75,
          maxWidth: 680,
          margin: '0 auto 28px',
        }}>
          By using our website or submitting an enquiry, you agree to the terms below. Please read them carefully before engaging with our services related to building approvals in Dubai.
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
          <h3 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 700 }}>Ready to start your approval project?</h3>
          <p style={{ margin: '0 0 24px', opacity: 0.85, fontSize: '0.97rem' }}>Our team is here to guide you through every step of the process.</p>
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
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
