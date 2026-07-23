"use client";

import { useEffect, useState } from 'react';
import { sanitizeArticleHtml } from '@/lib/sanitizeArticleHtml';

export default function ProfileArticleContent({ content }: { content: string }) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    setSafeHtml(sanitizeArticleHtml(content || '<p>Konten tidak tersedia.</p>'));
  }, [content]);

  return (
    <div className="prose max-w-none text-body-md font-body-md text-on-surface-variant prose-headings:text-primary prose-p:text-on-surface-variant prose-a:text-primary prose-img:rounded-xl prose-img:w-full prose-headings:font-headline-lg prose-headings:text-headline-lg leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
}
