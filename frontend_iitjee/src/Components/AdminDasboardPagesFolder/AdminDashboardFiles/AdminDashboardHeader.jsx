import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css';
import headerImage from '../../../assets/EGTLogoExamHeaderCompressed.png';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminDashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminPopup, setAdminPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const isActive = (path) => location.pathname === path;

  const confirmLogout = () => {
    localStorage.removeItem('adminInfo');
    window.location.replace('/AdminLoginPage');
  };

  const handleLogout = () => {
    setAdminPopup(true);
  };

  const handleResize = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    setMenuOpen(!mobile); // open menu on desktop, close on mobile
  };

  useEffect(() => {
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLinkClick = (targetPath) => {
    if (isMobile && location.pathname !== targetPath) {
      setMenuOpen(false);
    }
  };

  return (
    <div className={styles.header}>
      {/* Logo/Header Image */}
      <div className={styles.headerImg}>
        <img src={headerImage} alt="Header" />
      </div>

      {/* Hamburger Icon */}
      <div className={styles.HamburgerHeader} onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Buttons */}
      {menuOpen && (
        <div className={`${styles.headerButtons} ${menuOpen ? styles.showMenu : ''}`}>
          <Link to="/AdminDashboard" onClick={() => handleLinkClick('/AdminDashboard')}>
            <button className={isActive('/AdminDashboard') ? styles.active : ''}>
              OTS Course Admin
              {isActive('/AdminDashboard') && <span className={styles.activeDot}></span>}
            </button>
          </Link>

          <Link to="/OrvlDashboard" onClick={() => handleLinkClick('/OrvlDashboard')}>
            <button className={isActive('/OrvlDashboard') ? styles.active : ''}>
              ORVL Course Admin
              {isActive('/OrvlDashboard') && <span className={styles.activeDot}></span>}
            </button>
          </Link>

          <Link to="/AdminProfiler" onClick={() => handleLinkClick('/AdminProfiler')}>
            <button className={isActive('/AdminProfiler') ? styles.active : ''}>
              Admin Profile
              {isActive('/AdminProfiler') && <span className={styles.activeDot}></span>}
            </button>
          </Link>

          <Link to="/StudentInfo" onClick={() => handleLinkClick('/StudentInfo')}>
            <button className={isActive('/StudentInfo') ? styles.active : ''}>
              Student Info
              {isActive('/StudentInfo') && <span className={styles.activeDot}></span>}
            </button>
          </Link>

          <button onClick={handleLogout} className={styles.logoutButton}>
            LogOut
          </button>

          {/* Logout confirmation popup */}
          {adminPopup && (
            <div className={styles.adminLogoutPopup}>
              <div className={styles.adminPopupContent}>
                <p>Are you sure you want to logout?</p>
                <div className={styles.poupBtns}>
                  <button className={styles.adminYesBtn} onClick={confirmLogout}>
                    Yes
                  </button>
                  <button className={styles.adminNoBtn} onClick={() => setAdminPopup(false)}>
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminDashboardHeader);
