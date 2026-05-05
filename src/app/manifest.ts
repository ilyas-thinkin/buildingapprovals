import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Building Approvals Dubai',
    short_name: 'Building Approvals',
    description: "Dubai's specialist consultancy for fast, compliant authority approvals and NOCs",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#006efe',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/logo/logo.webp',
        sizes: '300x300',
        type: 'image/webp',
        purpose: 'any',
      },
    ],
  };
}
