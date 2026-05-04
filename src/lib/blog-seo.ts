export const BLOG_BRAND_NAME = 'Building Approvals Dubai';

export function cleanBlogMetaTitle(title: string, fallback = ''): string {
  const cleaned = title
    .replace(/\s*(?:\||-|–|—)?\s*(?:by\s+)?building approvals dubai\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback.trim();
}

export function cleanBlogSlugText(text: string): string {
  return text
    .replace(/\b(?:by\s+)?building approvals dubai\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanBlogPlainText(text: string, maxLength = 5000): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function toTsStringLiteral(text: string): string {
  return JSON.stringify(cleanBlogPlainText(text));
}

export function cleanBlogAssetUrl(text: string): string {
  const value = cleanBlogPlainText(text, 1000).replace(/\s+/g, '');

  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}
