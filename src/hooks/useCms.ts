import { useEffect, useState, useCallback } from 'react';
import {
  getArticles,
  getArticleBySlug,
  getArticleByDocumentId,
  getLatestArticles,
  getCategories,
  getGlobal,
  getHomePage,
  getPageBySlug,
  getMenuItems,
} from '../lib/api/queries';
import type { ArticleCMS, CategoryCMS } from '../types/cms';

function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, deps as never[]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Articles
export function useArticles(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  limit?: number;
}) {
  const { query, category, page, pageSize, sort, limit } = params;
  const [state, setState] = useState<{
    articles: ArticleCMS[];
    total: number;
    pageCount: number;
    loading: boolean;
    error: string | null;
  }>({ articles: [], total: 0, pageCount: 1, loading: true, error: null });

  const fetchFn = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await getArticles({ query, category, page, pageSize, sort, limit });
      setState({
        articles: res.data,
        total: res.meta.pagination.total,
        pageCount: res.meta.pagination.pageCount,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: (e as Error).message }));
    }
  }, [query, category, page, pageSize, sort, limit]);

  useEffect(() => {
    fetchFn();
  }, [fetchFn]);

  return { ...state, refetch: fetchFn };
}

export function useLatestArticles(limit = 3, category?: string) {
  const [state, setState] = useState<{ articles: ArticleCMS[]; loading: boolean; error: string | null }>({
    articles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getLatestArticles({ limit, category });
        if (!cancelled) setState({ articles: res.data, loading: false, error: null });
      } catch (e) {
        if (!cancelled) setState({ articles: [], loading: false, error: (e as Error).message });
      }
    })();
    return () => { cancelled = true; };
  }, [limit, category]);

  return state;
}

export function useArticleBySlug(slug?: string) {
  const [state, setState] = useState<{ article: ArticleCMS | null; loading: boolean; error: string | null }>({
    article: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) { setState({ article: null, loading: false, error: null }); return; }
    let cancelled = false;
    (async () => {
      try {
        // Try slug first
        let article = await getArticleBySlug(slug);
        // If not found by slug, try documentId as fallback (in case slug param is actually documentId)
        if (!article) {
          try {
            article = await getArticleByDocumentId(slug);
          } catch { /* ignore fallback error */ }
        }
        if (!cancelled) setState({ article, loading: false, error: article ? null : 'Not found' });
      } catch (e) {
        if (!cancelled) setState({ article: null, loading: false, error: (e as Error).message });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}

export function useArticleByDocumentId(documentId?: string) {
  const [state, setState] = useState<{ article: ArticleCMS | null; loading: boolean; error: string | null }>({
    article: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!documentId) { setState({ article: null, loading: false, error: null }); return; }
    let cancelled = false;
    (async () => {
      try {
        // Try documentId first
        let article = await getArticleByDocumentId(documentId);
        // Fallback to slug if documentId fetch fails
        if (!article) {
          try {
            article = await getArticleBySlug(documentId);
          } catch { /* ignore */ }
        }
        if (!cancelled) setState({ article, loading: false, error: article ? null : 'Not found' });
      } catch (e) {
        if (!cancelled) setState({ article: null, loading: false, error: (e as Error).message });
      }
    })();
    return () => { cancelled = true; };
  }, [documentId]);

  return state;
}

export function useCategories() {
  return useAsync(async () => {
    const res = await getCategories();
    return res.data as CategoryCMS[];
  }, []);
}

export function useGlobal() {
  return useAsync(async () => {
    const res = await getGlobal();
    return res.data;
  }, []);
}

export function useHomePage() {
  return useAsync(async () => {
    const res = await getHomePage();
    return res.data;
  }, []);
}

export function usePageBySlug(slug: string) {
  return useAsync(async () => {
    const res = await getPageBySlug(slug);
    return res.data[0] || null;
  }, [slug]);
}

export function useMenuItems(menuName = 'Main Menu') {
  return useAsync(async () => {
    const res = await getMenuItems(menuName);
    return res.data;
  }, [menuName]);
}
