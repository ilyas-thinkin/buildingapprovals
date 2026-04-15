import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service for Building Approvals Dubai.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/terms',
  },
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1>Terms of Service</h1>
      <p>
        By using this website, you agree to use the information provided for lawful purposes only.
      </p>
      <p>
        Project timelines, approvals, and authority requirements may vary depending on scope,
        documentation, authority comments, and regulation changes.
      </p>
      <p>
        Building Approvals Dubai is not responsible for delays caused by third-party authorities,
        incomplete client documentation, or regulatory changes outside our control.
      </p>
    </main>
  );
}
