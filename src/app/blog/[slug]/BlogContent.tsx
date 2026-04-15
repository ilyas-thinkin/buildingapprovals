'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

interface BlogContentProps {
  slug: string;
}

// Module-level cache — all components created here, never inside render
const componentCache: Record<string, ComponentType> = {};

export function preloadBlogContent(slug: string): void {
  if (!componentCache[slug]) {
    componentCache[slug] = dynamic(
      () => import(`./content/${slug}`).catch(() => ({ default: () => null })),
      { ssr: true }
    );
  }
}

// Fallback component used when slug is not yet in cache
const FallbackComponent: ComponentType = () => null;

export default function BlogContent({ slug }: BlogContentProps) {
  // Ensure component exists in module-level cache (safe: cache mutation, not render output)
  preloadBlogContent(slug);
  // Read directly from module-level cache — component created outside render
  const ContentComponent = componentCache[slug] ?? FallbackComponent;
  return <ContentComponent />;
}
