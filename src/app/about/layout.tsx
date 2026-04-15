import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn more about Building Approvals Dubai, our authority approval expertise, and how we help clients secure faster, compliant approvals across Dubai.',
  alternates: {
    canonical: 'https://www.buildingapprovals.ae/about',
  },
  openGraph: {
    title: 'About Us | Building Approvals Dubai',
    description:
      'Learn more about Building Approvals Dubai, our authority approval expertise, and how we help clients secure faster, compliant approvals across Dubai.',
    url: 'https://www.buildingapprovals.ae/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
