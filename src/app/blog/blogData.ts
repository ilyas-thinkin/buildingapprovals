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
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
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
    metaTitle: 'Dubai Municipality Approval Process 2026 | Complete Building Approvals Guide',
    metaDescription: 'Step-by-step guide to Dubai Municipality building approvals in 2026. Learn the complete process, required documents, timelines, and expert tips for residential and commercial projects.',
    keywords: ['Dubai Municipality approval', 'building approvals Dubai', 'Dubai building permit', 'construction approval Dubai', 'Dubai Municipality 2026', 'building permit process Dubai'],
    ogImage: '/images/blog/building-approvals-dubai-municipality-cover.jpg',
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
    metaTitle: 'Dubai Municipality Approvals 2026: Updated Rules & AI-Driven Digital Innovations',
    metaDescription: 'Explore Dubai Municipality\'s 2026 updates: AI-driven compliance checks, digital twin technology, real-time tracking, and enhanced sustainability requirements for building approvals.',
    keywords: ['Dubai Municipality 2026', 'building approvals Dubai', 'Dubai digital twin', 'AI compliance Dubai', 'smart city Dubai', 'Dubai building regulations 2026', 'green building Dubai'],
    ogImage: '/images/blog/building-approvals-dubai-municipality-update-cover.webp',
  },
  {
    id: '3',
    title: 'Dubai Civil Defence Approval (DCD) – Complete Guide for 2026',
    excerpt: 'Fire and life safety are non-negotiable in Dubai\'s construction ecosystem. This comprehensive guide explains what DCD is, how to obtain approval step by step, and the specific requirements for different project categories.',
    date: '2026-01-08',
    author: 'Building Approvals Dubai',
    category: 'Dubai Civil Defence',
    image: '/images/blog/building-approvals-dubai-civil-defence-approval-card.jpg',
    coverImage: '/images/blog/building-approvals-dubai-civil-defence-approval-card.jpg',
    slug: 'dubai-civil-defence-approval-dcd-complete-guide-for-2026',
    metaTitle: 'Dubai Civil Defence Approval (DCD) Complete Guide 2026 | Fire Safety Requirements',
    metaDescription: 'Complete guide to Dubai Civil Defence approval process for 2026. Step-by-step instructions, requirements by building category, fire safety compliance, and DCD certification process.',
    keywords: ['Dubai Civil Defence approval', 'DCD approval Dubai', 'fire safety Dubai', 'building approvals Dubai', 'UAE Fire and Life Safety Code', 'DCD certification', 'fire protection systems Dubai'],
    ogImage: '/images/blog/building-approvals-dubai-civil-defence-approval-card.jpg',
  }

];
