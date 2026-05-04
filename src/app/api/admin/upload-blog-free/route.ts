import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    {
      error: 'The legacy free upload endpoint has been retired. Use /api/admin/create-blog for sanitized blog creation.',
    },
    { status: 410 }
  );
}
