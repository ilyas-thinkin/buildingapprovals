import { NextResponse } from 'next/server';
import { blogPosts } from '@/app/blog/blogData';

export async function GET() {
  try {
    return NextResponse.json({ blogs: blogPosts });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}
