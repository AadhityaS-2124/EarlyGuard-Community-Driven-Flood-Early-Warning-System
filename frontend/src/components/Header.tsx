import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  
  // Function to determine if a link is active
  const isActive = (path: string) => location.pathname === path;
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <img src="/logo.svg" alt="EarlyGuard Logo" />
            <span>EarlyGuard</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
          <Link to="/report" className={isActive('/report') ? 'active' : ''}>Report Incident</Link>
          <Link to="/alerts" className={isActive('/alerts') ? 'active' : ''}>Alerts</Link>
          
          {/* Authentication links */}
          {isAuthenticated ? (
            <div className="auth-links">
              <span className="user-greeting">
                Hello, {currentUser?.displayName?.split(' ')[0] || 'User'}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 