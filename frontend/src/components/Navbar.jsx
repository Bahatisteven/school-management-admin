import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  CheckCircle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/teachers', label: 'Teachers', icon: GraduationCap, roles: ['admin'] },
    { path: '/classes', label: 'Classes', icon: BookOpen },
    { path: '/fees', label: 'Fees', icon: DollarSign, roles: ['admin'] },
    { path: '/verifications', label: 'Verifications', icon: CheckCircle, roles: ['admin'] },
  ].filter(link => !link.roles || link.roles.includes(user?.role));

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>📚</div>
            <h2 style={styles.logo}>School Management</h2>
          </div>
          
          <button 
            style={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div style={{
            ...styles.links,
            ...(mobileMenuOpen && styles.linksMobile)
          }}
          className={mobileMenuOpen ? 'nav-links-mobile' : 'nav-links'}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ 
                    ...styles.link, 
                    ...(isActive(link.path) && styles.activeLink) 
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div style={styles.userSection} className="user-section">
            <div style={styles.userInfo} className="user-info">
              <div style={styles.userAvatar}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div style={styles.userDetails} className="user-details">
                <span style={styles.userName}>{user?.firstName} {user?.lastName}</span>
                <span style={styles.userRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>
      <style jsx="true">{`
        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          .nav-links {
            display: none !important;
          }
          
          .nav-links-mobile {
            display: flex !important;
          }
          
          .user-details {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .user-info {
            gap: 8px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles = {
  nav: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    padding: '0',
    marginBottom: '0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    position: 'relative',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  logo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    whiteSpace: 'nowrap',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1f2937',
    padding: '8px',
  },
  links: {
    display: 'flex',
    gap: '6px',
    flex: 1,
    justifyContent: 'center',
  },
  linksMobile: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    gap: '4px',
    zIndex: 999,
  },
  link: {
    color: '#6b7280',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
  activeLink: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: '11px',
    color: '#6b7280',
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
  },
};

export default Navbar;
