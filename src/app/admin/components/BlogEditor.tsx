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
    contentType: 'manual' as 'file' | 'manual',
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
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const titleRef = React.useRef<HTMLTextAreaElement>(null);

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

      fetch(`/api/admin/blogs/${editingBlog.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.blog && data.blog.contentFile) {
            const content = extractContentFromComponent(data.blog.contentFile);
            setFormData(prev => ({ ...prev, manualContent: content }));
          }
        });
    }
  }, [editingBlog]);

  const extractContentFromComponent = (componentStr: string): string => {
    let content = componentStr;
    content = content.replace(/import.*?;\n/g, '');
    content = content.replace(/export default function.*?\(\)\s*\{/g, '');
    content = content.replace(/return\s*\(/g, '');
    content = content.replace(/<>|<\/>/g, '');
    content = content.replace(/\s*\}\s*$/g, '');
    content = content.replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n## $1\n');
    content = content.replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n### $1\n');
    content = content.replace(/<p[^>]*>(.*?)<\/p>/g, (match, text) => '\n' + text + '\n');
    content = content.replace(/<ul[^>]*>(.*?)<\/ul>/g, (match, items) => items);
    content = content.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n');
    content = content.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
    content = content.replace(/<[^>]*>/g, '');
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

      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const beforeText = formData.manualContent.substring(0, start);
        const afterText = formData.manualContent.substring(start);
        const imagePlaceholder = `\n![Image ${newImageIndex + 1}](image_${newImageIndex})\n`;
        const newText = beforeText + imagePlaceholder + afterText;
        setFormData(prev => ({ ...prev, manualContent: newText }));
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
  const formatDivider = () => insertFormatting('\n---\n', '');

  const triggerImageUpload = () => {
    document.getElementById('contentImages')?.click();
  };

  const triggerCoverUpload = () => {
    document.getElementById('coverImage')?.click();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, title: value }));

    // Auto-resize title textarea
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }

    // Auto-generate slug
    if (!editingBlog) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      if (editingBlog) {
        data.append('originalSlug', editingBlog.slug);
        data.append('isEditing', 'true');
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && typeof value !== 'object') {
          data.append(key, value.toString());
        }
      });

      if (formData.cardImage) data.append('cardImage', formData.cardImage);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);
      if (formData.contentFile) data.append('contentFile', formData.contentFile);

      if (editingBlog && !formData.cardImage) {
        data.append('existingCardImage', editingBlog.image);
      }
      if (editingBlog && !formData.coverImage && editingBlog.coverImage) {
        data.append('existingCoverImage', editingBlog.coverImage);
      }

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

        setFormData({
          title: '',
          slug: '',
          category: '',
          author: 'Building Approvals Dubai',
          excerpt: '',
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
        setPreviews({ cardImage: '', coverImage: '' });
        setContentImages([]);

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
    <div className="linkedin-editor">
      <form onSubmit={handleSubmit}>
        {/* Header with actions */}
        <div className="editor-header">
          <div className="editor-header-left">
            <span className="editor-brand">Building Approvals</span>
            <span className="editor-type">Article</span>
          </div>
          <div className="editor-header-right">
            <button
              type="button"
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </button>
            {editingBlog && onCancelEdit && (
              <button type="button" onClick={onCancelEdit} className="cancel-btn-header" disabled={isSubmitting}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSubmitting} className="publish-btn">
              {isSubmitting ? 'Publishing...' : (editingBlog ? 'Update' : 'Publish')}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-grid">
              <div className="settings-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Dubai Municipality"
                />
              </div>
              <div className="settings-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>
              <div className="settings-group">
                <label>URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="blog-url-slug"
                />
              </div>
              <div className="settings-group full-width">
                <label>Excerpt (Summary for blog list)</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Brief description shown on blog cards"
                />
              </div>
              <div className="settings-group">
                <label>Card Image (for blog list)</label>
                <input
                  type="file"
                  id="cardImage"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cardImage')}
                  style={{ display: 'none' }}
                />
                <button type="button" className="upload-btn-small" onClick={() => document.getElementById('cardImage')?.click()}>
                  {formData.cardImage ? formData.cardImage.name : 'Choose Card Image'}
                </button>
                {previews.cardImage && (
                  <div className="small-preview">
                    <img src={previews.cardImage} alt="Card preview" />
                  </div>
                )}
              </div>
              <div className="settings-group">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="manualSEO"
                    checked={formData.manualSEO}
                    onChange={handleInputChange}
                  />
                  Custom SEO Settings
                </label>
              </div>
              {formData.manualSEO && (
                <>
                  <div className="settings-group full-width">
                    <label>Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      placeholder="SEO title for search results"
                    />
                  </div>
                  <div className="settings-group full-width">
                    <label>Meta Description</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={2}
                      placeholder="SEO description for search snippets"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Focus Keyword</label>
                    <input
                      type="text"
                      name="focusKeyword"
                      value={formData.focusKeyword}
                      onChange={handleInputChange}
                      placeholder="Main keyword"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Keywords (comma separated)</label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2"
                    />
                  </div>
                </>
              )}
              <div className="settings-group full-width">
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={formData.contentType === 'file'}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.checked ? 'file' : 'manual' }))}
                  />
                  Upload Document (PDF/DOCX) instead of writing manually
                </label>
                {formData.contentType === 'file' && (
                  <div className="file-upload-inline">
                    <input
                      type="file"
                      id="contentFile"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'contentFile')}
                      style={{ display: 'none' }}
                    />
                    <button type="button" className="upload-btn-small" onClick={() => document.getElementById('contentFile')?.click()}>
                      {formData.contentFile ? formData.contentFile.name : 'Choose Content File'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="editor-main">
          {/* Cover Image Area */}
          <div
            className={`cover-upload-area ${previews.coverImage ? 'has-image' : ''}`}
            onClick={triggerCoverUpload}
          >
            {previews.coverImage ? (
              <div className="cover-preview">
                <img src={previews.coverImage} alt="Cover" />
                <div className="cover-overlay">
                  <span>Click to change cover image</span>
                </div>
              </div>
            ) : (
              <div className="cover-placeholder">
                <div className="cover-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="cover-text">Add a cover image or video to your article</p>
                <button type="button" className="cover-btn">Upload from computer</button>
              </div>
            )}
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage')}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title Input */}
          <div className="title-area">
            <textarea
              ref={titleRef}
              className="title-input"
              placeholder="Title"
              value={formData.title}
              onChange={handleTitleChange}
              rows={1}
            />
          </div>

          {/* Content Area */}
          {formData.contentType === 'manual' && (
            <div className="content-area">
              <textarea
                ref={textareaRef}
                className="content-input"
                placeholder="Write here. You can also include @mentions."
                value={formData.manualContent}
                onChange={(e) => setFormData(prev => ({ ...prev, manualContent: e.target.value }))}
              />

              {/* Formatting Toolbar - Floating */}
              <div className="floating-toolbar">
                <button type="button" onClick={formatBold} className="toolbar-icon" title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={formatItalic} className="toolbar-icon" title="Italic">
                  <em>I</em>
                </button>
                <span className="toolbar-sep"></span>
                <button type="button" onClick={formatBulletList} className="toolbar-icon" title="Bullet List">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="4" cy="6" r="2"/>
                    <circle cx="4" cy="12" r="2"/>
                    <circle cx="4" cy="18" r="2"/>
                    <rect x="9" y="5" width="12" height="2"/>
                    <rect x="9" y="11" width="12" height="2"/>
                    <rect x="9" y="17" width="12" height="2"/>
                  </svg>
                </button>
                <button type="button" onClick={formatNumberedList} className="toolbar-icon" title="Numbered List">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <text x="2" y="8" fontSize="8" fontWeight="bold">1</text>
                    <text x="2" y="14" fontSize="8" fontWeight="bold">2</text>
                    <text x="2" y="20" fontSize="8" fontWeight="bold">3</text>
                    <rect x="9" y="5" width="12" height="2"/>
                    <rect x="9" y="11" width="12" height="2"/>
                    <rect x="9" y="17" width="12" height="2"/>
                  </svg>
                </button>
                <span className="toolbar-sep"></span>
                <button type="button" onClick={formatQuote} className="toolbar-icon" title="Quote">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                  </svg>
                </button>
                <button type="button" onClick={formatHeading} className="toolbar-icon toolbar-text" title="Heading">
                  { }
                </button>
                <span className="toolbar-sep"></span>
                <button type="button" onClick={formatDivider} className="toolbar-icon" title="Divider">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="11" width="18" height="2"/>
                  </svg>
                </button>
                <button type="button" onClick={formatLink} className="toolbar-icon" title="Link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </button>
                <button type="button" onClick={triggerImageUpload} className="toolbar-icon" title="Insert Image">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
              </div>

              <input
                type="file"
                id="contentImages"
                accept="image/*"
                onChange={handleContentImageChange}
                style={{ display: 'none' }}
              />

              {contentImages.length > 0 && (
                <div className="inserted-images">
                  <p className="inserted-label">Inserted Images:</p>
                  <div className="inserted-grid">
                    {contentImages.map((img, index) => (
                      <div key={index} className="inserted-item">
                        <img src={img.preview} alt={`Image ${index + 1}`} />
                        <button type="button" onClick={() => removeContentImage(index)} className="remove-btn">
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.contentType === 'file' && (
            <div className="file-upload-notice">
              <p>Content will be extracted from the uploaded document.</p>
              <p>Go to <strong>Settings</strong> above to select your PDF or DOCX file.</p>
            </div>
          )}
        </div>

        {/* Draft indicator */}
        <div className="draft-indicator">
          <span className="draft-dot"></span>
          Draft
        </div>
      </form>
    </div>
  );
}
