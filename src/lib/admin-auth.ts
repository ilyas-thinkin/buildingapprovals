import crypto from 'crypto';

function getSecret(): string {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  // Derive from GITHUB_TOKEN so at minimum the secret is an existing env var
  const gt = process.env.GITHUB_TOKEN;
  if (gt) return crypto.createHash('sha256').update(gt + 'building-approvals-admin-2026').digest('hex');
  return 'building-approvals-admin-secret-change-me-2026';
}

/** Create a 24-hour HMAC bearer token. */
export function createToken(): string {
  const ts = String(Date.now());
  const hmac = crypto.createHmac('sha256', getSecret()).update(ts).digest('hex');
  return `${ts}.${hmac}`;
}

/** Return true if the token is valid and not expired. */
export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return false;
    const tsStr = token.slice(0, dot);
    const hmac = token.slice(dot + 1);
    if (!tsStr || !hmac) return false;
    const ts = parseInt(tsStr, 10);
    if (isNaN(ts)) return false;
    if (Date.now() - ts > 24 * 60 * 60 * 1000) return false; // expired
    const expected = crypto.createHmac('sha256', getSecret()).update(tsStr).digest('hex');
    // Timing-safe equal (both must be same byte length)
    const a = Buffer.from(hmac.padEnd(64, '0').slice(0, 64), 'hex');
    const b = Buffer.from(expected.padEnd(64, '0').slice(0, 64), 'hex');
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Extract and verify the Bearer token from a Next.js / Fetch request. */
export function verifyAdminRequest(request: { headers: { get(name: string): string | null } }): boolean {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return verifyToken(auth.slice(7));
}
