'use client';

import React, { useState, useEffect } from 'react';
import { BlogPost } from '@/app/blog/blogData';

interface BlogManagerProps {
  onEdit: (blog: BlogPost) => void;
}

export default function BlogManager({ onEdit }: BlogManagerProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blogs');
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${slug}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        alert('Blog deleted successfully!');
        fetchBlogs(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading blogs...</div>;
  }

  if (blogs.length === 0) {
    return (
      <div className="no-blogs">
        <p>No blog posts found. Create your first blog post above!</p>
      </div>
    );
  }

  return (
    <div className="blog-manager">
      <h2>Manage Existing Blogs</h2>
      <div className="blogs-list">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-item">
            <div className="blog-item-image">
              <img src={blog.image} alt={blog.title} />
            </div>
            <div className="blog-item-content">
              <h3>{blog.title}</h3>
              <p className="blog-meta">
                <span>{blog.category}</span> • <span>{blog.date}</span>
              </p>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-item-actions">
                <button
                  onClick={() => onEdit(blog)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog.slug)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
