import { NextRequest, NextResponse } from 'next/server';

/**
 * WordPress calls this endpoint via the WP Webhooks plugin when a post is
 * published/updated. It revalidates the 'wordpress' cache tag so the next
 * request re-fetches fresh data, then triggers the Vercel Deploy Hook for a
 * full static rebuild.
 *
 * Required env vars:
 *   REVALIDATION_SECRET   — shared secret set in both WordPress and Vercel
 *   VERCEL_DEPLOY_HOOK_URL — the deploy hook URL from your Vercel project
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Trigger a full Vercel rebuild via Deploy Hook
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (deployHookUrl) {
    try {
      await fetch(deployHookUrl, { method: 'POST' });
    } catch (err) {
      console.error('[revalidate] Deploy hook failed:', err);
    }
  }

  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
