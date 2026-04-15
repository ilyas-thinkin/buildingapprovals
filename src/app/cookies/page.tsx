import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Read the cookie policy for Building Approvals Dubai.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/cookies',
  },
};

export default function CookiesPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1>Cookie Policy</h1>
      <p>
        This website uses cookies and analytics technologies to understand traffic, improve
        performance, and measure marketing effectiveness.
      </p>
      <p>
        By continuing to use the site, you consent to the use of cookies that support core site
        functionality, analytics, and advertising measurement.
      </p>
    </main>
  );
}
