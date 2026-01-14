'use client';

import { useState } from 'react';
import './upload-form.css';

export default function UploadBlogPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    author: 'Building Approvals Dubai',
    excerpt: '',
    manualSEO: false,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    keywords: '',
  });

  const [files, setFiles] = useState({
    cardImage: null as File | null,
    coverImage: null as File | null,
    contentFile: null as File | null,
  });

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Append files
      if (files.cardImage) formDataToSend.append('cardImage', files.cardImage);
      if (files.coverImage) formDataToSend.append('coverImage', files.coverImage);
      if (files.contentFile) formDataToSend.append('contentFile', files.contentFile);

      const response = await fetch('/api/admin/upload-blog-auto', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <div className="upload-blog-page">
      <div className="upload-container">
        <h1>Upload New Blog Post</h1>
        <p className="subtitle">Upload blog content and images to Vercel Blob Storage</p>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Blog Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., DEWA Approvals Dubai: Complete Guide"
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">URL Slug *</label>
              <div className="slug-input-group">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., dewa-approvals-dubai-complete-guide"
                />
                <button type="button" onClick={generateSlug} className="generate-slug-btn">
                  Generate from Title
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="e.g., Dubai Approvals"
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">Excerpt *</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Brief description of the blog post (150-200 characters)"
              />
            </div>
          </div>

          {/* Files */}
          <div className="form-section">
            <h2>Files</h2>

            <div className="form-group">
              <label htmlFor="cardImage">Card Image (List View) *</label>
              <input
                type="file"
                id="cardImage"
                name="cardImage"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
              <small>Recommended: 600x400px, JPG/PNG</small>
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image (Blog Header) *</label>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
              <small>Recommended: 1200x630px, JPG/PNG</small>
            </div>

            <div className="form-group">
              <label htmlFor="contentFile">Blog Content File *</label>
              <input
                type="file"
                id="contentFile"
                name="contentFile"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                required
              />
              <small>PDF or DOCX file containing the blog content</small>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="form-section">
            <h2>SEO Settings (Optional)</h2>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="manualSEO"
                  checked={formData.manualSEO}
                  onChange={handleInputChange}
                />
                <span>Use manual SEO settings (otherwise auto-generated)</span>
              </label>
            </div>

            {formData.manualSEO && (
              <>
                <div className="form-group">
                  <label htmlFor="metaTitle">Meta Title</label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Custom meta title for SEO"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="metaDescription">Meta Description</label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Custom meta description for SEO"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="focusKeyword">Focus Keyword</label>
                  <input
                    type="text"
                    id="focusKeyword"
                    name="focusKeyword"
                    value={formData.focusKeyword}
                    onChange={handleInputChange}
                    placeholder="Main keyword to target"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="keywords">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Blog'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="alert alert-success">
            <h3>Success!</h3>
            <p>{result.message}</p>

            <div className="result-section">
              <h4>Blog Data</h4>
              <pre>{JSON.stringify(result.blogData, null, 2)}</pre>

              <h4>Instructions</h4>
              <ol>
                {Object.entries(result.instructions).map(([key, value]) => (
                  <li key={key}>{value as string}</li>
                ))}
              </ol>

              <h4>Blog Content</h4>
              <textarea
                readOnly
                value={result.blogContent}
                rows={20}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
