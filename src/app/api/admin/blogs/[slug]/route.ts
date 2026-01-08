import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Read blogData.ts file
    const blogDataPath = path.join(process.cwd(), 'src/app/blog/blogData.ts');
    const blogDataContent = await fs.readFile(blogDataPath, 'utf-8');

    // Remove the blog entry with matching slug
    const blogArrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!blogArrayMatch) {
      return NextResponse.json({ error: 'Could not parse blog data' }, { status: 500 });
    }

    // Parse individual blog objects
    const blogsText = blogArrayMatch[1];
    const blogObjects = blogsText.split(/},\s*{/).map((obj, index, arr) => {
      if (index === 0) return obj + '}';
      if (index === arr.length - 1) return '{' + obj;
      return '{' + obj + '}';
    });

    // Filter out the blog with matching slug
    const filteredBlogs = blogObjects.filter(blogStr => !blogStr.includes(`slug: '${slug}'`));

    if (filteredBlogs.length === blogObjects.length) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Rebuild the blogData.ts content
    const newBlogsArray = filteredBlogs.join(',\n  ');
    const newContent = blogDataContent.replace(
      /export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/,
      `export const blogPosts: BlogPost[] = [\n  ${newBlogsArray}\n];`
    );

    // Write the updated content
    await fs.writeFile(blogDataPath, newContent, 'utf-8');

    // Delete the blog directory
    const blogDir = path.join(process.cwd(), 'src/app/blog', slug);
    try {
      await fs.rm(blogDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error deleting blog directory:', error);
    }

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Read blogData.ts file
    const blogDataPath = path.join(process.cwd(), 'src/app/blog/blogData.ts');
    const blogDataContent = await fs.readFile(blogDataPath, 'utf-8');

    // Find the blog with matching slug
    const blogArrayMatch = blogDataContent.match(/export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/);
    if (!blogArrayMatch) {
      return NextResponse.json({ error: 'Could not parse blog data' }, { status: 500 });
    }

    // Extract blog data (simplified parsing)
    const blogsText = blogArrayMatch[1];
    const blogMatch = blogsText.match(new RegExp(`{[^}]*slug: '${slug}'[^}]*}`, 's'));

    if (!blogMatch) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Parse the blog object
    const blogStr = blogMatch[0];
    const blog: any = {};

    const fields = ['id', 'title', 'excerpt', 'date', 'author', 'category', 'image', 'coverImage', 'slug'];
    fields.forEach(field => {
      const regex = new RegExp(`${field}: ['"]([^'"]*?)['"]`);
      const match = blogStr.match(regex);
      if (match) {
        blog[field] = match[1];
      }
    });

    // Read the blog content file
    const contentDir = path.join(process.cwd(), 'src/app/blog/[slug]/content');
    const contentPath = path.join(contentDir, `${slug}.tsx`);

    try {
      const contentFile = await fs.readFile(contentPath, 'utf-8');
      blog.contentFile = contentFile;
    } catch (error) {
      console.error('Error reading blog content:', error);
      // Try with alternative path structure if exists
      console.log('Attempted path:', contentPath);
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}
