"use client";

import { useEffect, useState } from 'react';
import { sanitizeArticleHtml } from '@/lib/sanitizeArticleHtml';

export default function ProfileArticleContent({ content }: { content: string }) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    setSafeHtml(sanitizeArticleHtml(content || '<p>Konten tidak tersedia.</p>'));
  }, [content]);

  return (
    <div className="article-body max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
}
