/**
 * Dependency-free id generator. Uses the Web Crypto API (available in all
 * modern browsers and in the Node.js runtime Next.js targets) so we avoid
 * pulling in `uuid` as a dependency.
 */
export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID (very old browsers).
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${random}`;
}
