import assert from 'node:assert/strict';
import test from 'node:test';

const { isReservedCmsRoute, RESERVED_CMS_ROUTES } = await import('./reservedCmsRoutesCore.js');

test('Given reserved root and pages, when checked, then exact CMS routes are reserved', () => {
  assert.equal(isReservedCmsRoute('/'), true);
  assert.equal(isReservedCmsRoute('/berita'), true);
  assert.equal(isReservedCmsRoute('/profil'), true);
  assert.equal(isReservedCmsRoute('/layanan'), true);
  assert.equal(isReservedCmsRoute('/galeri'), true);
  assert.equal(isReservedCmsRoute('/unduhan'), true);
  assert.equal(isReservedCmsRoute('/kontak'), true);
  assert.equal(isReservedCmsRoute('/cms-test'), true);
  assert.equal(RESERVED_CMS_ROUTES.has('/berita'), true);
});

test('Given missing slashes or extra trailing slashes, when checked, then route matching is normalized', () => {
  assert.equal(isReservedCmsRoute('berita'), true);
  assert.equal(isReservedCmsRoute('/berita/'), true);
  assert.equal(isReservedCmsRoute('///berita///'), true);
});

test('Given article nested paths, when checked, then they are not reserved by parent routes', () => {
  assert.equal(isReservedCmsRoute('/berita/visi-misi'), false);
  assert.equal(isReservedCmsRoute('/profil/sejarah'), false);
  assert.equal(isReservedCmsRoute('/cms-test/status'), false);
});

test('Given empty or relative path forms, when checked, then only root normalizes to reserved root', () => {
  assert.equal(isReservedCmsRoute(''), true);
  assert.equal(isReservedCmsRoute('///'), true);
  assert.equal(isReservedCmsRoute('pages/visi-misi'), false);
});
