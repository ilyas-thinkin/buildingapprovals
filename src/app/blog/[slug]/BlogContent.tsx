'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface BlogContentProps {
  slug: string;
}

// Cache for dynamically loaded components
const componentCache: Record<string, ComponentType> = {};

// Dynamically load blog content based on slug
function loadBlogContent(slug: string): ComponentType {
  if (componentCache[slug]) {
    return componentCache[slug];
  }

  const DynamicComponent = dynamic(
    () => import(`./content/${slug}`).catch(() => {
      // Return a component that renders null if the content file doesn't exist
      return { default: () => null };
    }),
    { ssr: true }
  );

  componentCache[slug] = DynamicComponent;
  return DynamicComponent;
}

export default function BlogContent({ slug }: BlogContentProps) {
  const ContentComponent = loadBlogContent(slug);
  return <ContentComponent />;
}
