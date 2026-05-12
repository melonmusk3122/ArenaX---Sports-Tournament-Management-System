import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/teams', label: 'Teams', icon: '👥' },
  { path: '/matches', label: 'Matches', icon: '🏟️' },
  { path: '/match-history', label: 'History', icon: '📋' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarStyle = {
    position: 'fixed', top: 0, left: 0, bottom: 0,
    width: sidebarOpen ? 240 : 72, background: 'rgba(26,26,46,0.95)',
    backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(108,92,231,0.15)',
    display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease',
    zIndex: 100
  };

  const mainStyle = {
    marginLeft: sidebarOpen ? 240 : 72, minHeight: '100vh',
    background: '#0F0E17', padding: '32px', transition: 'margin-left 0.3s ease'
  };

  return (
    <div>
      <div style={sidebarStyle}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(108,92,231,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #6C5CE7, #00D2D3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ArenaX
            </motion.span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#8892B0', cursor: 'pointer', fontSize: 18, padding: 4 }}>
            {sidebarOpen ? '◁' : '▷'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ x: 4 }} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderRadius: 12, background: active ? 'rgba(108,92,231,0.2)' : 'transparent',
                  color: active ? '#6C5CE7' : '#8892B0', fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s ease', cursor: 'pointer'
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {sidebarOpen && <span style={{ fontSize: 14 }}>{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(108,92,231,0.15)' }}>
          {sidebarOpen && user && (
            <div style={{ marginBottom: 12, color: '#E8E8EE', fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{user.username || user.email}</div>
              <div style={{ color: '#8892B0', fontSize: 11 }}>{user.email}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px', background: 'rgba(253,114,114,0.1)',
            border: '1px solid rgba(253,114,114,0.3)', borderRadius: 8,
            color: '#FD7272', cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>
      <main style={mainStyle}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;