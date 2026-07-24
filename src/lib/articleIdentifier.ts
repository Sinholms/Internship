export function detectArticleIdentifierField(id: string): 'slug' | 'documentId' {
  const isDocumentId = /^[a-z0-9]{20,30}$/.test(id);
  const dashCount = (id.match(/-/g) || []).length;
  const looksLikeSlug = dashCount >= 3 && id.length > 30;
  return !looksLikeSlug && isDocumentId ? 'documentId' : 'slug';
}
