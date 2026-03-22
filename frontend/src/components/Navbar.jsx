import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Students' },
    { path: '/teachers', label: 'Teachers' },
    { path: '/classes', label: 'Classes' },
    { path: '/fees', label: 'Fees' },
    { path: '/verifications', label: 'Verifications' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <h2 style={styles.logo}>Admin Portal</h2>
        <div style={styles.links}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ ...styles.link, ...(isActive(link.path) && styles.activeLink) }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={styles.userSection}>
          <span style={styles.username}>{user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1f2937',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    margin: 0,
  },
  links: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    transition: 'all 0.3s',
    fontSize: '14px',
  },
  activeLink: {
    background: '#374151',
    color: 'white',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  username: {
    fontSize: '14px',
  },
};

export default Navbar;
