import { NextRequest, NextResponse } from 'next/server';
import { blogPosts } from '@/app/blog/blogData';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ blogs: blogPosts });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
