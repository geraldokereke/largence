import { randomBytes } from 'crypto';

export class SlugUtil {
  /**
   * Generates a URL-safe, lowercase, hyphenated slug from a string.
   * Max 63 characters (DNS label limit).
   */
  static generateSlug(name: string): string {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Strip leading/trailing hyphens
      .substring(0, 63);

    return slug || 'org'; // Fallback if name was only special chars
  }

  /**
   * Appends a 4-character random hex suffix to ensure uniqueness.
   */
  static appendSuffix(slug: string): string {
    const suffix = randomBytes(2).toString('hex');
    const base = slug.substring(0, 58); // 63 - 1 (hyphen) - 4 (suffix) = 58
    return `${base}-${suffix}`;
  }
}
