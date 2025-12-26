export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Dubai Municipality Approval Process 2026 – Complete Guide to get Building Approvals in Dubai',
    excerpt: 'Dubai\'s construction sector continues to grow rapidly in 2026, with strict regulations designed to ensure safety, sustainability, and compliance with international standards.',
    date: '2026-01-15',
    author: 'Building Approvals Dubai',
    category: 'Dubai Municipality',
    image: '/images/blog/dubai-municipality-approval.jpg',
    slug: 'dubai-municipality-approval-process-2026',
  },
];
