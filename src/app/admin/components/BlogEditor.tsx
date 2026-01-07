'use client';

import React, { useState } from 'react';

export default function BlogEditor() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    author: 'Building Approvals Dubai',
    excerpt: '',
    cardImage: null as File | null,
    coverImage: null as File | null,
    contentFile: null as File | null,
    manualSEO: false,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    keywords: '',
  });

  const [previews, setPreviews] = useState({
    cardImage: '',
    coverImage: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));

    // Create preview for images
    if (file && (fieldName === 'cardImage' || fieldName === 'coverImage')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleBlur = () => {
    if (formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'object') {
          data.append(key, value.toString());
        }
      });

      // Append files
      if (formData.cardImage) data.append('cardImage', formData.cardImage);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      if (formData.contentFile) data.append('contentFile', formData.contentFile);

      const response = await fetch('/api/admin/create-blog', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Blog post created successfully!');
        // Reset form
        setFormData({
          title: '',
          slug: '',
          category: '',
          author: 'Building Approvals Dubai',
          excerpt: '',
          cardImage: null,
          coverImage: null,
          contentFile: null,
          manualSEO: false,
          metaTitle: '',
          metaDescription: '',
          focusKeyword: '',
          keywords: '',
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="blog-editor">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Blog Information</h2>

          <div className="form-group">
            <label>Blog Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleTitleBlur}
              required
              placeholder="Enter blog title"
            />
          </div>

          <div className="form-group">
            <label>Slug (URL) *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              placeholder="blog-url-slug"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="e.g., Dubai Municipality"
              />
            </div>

            <div className="form-group">
              <label>Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Excerpt (Summary) *</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="Brief description for blog list"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Images</h2>

          <div className="form-group">
            <label>Card Image (Blog List) * <span className="hint">Recommended: 1200x800px</span></label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="cardImage"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'cardImage')}
                required
                style={{ display: 'none' }}
              />
              <label htmlFor="cardImage" className="file-upload-btn">
                {formData.cardImage ? formData.cardImage.name : 'Choose Card Image'}
              </label>
              {previews.cardImage && (
                <div className="image-preview">
                  <img src={previews.cardImage} alt="Card preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Cover Image (Blog Header) * <span className="hint">Recommended: 1920x1080px</span></label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'coverImage')}
                required
                style={{ display: 'none' }}
              />
              <label htmlFor="coverImage" className="file-upload-btn">
                {formData.coverImage ? formData.coverImage.name : 'Choose Cover Image'}
              </label>
              {previews.coverImage && (
                <div className="image-preview">
                  <img src={previews.coverImage} alt="Cover preview" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Blog Content</h2>

          <div className="form-group">
            <label>Content Document * <span className="hint">PDF or DOCX with text and images</span></label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="contentFile"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'contentFile')}
                required
                style={{ display: 'none' }}
              />
              <label htmlFor="contentFile" className="file-upload-btn">
                {formData.contentFile ? formData.contentFile.name : 'Choose Content File'}
              </label>
              {formData.contentFile && (
                <div className="file-info">
                  <span>📄 {formData.contentFile.name}</span>
                  <span className="file-size">({(formData.contentFile.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>SEO Settings</h2>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="manualSEO"
                checked={formData.manualSEO}
                onChange={handleInputChange}
              />
              Add manual SEO tags (uncheck to auto-generate)
            </label>
          </div>

          {formData.manualSEO && (
            <>
              <div className="form-group">
                <label>Meta Title <span className="hint">60 characters max</span></label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  maxLength={60}
                  placeholder="SEO title for search results"
                />
                <span className="char-count">{formData.metaTitle.length}/60</span>
              </div>

              <div className="form-group">
                <label>Meta Description <span className="hint">155-160 characters</span></label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  maxLength={160}
                  rows={3}
                  placeholder="SEO description for search snippets"
                />
                <span className="char-count">{formData.metaDescription.length}/160</span>
              </div>

              <div className="form-group">
                <label>Focus Keyword</label>
                <input
                  type="text"
                  name="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={handleInputChange}
                  placeholder="Main keyword for this blog"
                />
              </div>

              <div className="form-group">
                <label>Keywords <span className="hint">Comma separated</span></label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Creating Blog...' : 'Create Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
