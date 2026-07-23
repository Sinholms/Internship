"use client";

import { useEffect, useState } from 'react';
import { sanitizeArticleHtml } from '@/lib/sanitizeArticleHtml';

/**
 * Renders CMS page HTML content sanitized client-side. sanitizeArticleHtml
 * relies on the browser DOM (DOMPurify), so raw content is only injected
 * after sanitizing in-effect; before that it stays empty.
 */
export default function PageContent({ content }: { content: string }) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    setSafeHtml(sanitizeArticleHtml(content || '<p>Konten tidak tersedia.</p>'));
  }, [content]);

  return (
    <div
      className="prose max-w-none text-body-md md:text-body-lg leading-relaxed prose-headings:text-primary prose-p:text-on-surface-variant prose-a:text-primary prose-img:rounded-xl prose-img:w-full prose-headings:font-headline-lg"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
