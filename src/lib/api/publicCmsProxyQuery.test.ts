import assert from 'node:assert/strict';
import test from 'node:test';

const { buildArticlesQuery, buildCategoriesQuery, buildPagesQuery } = await import('./publicCmsProxyQuery.js');

test('Given an unknown articles key, when query is built, then it is rejected', () => {
  const result = buildArticlesQuery(new URLSearchParams('populate[deep]=20'));

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, 'Parameter kueri tidak didukung.');
});

test('Given an oversized article page size, when query is built, then it is capped at twenty', () => {
  const result = buildArticlesQuery(new URLSearchParams('pagination[pageSize]=999&populate=*'));

  assert.equal(result.ok, true);
  if (result.ok) assert.match(result.search, /pagination\[pageSize\]=20/);
});

test('Given malformed pagination, when categories query is built, then it is rejected', () => {
  const result = buildCategoriesQuery(new URLSearchParams('pagination[page]=0'));

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, 'Pagination tidak valid.');
});

test('Given an oversized pages page size, when query is built, then it is capped at one hundred', () => {
  const result = buildPagesQuery(new URLSearchParams('pagination[pageSize]=200'));

  assert.equal(result.ok, true);
  if (result.ok) assert.match(result.search, /pagination\[pageSize\]=100/);
});
