import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { existsSync } from 'fs';
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

    // Filter out the blog with matching slug and extract category for image deletion
    const blogToDelete = blogObjects.find(blogStr => blogStr.includes(`slug: '${slug}'`));
    const filteredBlogs = blogObjects.filter(blogStr => !blogStr.includes(`slug: '${slug}'`));

    if (filteredBlogs.length === blogObjects.length) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Extract category from the blog being deleted
    let categorySlug = '';
    if (blogToDelete) {
      const categoryMatch = blogToDelete.match(/category: ['"]([^'"]*)['"]/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        // Recreate the same category slug logic used during creation
        categorySlug = category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/s$/, '') // Remove trailing 's'
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 30);
      }
    }

    // Rebuild the blogData.ts content
    const newBlogsArray = filteredBlogs.join(',\n  ');
    const newContent = blogDataContent.replace(
      /export const blogPosts: BlogPost\[\] = \[([\s\S]*?)\];/,
      `export const blogPosts: BlogPost[] = [\n  ${newBlogsArray}\n];`
    );

    // Write the updated content
    await fs.writeFile(blogDataPath, newContent, 'utf-8');

    // Delete the blog content file
    const contentPath = path.join(process.cwd(), 'src/app/blog/[slug]/content', `${slug}.tsx`);
    try {
      if (existsSync(contentPath)) {
        await fs.unlink(contentPath);
        console.log('Deleted blog content file:', contentPath);
      }
    } catch (error) {
      console.error('Error deleting blog content file:', error);
    }

    // Remove import and case from page.tsx
    const pagePath = path.join(process.cwd(), 'src/app/blog/[slug]/page.tsx');
    try {
      let pageContent = await fs.readFile(pagePath, 'utf-8');

      // Create component name from slug (e.g., "dewa-approvals" -> "DewaApprovalsContent")
      const componentName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Content';

      // Remove import statement (handles both single and double quotes)
      const importRegex = new RegExp(`import ${componentName} from ['"]\\.\\/content\\/${slug}['"];?\\n`, 'g');
      pageContent = pageContent.replace(importRegex, '');

      // Remove the if statement from renderContent (more flexible pattern)
      // Matches: "    if (post.slug === 'slug') {\n      return <ComponentContent />;\n    }\n"
      const caseRegex = new RegExp(`\\s*if \\(post\\.slug === ['"]${slug}['"]\\) \\{[\\s\\S]*?return <${componentName} \\/>;[\\s\\S]*?\\}\\s*\\n`, 'gm');
      pageContent = pageContent.replace(caseRegex, '');

      // Write updated page.tsx
      await fs.writeFile(pagePath, pageContent, 'utf-8');
      console.log('Removed import and case from page.tsx');
    } catch (pageError) {
      console.error('Error updating page.tsx:', pageError);
    }

    // Delete all associated images if we have a category slug
    if (categorySlug) {
      const blogImagesDir = path.join(process.cwd(), 'public/images/blog');
      try {
        const files = await fs.readdir(blogImagesDir);
        // Find all images matching the pattern: building-approvals-dubai-{categorySlug}-*
        const imagePattern = `building-approvals-dubai-${categorySlug}-`;
        const imagesToDelete = files.filter(file => file.startsWith(imagePattern));

        // Delete each matching image
        for (const imageFile of imagesToDelete) {
          const imagePath = path.join(blogImagesDir, imageFile);
          try {
            await fs.unlink(imagePath);
            console.log('Deleted image:', imageFile);
          } catch (imgError) {
            console.error('Error deleting image:', imageFile, imgError);
          }
        }

        if (imagesToDelete.length > 0) {
          console.log(`Deleted ${imagesToDelete.length} image(s) for category: ${categorySlug}`);
        }
      } catch (dirError) {
        console.error('Error reading images directory:', dirError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog and associated images deleted successfully',
      deletedImages: categorySlug ? `Images for category '${categorySlug}' deleted` : 'No images found'
    });
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
