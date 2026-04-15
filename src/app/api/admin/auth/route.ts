import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME || 'buildingapprovals_admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'BuildingApprovals123#';

    // Add a small constant delay to blunt brute-force attempts
    await new Promise(r => setTimeout(r, 150));

    if (!username || !password || username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ token: createToken() });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
