import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Building Approvals Dubai for authority approvals, permit support, and project consultations across Dubai Municipality, Civil Defense, DEWA, DDA, Trakhees, and more.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/contact',
  },
  openGraph: {
    title: 'Contact Us | Building Approvals Dubai',
    description:
      'Contact Building Approvals Dubai for authority approvals, permit support, and project consultations across Dubai Municipality, Civil Defense, DEWA, DDA, Trakhees, and more.',
    url: 'https://www.buildingapprovals.ae/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
