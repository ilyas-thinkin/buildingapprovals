import type { Metadata } from 'next';
import { servicesIndexMetadata } from './serviceMetadata';

export const metadata: Metadata = {
  title: servicesIndexMetadata.title,
  description: servicesIndexMetadata.description,
  alternates: {
    canonical: servicesIndexMetadata.canonical,
  },
  openGraph: {
    title: `${servicesIndexMetadata.title} | Building Approvals Dubai`,
    description: servicesIndexMetadata.description,
    url: servicesIndexMetadata.canonical,
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
