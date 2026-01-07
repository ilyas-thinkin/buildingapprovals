'use client';

import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import BlogEditor from './components/BlogEditor';
import './admin.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <BlogEditor />
    </div>
  );
}
