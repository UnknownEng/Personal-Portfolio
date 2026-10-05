/**
 * Centralized Safe URL Sanitization Utility (OWASP Compliance)
 *
 * Protects against XSS and malicious scheme execution (e.g. javascript:, data:, vbscript:)
 * while preserving legitimate external links (https:, http:, mailto:, tel:) and safe relative paths.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '#';
  }

  // Safe relative paths within application
  if (trimmed.startsWith('#')) {
    return trimmed;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Strip control characters, whitespace, and tabs that can evade basic substring checks
  const stripped = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, '').toLowerCase();

  // Explicitly reject known dangerous execution schemes
  if (
    stripped.startsWith('javascript:') ||
    stripped.startsWith('data:') ||
    stripped.startsWith('vbscript:') ||
    stripped.startsWith('file:') ||
    stripped.startsWith('blob:')
  ) {
    return '#';
  }

  try {
    // Test if it parses as a valid URL with an allowed protocol
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return trimmed;
    }
  } catch {
    // If not a full URL and not starting with a dangerous prefix, check relative fallback
    if (!trimmed.includes(':') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }

  return '#';
}

export function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  const sanitized = sanitizeUrl(url);
  return sanitized !== '#' && sanitized !== '';
}
