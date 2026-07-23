import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveArticlePdf, type PdfViewerInput } from './articlePdfCore.js';
import type { ArticleCMS } from '../types/cms.js';

// Compile-time proof: the real CMS pdfViewer shape is assignable to the resolver input.
type _AssertAssignable = NonNullable<ArticleCMS['pdfViewer']> extends PdfViewerInput ? true : never;
const _assignable: _AssertAssignable = true;
void _assignable;

const validPdf = {
  url: '/uploads/dokumen_visi_misi.pdf',
  name: 'Dokumen Visi Misi.pdf',
  ext: '.pdf',
  mime: 'application/pdf',
};

// Resolver mirrors getStrapiImageUrl behaviour without touching env: /uploads -> CDN,
// http(s) passthrough, everything else returned unchanged (so guards must reject it).
const resolveUrl = (raw?: string | null): string => {
  if (!raw) return '';
  if (raw.startsWith('/uploads')) return `https://cdn.pekalongankab.go.id${raw}`;
  return raw;
};

test('Given a valid PDF media, when resolved, then it returns the CDN URL, name and description', () => {
  const result = resolveArticlePdf({ pdf: validPdf, description: 'Lampiran resmi' }, resolveUrl);

  assert.deepEqual(result, {
    url: 'https://cdn.pekalongankab.go.id/uploads/dokumen_visi_misi.pdf',
    name: 'Dokumen Visi Misi.pdf',
    description: 'Lampiran resmi',
  });
});

test('Given a null pdfViewer, when resolved, then it returns null', () => {
  assert.equal(resolveArticlePdf(null, resolveUrl), null);
  assert.equal(resolveArticlePdf(undefined, resolveUrl), null);
  assert.equal(resolveArticlePdf({ description: 'no file' }, resolveUrl), null);
});

test('Given a non-PDF media, when resolved, then it is ignored', () => {
  const image = { url: '/uploads/foto.jpg', name: 'foto.jpg', ext: '.jpg', mime: 'image/jpeg' };
  assert.equal(resolveArticlePdf({ pdf: image }, resolveUrl), null);
});

test('Given PDF media whose URL resolves to a non-http scheme, when resolved, then it is rejected', () => {
  const hostile = { url: 'javascript:alert(1)', name: 'x.pdf', ext: '.pdf', mime: 'application/pdf' };
  assert.equal(resolveArticlePdf({ pdf: hostile }, resolveUrl), null);

  const dataUri = { url: 'data:application/pdf;base64,AAAA', name: 'x.pdf', ext: '.pdf', mime: 'application/pdf' };
  assert.equal(resolveArticlePdf({ pdf: dataUri }, resolveUrl), null);
});

test('Given PDF media with an absolute HTTPS URL, when resolved, then it passes through', () => {
  const abs = {
    url: 'https://cms.dinkominfo.pekalongankab.go.id/uploads/laporan.pdf',
    name: 'laporan.pdf',
    ext: '.pdf',
    mime: 'application/pdf',
  };
  const result = resolveArticlePdf({ pdf: abs }, resolveUrl);
  assert.equal(result?.url, 'https://cms.dinkominfo.pekalongankab.go.id/uploads/laporan.pdf');
  assert.equal(result?.description, undefined);
});

test('Given PDF media with an HTTP URL, when resolved, then it is rejected', () => {
  const insecure = { ...validPdf, url: 'http://cms.dinkominfo.pekalongankab.go.id/uploads/laporan.pdf' };
  assert.equal(resolveArticlePdf({ pdf: insecure }, resolveUrl), null);
});

test('Given a PDF signalled only by mime, when resolved, then it is accepted', () => {
  const mimeOnly = { url: '/uploads/tanpa-ext', name: 'tanpa-ext', ext: '', mime: 'application/pdf' };
  const result = resolveArticlePdf({ pdf: mimeOnly }, resolveUrl);
  assert.equal(result?.url, 'https://cdn.pekalongankab.go.id/uploads/tanpa-ext');
});
