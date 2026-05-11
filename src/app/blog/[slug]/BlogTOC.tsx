'use client';

import { useEffect, useRef, useState } from 'react';
import './blog-toc.css';

interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export default function BlogTOC() {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const contentEl = document.querySelector('.blog-post-content');
    if (!contentEl) return;

    const headings = Array.from(
      contentEl.querySelectorAll<HTMLElement>('h2, h3')
    );

    const collected: TocEntry[] = headings.map((heading, i) => {
      if (!heading.id) {
        heading.id = `toc-heading-${i}`;
      }
      return {
        id: heading.id,
        text: heading.textContent?.trim() ?? '',
        level: (heading.tagName === 'H2' ? 2 : 3) as 2 | 3,
      };
    }).filter(e => e.text.length > 0);

    setEntries(collected);

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (obs) => {
        const visible = obs
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(h => observerRef.current!.observe(h));

    return () => observerRef.current?.disconnect();
  }, []);

  if (entries.length < 3) return null;

  return (
    <nav className="blog-toc" aria-label="Table of contents">
      <span className="blog-toc-title">In this article</span>
      <ol className="blog-toc-list">
        {entries.map(entry => (
          <li
            key={entry.id}
            className={`blog-toc-item blog-toc-level-${entry.level}${activeId === entry.id ? ' active' : ''}`}
          >
            <a
              href={`#${entry.id}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
