import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for Building Approvals Dubai.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1>Privacy Policy</h1>
      <p>
        Building Approvals Dubai collects contact and project information only as needed to respond
        to enquiries, provide approval support, and improve our services.
      </p>
      <p>
        We do not sell personal information. If you contact us through our forms, phone, email, or
        WhatsApp channels, your information may be used to follow up on your request.
      </p>
      <p>
        For data access or removal requests, contact <a href="mailto:info@buildingapprovals.ae">info@buildingapprovals.ae</a>.
      </p>
    </main>
  );
}
