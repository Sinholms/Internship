export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  name?: string;
  hash?: string;
  ext?: string;
  mime?: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CategoryCMS {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TagCMS {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface AuthorCMS {
  id: number;
  documentId?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
}

export interface RelatedArticlesCMS {
  id?: number;
  title?: string;
  articles?: ArticleCMS[];
}

export interface ArticleCMS {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  publication_date?: string;
  views?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  featuredImage?: StrapiMedia | null;
  category?: CategoryCMS | null;
  tags?: TagCMS[] | null;
  author?: AuthorCMS | null;
  pdfViewer?: { pdf?: StrapiMedia; description?: string } | null;
  relatedArticles?: RelatedArticlesCMS | null;
}

export interface MenuItemCMS {
  id: number;
  documentId: string;
  title: string;
  url?: string | null;
  type?: string | null;
  order?: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  menu?: { id: number; name: string } | null;
  page?: { id: number; documentId: string; slug: string } | null;
  article?: { id: number; documentId: string; slug: string; title: string } | null;
  category?: { id: number; documentId: string; slug: string; name: string } | null;
  parent?: MenuItemCMS | null;
  children?: MenuItemCMS[] | null;
}

export interface GlobalCMS {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string;
  siteIcon?: StrapiMedia | null;
  siteIconDark?: StrapiMedia | null;
  favicon?: StrapiMedia | null;
  copyrightText?: string | null;
  defaultSeo?: {
    metaTitle?: string;
    metaDescription?: string;
    shareImage?: StrapiMedia;
  } | null;
  socialMedia?: { platform?: string; url?: string; icon?: StrapiMedia }[] | null;
  footerItems?: unknown[] | null;
}

export interface SliderFileCMS {
  id: number;
  documentId?: string;
  name?: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: StrapiMedia['formats'];
}

export interface SectionBlockCMS {
  __component: string;
  id: number;
  documentId?: string;
  title?: string;
  description?: string;
  // dynamic polymorphic fields
  [key: string]: unknown;
}

export interface SectionCMS {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  showTitle?: boolean;
  blocks?: SectionBlockCMS[];
}

export interface AsideCMS {
  id: number;
  documentId: string;
  title: string;
  item?: SectionBlockCMS[];
}

export interface HomePageCMS {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  heroSlider?: {
    id: number;
    files?: StrapiMedia[] | SliderFileCMS[];
  } | null;
  sections?: SectionCMS[] | null;
  asides?: AsideCMS[] | null;
}

export interface PageCMS {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  views?: number;
  sections?: SectionCMS[] | null;
  asides?: AsideCMS[] | null;
  forms?: unknown[] | null;
}
