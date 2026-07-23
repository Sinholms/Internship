import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('');
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
});

const { sanitizeArticleHtml } = await import('./sanitizeArticleHtml.js');

test('Given allowed article markup, when sanitized, then it preserves approved HTML', () => {
  const html = sanitizeArticleHtml(
    '<h2>Judul</h2><p><strong>Tebal</strong> <a href="https://example.com">Tautan</a></p><img src="https://cdn.pekalongankab.go.id/uploads/foto.jpg" alt="Foto"><table><thead><tr><th>Kolom</th></tr></thead><tbody><tr><td>Nilai</td></tr></tbody></table>',
  );

  assert.match(html, /<h2>Judul<\/h2>/);
  assert.match(html, /href="https:\/\/example\.com"/);
  assert.match(html, /src="https:\/\/cdn\.pekalongankab\.go\.id\/uploads\/foto\.jpg"/);
  assert.match(html, /<table>/);
});

test('Given hostile markup, when sanitized, then it removes executable and untrusted content', () => {
  const html = sanitizeArticleHtml(
    '<script>alert(1)</script><p onclick="alert(1)" style="color:red">Aman</p><a href="javascript:alert(1)">Jahat</a><img src="data:text/html,boom" onerror="alert(1)"><iframe src="https://evil.example/embed" srcdoc="<script>alert(1)</script>"></iframe>',
  );

  assert.doesNotMatch(html, /script|onclick|style=|javascript:|data:|onerror|evil\.example|srcdoc|iframe/i);
  assert.match(html, /<p>Aman<\/p>/);
});

test('Given embeds, when sanitized, then it keeps only trusted HTTPS sources', () => {
  const html = sanitizeArticleHtml(
    '<iframe src="https://www.youtube.com/embed/video"></iframe><iframe src="https://www.youtube-nocookie.com/embed/video"></iframe><iframe src="https://www.google.com/maps/embed?pb=value"></iframe><embed src="https://cms.dinkominfo.pekalongankab.go.id/embed/file"></embed><iframe src="http://www.youtube.com/embed/video"></iframe><iframe src="https://untrusted.pekalongankab.go.id/embed"></iframe>',
  );

  assert.match(html, /www\.youtube\.com\/embed\/video/);
  assert.match(html, /www\.youtube-nocookie\.com\/embed\/video/);
  assert.match(html, /www\.google\.com\/maps\/embed/);
  assert.match(html, /cms\.dinkominfo\.pekalongankab\.go\.id\/embed\/file/);
  assert.doesNotMatch(html, /http:\/\/www\.youtube\.com/);
  assert.doesNotMatch(html, /untrusted\.pekalongankab\.go\.id/);
});
