import xss from 'xss';

/**
 * Sanitize HTML input to prevent XSS attacks.
 */
export function sanitizeHtml(input: string): string {
  return xss(input);
}

/**
 * Sanitize specific fields in an object.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: string[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      (result as any)[field] = sanitizeHtml(result[field]);
    }
  }
  return result;
}
