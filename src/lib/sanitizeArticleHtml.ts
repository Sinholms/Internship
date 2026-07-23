import DOMPurify from 'dompurify';

const allowedTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em',
  'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'iframe', 'embed',
] as const;

const allowedAttributes = [
  'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'colspan', 'rowspan', 'scope', 'loading', 'allowfullscreen', 'allow',
] as const;

const trustedEmbedHosts = new Set([
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'www.google.com',
  'maps.google.com',
  'dinkominfo.pekalongankab.go.id',
  'cms.dinkominfo.pekalongankab.go.id',
  'cdn.pekalongankab.go.id',
]);

function resolveUploadedAssetUrl(source: string): string {
  const cdnBase = (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_CDN || 'https://cdn.pekalongankab.go.id').replace(/\/$/, '');
  return cdnBase ? `${cdnBase}${source}` : source;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isTrustedEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      trustedEmbedHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export function sanitizeArticleHtml(content: string): string {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [...allowedTags],
    ALLOWED_ATTR: [...allowedAttributes],
    FORBID_ATTR: ['style', 'srcdoc'],
  });

  const container = document.createElement('div');
  container.innerHTML = sanitized;

  for (const element of container.querySelectorAll<HTMLElement>('[href], [src]')) {
    const source = element.getAttribute('href') ?? element.getAttribute('src');
    if (!source) continue;

    if (element.tagName === 'IFRAME' || element.tagName === 'EMBED') {
      if (!isTrustedEmbedUrl(source)) element.remove();
      continue;
    }

    if (source.startsWith('/uploads')) {
      const attribute = element.tagName === 'IMG' ? 'src' : 'href';
      element.setAttribute(attribute, resolveUploadedAssetUrl(source));
      continue;
    }

    if (element.tagName === 'A' && source.startsWith('/')) continue;

    if (!isHttpsUrl(source)) {
      element.removeAttribute('href');
      element.removeAttribute('src');
    }

    if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  return container.innerHTML;
}
