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
