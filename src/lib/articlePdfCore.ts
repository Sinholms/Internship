export interface ResolvedArticlePdf {
  url: string;
  name: string;
  description?: string;
}

/** Structural subset of StrapiMedia this resolver reads. Full StrapiMedia is assignable. */
export interface PdfMediaInput {
  url: string;
  name: string;
  ext?: string;
  mime?: string;
}

export interface PdfViewerInput {
  pdf?: PdfMediaInput | null;
  description?: string;
}

/** Only http(s) URLs are safe to link/embed; blocks javascript:/data:/relative leftovers. */
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
  return protocol === 'https:';
  } catch {
    return false;
  }
}

/** A media entry counts as a PDF when either its extension or mime says so. */
function isPdfMedia(media: PdfMediaInput): boolean {
  const ext = media.ext?.toLowerCase();
  const mime = media.mime?.toLowerCase();
  return ext === '.pdf' || mime === 'application/pdf';
}
/**
 * Pure resolver: turns a CMS pdfViewer into a renderable PDF descriptor, or null.
 * Returns null unless the media is a real PDF AND the resolved URL is a usable
 * http(s) link. `resolveUrl` is the same helper used for images (getStrapiImageUrl),
 * injected so this stays free of env/DOM and unit-testable.
 */
export function resolveArticlePdf(
  pdfViewer: PdfViewerInput | null | undefined,
  resolveUrl: (raw?: string | null) => string,
): ResolvedArticlePdf | null {
  const media = pdfViewer?.pdf;
  if (!media || !isPdfMedia(media)) return null;

  const url = resolveUrl(media.url);
  if (!isHttpUrl(url)) return null;

  return {
    url,
    name: media.name,
    description: pdfViewer.description,
  };
}
