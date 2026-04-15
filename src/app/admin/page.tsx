'use client';

import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import BlogEditor from './components/BlogEditor';
import BlogManager from './components/BlogManager';
import { BlogPost } from '@/app/blog/blogData';
import './admin.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_token', token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_token');
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
  };

  React.useEffect(() => {
    // Restore session across page refreshes.
    // The token is validated server-side on every write request;
    // if it's expired the API returns 401 and the user re-logs in.
    if (sessionStorage.getItem('admin_token')) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Blog Admin — Building Approvals Dubai</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          {editingBlog ? 'Edit Blog' : 'Create New Blog'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('manage');
            setEditingBlog(null);
          }}
        >
          Manage Blogs
        </button>
      </div>

      {activeTab === 'create' ? (
        <BlogEditor editingBlog={editingBlog} onCancelEdit={handleCancelEdit} />
      ) : (
        <BlogManager onEdit={handleEdit} />
      )}
    </div>
  );
}
