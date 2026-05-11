'use client';

import './wordpress-content.css';

interface WordPressContentProps {
  html: string;
}

export default function WordPressContent({ html }: WordPressContentProps) {
  return (
    <div
      className="wp-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
