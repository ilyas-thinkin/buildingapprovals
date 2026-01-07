# Blog Admin Panel Guide

## Access the Admin Panel

Navigate to: `http://localhost:3000/admin` (or your production domain + `/admin`)

## Login Credentials

- **Username:** `buildingapprovals_admin`
- **Password:** `BuildingApprovals123#`

## How to Create a New Blog Post

### 1. Blog Information
- **Blog Title:** Enter the main title of your blog post
- **Slug:** URL-friendly version (auto-generated from title, or customize)
- **Category:** e.g., "Dubai Municipality", "Civil Defence", etc.
- **Author:** Default is "Building Approvals Dubai"
- **Excerpt:** A brief summary (2-3 sentences) for the blog list page

### 2. Images
- **Card Image:** For the blog list (Recommended: 1200x800px)
- **Cover Image:** For the blog header (Recommended: 1920x1080px)

### 3. Blog Content
- **Content Document:** Upload a PDF or DOCX file containing:
  - Your blog text content
  - Any images embedded in the document
  - The system will extract and format everything automatically

### 4. SEO Settings
- **Checkbox:** "Add manual SEO tags"
  - **Unchecked (default):** SEO tags are auto-generated from your blog title and excerpt
  - **Checked:** You can manually enter:
    - Meta Title (60 characters max)
    - Meta Description (155-160 characters)
    - Focus Keyword
    - Additional Keywords (comma-separated)

## What Happens After Submission

The system automatically:

1. **Saves your images** to `/public/Blogs/` with proper naming
2. **Extracts content** from your PDF/DOCX file
3. **Generates a blog component** file in `src/app/blog/[slug]/content/`
4. **Updates blogData.ts** with your new blog entry
5. **Updates the blog page** to include your new post
6. **Generates SEO metadata** (auto or manual based on your choice)

## Image Recommendations

### Card Image (Blog List)
- **Size:** 1200 x 800 pixels
- **Aspect Ratio:** 3:2
- **Format:** JPG or WebP
- **File Size:** Under 200KB

### Cover Image (Blog Header)
- **Size:** 1920 x 1080 pixels
- **Aspect Ratio:** 16:9
- **Format:** JPG or WebP
- **File Size:** Under 400KB

## Content Document Tips

### For PDF:
- Use clear headings (they'll be converted to H2 tags)
- Separate paragraphs with blank lines
- Images will be extracted (basic support)

### For DOCX:
- Similar formatting as PDF
- Use built-in heading styles
- Keep formatting simple

## After Creating a Blog

1. The blog will immediately appear on `/blog` page
2. Access it at `/blog/your-slug`
3. Check the SEO meta tags in the page source
4. Verify images are displaying correctly

## Troubleshooting

### "Missing required fields" error
- Make sure all fields marked with * are filled
- Check that all files are selected

### Images not showing
- Verify image files are under 5MB
- Use standard formats (JPG, PNG, WebP)

### Content not formatting correctly
- Check your PDF/DOCX has clear paragraph breaks
- Avoid complex formatting in source document

## Security Note

**Important:** The admin panel uses basic authentication suitable for internal use. For production with multiple users, consider implementing:
- JWT authentication
- Database-backed user management
- Role-based access control
- HTTPS enforcement

## Need Help?

Contact the development team if you encounter any issues with the admin panel.
