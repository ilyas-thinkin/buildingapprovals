export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  coverImage?: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Dubai Municipality Approval Process 2026 – Complete Guide to get Building Approvals in Dubai',
    excerpt: 'Dubai\'s construction sector continues to grow rapidly in 2026, with strict regulations designed to ensure safety, sustainability, and compliance with international standards.',
    date: '2024-12-26',
    author: 'Building Approvals Dubai',
    category: 'Dubai Municipality',
    image: '/images/blog/building-approvals-dubai-municipality-card.jpg',
    coverImage: '/images/blog/building-approvals-dubai-municipality-cover.jpg',
    slug: 'dubai-municipality-approval-process-2026',
  },
  {
    id: '2',
    title: 'Dubai Municipality Approvals 2026: Updated Rules & Digital Innovations',
    excerpt: 'Discover the latest updates to Dubai Municipality approval processes in 2026, including new digital platforms, streamlined procedures, and enhanced compliance requirements.',
    date: '2024-12-26',
    author: 'Building Approvals Dubai',
    category: 'Dubai Municipality',
    image: '/images/blog/building-approvals-dubai-municipality-update-card.jpg',
    coverImage: '/images/blog/building-approvals-dubai-municipality-update-cover.webp',
    slug: 'dubai-municipality-approvals-2026-updated-rules',
  },
];
