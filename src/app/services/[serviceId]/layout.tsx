import type { Metadata } from 'next';
import { serviceMetadata } from '../serviceMetadata';

interface ServiceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ serviceId: string }>;
}

export async function generateMetadata({ params }: ServiceLayoutProps): Promise<Metadata> {
  const { serviceId } = await params;
  const meta = serviceMetadata[serviceId] || {
    title: 'Dubai Authority Approval Services | Building Approvals Dubai',
    description:
      'Authority approvals and NOCs across Dubai, including Civil Defense, DEWA, Dubai Municipality, RTA, Trakhees, and more.',
    canonical: `https://www.buildingapprovals.ae/services/${serviceId}`,
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      type: 'website',
    },
  };
}

export default function ServiceDetailLayout({ children }: ServiceLayoutProps) {
  return children;
}
