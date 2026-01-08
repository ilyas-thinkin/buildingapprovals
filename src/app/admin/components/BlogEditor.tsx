'use client';

import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/app/blog/blogData';

interface BlogEditorProps {
  editingBlog?: BlogPost | null;
  onCancelEdit?: () => void;
}

export default function BlogEditor({ editingBlog, onCancelEdit }: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    author: 'Building Approvals Dubai',
    excerpt: '',
    cardImage: null as File | null,
    coverImage: null as File | null,
    contentFile: null as File | null,
    contentType: 'file' as 'file' | 'manual',
    manualContent: '',
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

  const [contentImages, setContentImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load blog data when editing
  useEffect(() => {
    if (editingBlog) {
      setFormData({
        title: editingBlog.title,
        slug: editingBlog.slug,
        category: editingBlog.category,
        author: editingBlog.author,
        excerpt: editingBlog.excerpt,
        cardImage: null,
        coverImage: null,
        contentFile: null,
        contentType: 'manual',
        manualContent: '',
        manualSEO: false,
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        keywords: '',
      });
      setPreviews({
        cardImage: editingBlog.image,
        coverImage: editingBlog.coverImage || '',
      });

      // Fetch blog content
      fetch(`/api/admin/blogs/${editingBlog.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.blog && data.blog.contentFile) {
            // Extract content from the BlogContent.tsx file
            const content = extractContentFromComponent(data.blog.contentFile);
            setFormData(prev => ({ ...prev, manualContent: content }));
          }
        });
    }
  }, [editingBlog]);

  const extractContentFromComponent = (componentStr: string): string => {
    // Extract content from JSX component and convert to markdown-like format
    let content = componentStr;

    // Remove imports and function declaration
    content = content.replace(/import.*?;\n/g, '');
    content = content.replace(/export default function.*?\(\)\s*\{/g, '');
    content = content.replace(/return\s*\(/g, '');
    content = content.replace(/<>|<\/>/g, '');
    content = content.replace(/\s*\}\s*$/g, '');

    // Convert JSX to plain text with markdown
    // Headers
    content = content.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n## $1\n');
    content = content.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n### $1\n');

    // Paragraphs
    content = content.replace(/<p[^>]*>(.*?)<\/p>/g, (match, text) => {
      // Keep <strong> and other inline elements for now
      return '\n' + text + '\n';
    });

    // Lists
    content = content.replace(/<ul[^>]*>(.*?)<\/ul>/g, (match, items) => {
      return items;
    });
    content = content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n');

    // Bold
    content = content.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');

    // Remove remaining HTML tags
    content = content.replace(/<[^>]*>/g, '');

    // Clean up excessive newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.trim();

    return content;
  };

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

  const handleContentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImageIndex = contentImages.length;
      setContentImages(prev => [...prev, { file, preview: reader.result as string }]);

      // Insert image placeholder at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const beforeText = formData.manualContent.substring(0, start);
        const afterText = formData.manualContent.substring(start);

        const imagePlaceholder = `\n![Image ${newImageIndex + 1}](image_${newImageIndex})\n`;
        const newText = beforeText + imagePlaceholder + afterText;

        setFormData(prev => ({ ...prev, manualContent: newText }));

        // Set cursor after the inserted image
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + imagePlaceholder.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeContentImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.manualContent.substring(start, end);
    const beforeText = formData.manualContent.substring(0, start);
    const afterText = formData.manualContent.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    setFormData(prev => ({ ...prev, manualContent: newText }));

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertFormatting('**', '**');
  const formatItalic = () => insertFormatting('*', '*');
  const formatHeading = () => insertFormatting('\n## ', '\n');
  const formatSubheading = () => insertFormatting('\n### ', '\n');
  const formatBulletList = () => insertFormatting('\n- ', '');
  const formatNumberedList = () => insertFormatting('\n1. ', '');
  const formatLink = () => insertFormatting('[', '](url)');
  const formatQuote = () => insertFormatting('\n> ', '');

  const triggerImageUpload = () => {
    document.getElementById('contentImages')?.click();
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

      // If editing, include the original slug
      if (editingBlog) {
        data.append('originalSlug', editingBlog.slug);
        data.append('isEditing', 'true');
      }

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'object') {
          data.append(key, value.toString());
        }
      });

      // Append files only if they're new (not just previews)
      if (formData.cardImage) data.append('cardImage', formData.cardImage);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      if (formData.contentFile) data.append('contentFile', formData.contentFile);

      // If editing and no new images, keep existing ones
      if (editingBlog && !formData.cardImage) {
        data.append('existingCardImage', editingBlog.image);
      }
      if (editingBlog && !formData.coverImage && editingBlog.coverImage) {
        data.append('existingCoverImage', editingBlog.coverImage);
      }

      // Append content images for manual editor
      contentImages.forEach((img, index) => {
        data.append(`contentImage_${index}`, img.file);
      });

      const endpoint = editingBlog ? '/api/admin/update-blog' : '/api/admin/create-blog';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(editingBlog ? 'Blog post updated successfully!' : 'Blog post created successfully!');

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
          contentType: 'file',
          manualContent: '',
          manualSEO: false,
          metaTitle: '',
          metaDescription: '',
          focusKeyword: '',
          keywords: '',
        });
        setPreviews({ cardImage: '', coverImage: '' });
        setContentImages([]);

        // Call cancel edit to return to list
        if (onCancelEdit) {
          onCancelEdit();
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog post');
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
            <label>Content Input Method *</label>
            <div className="content-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="contentType"
                  value="file"
                  checked={formData.contentType === 'file'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: 'file' as 'file' | 'manual' }))}
                />
                <span>Upload Document (PDF/DOCX)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="contentType"
                  value="manual"
                  checked={formData.contentType === 'manual'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: 'manual' as 'file' | 'manual' }))}
                />
                <span>Write Manually</span>
              </label>
            </div>
          </div>

          {formData.contentType === 'file' ? (
            <div className="form-group">
              <label>Content Document * <span className="hint">PDF or DOCX with text and images</span></label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="contentFile"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'contentFile')}
                  required={formData.contentType === 'file'}
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
          ) : (
            <>
              <div className="form-group">
                <label>Write Your Blog Content * <span className="hint">Use the toolbar to format your text</span></label>

                <div className="editor-toolbar">
                  <button type="button" onClick={formatBold} className="toolbar-btn" title="Bold">
                    <strong>B</strong>
                  </button>
                  <button type="button" onClick={formatItalic} className="toolbar-btn" title="Italic">
                    <em>I</em>
                  </button>
                  <div className="toolbar-divider"></div>
                  <button type="button" onClick={formatHeading} className="toolbar-btn" title="Heading">
                    H1
                  </button>
                  <button type="button" onClick={formatSubheading} className="toolbar-btn" title="Subheading">
                    H2
                  </button>
                  <div className="toolbar-divider"></div>
                  <button type="button" onClick={formatBulletList} className="toolbar-btn" title="Bullet List">
                    &#8226; List
                  </button>
                  <button type="button" onClick={formatNumberedList} className="toolbar-btn" title="Numbered List">
                    1. List
                  </button>
                  <div className="toolbar-divider"></div>
                  <button type="button" onClick={triggerImageUpload} className="toolbar-btn toolbar-btn-image" title="Insert Image">
                    📷 Image
                  </button>
                  <button type="button" onClick={formatLink} className="toolbar-btn" title="Insert Link">
                    Link
                  </button>
                  <button type="button" onClick={formatQuote} className="toolbar-btn" title="Quote">
                    &ldquo; Quote
                  </button>
                </div>

                <input
                  type="file"
                  id="contentImages"
                  accept="image/*"
                  onChange={handleContentImageChange}
                  style={{ display: 'none' }}
                />

                <textarea
                  ref={textareaRef}
                  name="manualContent"
                  value={formData.manualContent}
                  onChange={handleInputChange}
                  required={formData.contentType === 'manual'}
                  rows={20}
                  className="rich-text-editor"
                  placeholder="Start writing your blog content here. Use the toolbar buttons above to format. Click the 📷 Image button to insert images at your cursor position..."
                />

                {contentImages.length > 0 && (
                  <div className="inline-images-preview">
                    <p className="preview-label">Inserted Images:</p>
                    <div className="content-images-grid">
                      {contentImages.map((img, index) => (
                        <div key={index} className="content-image-item">
                          <img src={img.preview} alt={`Image ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeContentImage(index)}
                            className="remove-image-btn"
                          >
                            Remove
                          </button>
                          <p className="image-filename">{img.file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
          {editingBlog && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting
              ? (editingBlog ? 'Updating Blog...' : 'Creating Blog...')
              : (editingBlog ? 'Update Blog Post' : 'Create Blog Post')
            }
          </button>
        </div>
      </form>
    </div>
  );
}
