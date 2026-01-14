# Production Blog Upload Guide

This guide explains how to upload blogs in production using Vercel Blob Storage.

## Setup (One-Time)

### 1. Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Copy the `BLOB_READ_WRITE_TOKEN` that's generated
5. The token is automatically added to your environment variables

### 2. Verify Environment Variable

Go to **Settings** → **Environment Variables** and ensure you have:
- `BLOB_READ_WRITE_TOKEN` (should be automatically added)

## How to Upload Blogs in Production

### Method 1: Use the Production Upload API

1. Access your blog upload form at: `https://www.buildingapprovals.ae/blog-upload`

2. The form will automatically use the production API endpoint (`/api/admin/upload-blog-production`)

3. Fill in the blog details:
   - Title
   - Slug
   - Category
   - Author
   - Excerpt
   - Upload card image
   - Upload cover image
   - Upload content file (PDF or DOCX)
   - SEO settings

4. Click **Upload Blog**

5. The API will:
   - ✅ Upload all images to Vercel Blob (permanent cloud storage)
   - ✅ Parse the PDF/DOCX content
   - ✅ Return the blog data and content

6. **Important**: The response will include:
   - `blogData` - Object to add to `blogData.ts`
   - `blogContent` - Content for the blog component file
   - `instructions` - Steps to complete manually

### Method 2: Manual Steps After Upload

After the API returns success, you need to manually add the blog to your codebase:

#### Step 1: Add to blogData.ts

Open `src/app/blog/blogData.ts` and add the returned `blogData` object to the array:

```typescript
export const blogPosts: BlogPost[] = [
  {
    id: '1234567890',
    title: 'Your New Blog Title',
    slug: 'your-new-blog-slug',
    // ... rest of the data from API response
  },
  // ... existing blogs
];
```

#### Step 2: Create Blog Content File

Create a new file: `src/app/blog/[slug]/content/your-new-blog-slug.tsx`

```typescript
export default function BlogContent() {
  return (
    <div className="blog-content-wrapper">
      {/* Paste the blogContent from API response here */}

      <div className="cta-box">
        <h3>Need Help with Building Approvals?</h3>
        <p>Our expert team is ready to assist you with all your Dubai building approval needs.</p>
        <a href="/contact" className="cta-button">Get in Touch</a>
      </div>
    </div>
  );
}
```

#### Step 3: Update page.tsx

Open `src/app/blog/[slug]/page.tsx` and add:

1. Import statement at the top:
```typescript
import YourNewBlogSlugContent from './content/your-new-blog-slug';
```

2. Add case in `renderContent()` function:
```typescript
if (post.slug === 'your-new-blog-slug') {
  return <YourNewBlogSlugContent />;
}
```

#### Step 4: Commit and Deploy

```bash
git add .
git commit -m "Add new blog post: Your Blog Title"
git push
```

Vercel will automatically deploy your changes.

## Why This Approach?

**Images**: Stored in Vercel Blob (permanent cloud storage, CDN-backed)
- ✅ Works in production
- ✅ Fast delivery via CDN
- ✅ No file system issues
- ✅ Scalable

**Blog Content**: Stored in codebase (static files)
- ✅ Fast page loads (static generation)
- ✅ Version controlled
- ✅ SEO optimized
- ✅ No database needed

## Alternative: Fully Automated (Requires GitHub API)

If you want fully automated blog creation without manual steps, you would need:

1. GitHub API integration to automatically commit files
2. Trigger Vercel deployment via API
3. More complex setup

Let me know if you want me to implement the fully automated version.

## Troubleshooting

### "Vercel Blob storage is not configured"
- Go to Vercel dashboard → Storage → Create Blob storage
- The `BLOB_READ_WRITE_TOKEN` will be automatically added

### Images not loading
- Check that images were uploaded successfully (check the API response)
- Verify the Blob URLs are accessible
- Check browser console for CORS errors

### Blog not appearing on site
- Ensure you added the blog to `blogData.ts`
- Ensure you created the content component file
- Ensure you updated `page.tsx` with the import and render case
- Check that you committed and deployed the changes

## Cost

Vercel Blob Storage:
- **Free tier**: 500 GB bandwidth, 1 GB storage per month
- **Pro**: $0.15/GB storage, $0.30/GB bandwidth

For a blog with ~50 posts and images averaging 500KB each:
- Storage: ~25 MB (~$0.004/month)
- Bandwidth (1000 views/month): ~25 GB (~$7.50/month on Pro plan, FREE on hobby)

The free tier is more than enough for your needs.
