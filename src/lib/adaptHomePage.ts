import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';

export interface HomePageConfig {
  readonly heroImageUrl: string | null;
  readonly latestArticlesLimit: number;
  readonly latestArticlesCategory: string | null;
}

const DEFAULT_LATEST_ARTICLES_LIMIT = 3;
const MAX_LATEST_ARTICLES_LIMIT = 3;

type RecordValue = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function readHeroImageUrl(heroSlider: unknown): string | null {
  if (!isRecord(heroSlider) || !Array.isArray(heroSlider.files)) return null;

  for (const file of heroSlider.files) {
    if (!isRecord(file)) continue;
    const formats = isRecord(file.formats) ? file.formats : null;
    const medium = formats ? readMediaUrl(formats.medium) : null;
    const small = formats ? readMediaUrl(formats.small) : null;
    const original = readString(file.url);
    const imageUrl = medium ?? small ?? original;
    if (imageUrl) return getStrapiImageUrl(imageUrl);
  }

  return null;
}

function readMediaUrl(value: unknown): string | null {
  return isRecord(value) ? readString(value.url) : null;
}

function readLatestArticlesBlock(sections: unknown): RecordValue | null {
  if (!Array.isArray(sections)) return null;

  for (const section of sections) {
    if (!isRecord(section) || !Array.isArray(section.blocks)) continue;
    for (const block of section.blocks) {
      if (isRecord(block) && block.__component === 'widgets.latest-articles') return block;
    }
  }

  return null;
}

function readLimit(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_LATEST_ARTICLES_LIMIT;
  return Math.min(MAX_LATEST_ARTICLES_LIMIT, Math.max(1, Math.floor(value)));
}

function readCategory(block: RecordValue): string | null {
  if (block.filter_by_category !== true || !isRecord(block.category)) return null;
  return readString(block.category.slug);
}

export function adaptHomePage(payload: unknown): HomePageConfig {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : null;
  const block = data ? readLatestArticlesBlock(data.sections) : null;

  return {
    heroImageUrl: data ? readHeroImageUrl(data.heroSlider) : null,
    latestArticlesLimit: block ? readLimit(block.limit) : DEFAULT_LATEST_ARTICLES_LIMIT,
    latestArticlesCategory: block ? readCategory(block) : null,
  };
}
