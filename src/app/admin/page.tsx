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

  const handleLogin = (username: string, password: string) => {
    // Simple authentication - in production, use better security
    if (username === 'buildingapprovals_admin' && password === 'BuildingApprovals123#') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingBlog(null);
  };

  // Check session on mount
  React.useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Blog Admin Panel</h1>
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
