import React, { useEffect, useState } from 'react';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css';
import headerImage from '../../../assets/EGTLogoExamHeaderCompressed.png';
import { FaBars, FaTimes } from 'react-icons/fa';
 
const AdminDashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
   
  const isActive = (path) => location.pathname === path;
  const handleLogout = async () => {
       localStorage.removeItem('adminInfo');
      navigate('/AdminLoginPage');
  }
  
   const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenuOpen(true); // Always open sidebar in desktop
      } else {
        setMenuOpen(false); // Hide sidebar by default in mobile
      }
    };
  
    useEffect(() => {
      handleResize(); // Run once on mount
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
  const toggleMenu=()=>{
setMenuOpen(prev => !prev)
  }
  const closeMenu=()=>{
    setMenuOpen(false)
  }
  return (
    <div className={styles.header}>
      {/* Logo/Header Image */}
      <div className={styles.headerImg}>
        <img src={headerImage} alt="Header Image" />
      </div>

 <div className={styles.HamburgerHeader} onClick={toggleMenu}>
  {menuOpen ? <FaTimes/> : <FaBars />}
 </div>

      {/* Navigation Buttons */}
      {menuOpen && (
      <div className={`${styles.headerButtons} ${menuOpen ? styles.showMenu : ""} `}>
        <Link to="/AdminDashboard" onClick={closeMenu}>
          <button className={isActive('/AdminDashboard') ? styles.active : ''}>
            OTS Course Admin
            {isActive('/AdminDashboard') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
        <Link to="/OrvlDashboard" onClick={closeMenu}>
        <button className={isActive('/OrvlDashboard') ? styles.active : ''}>
            ORVL Course Admin
            {isActive('/OrvlDashboard') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <Link to="/AdminProfiler" onClick={closeMenu}>
          <button className={isActive('/AdminProfiler') ? styles.active : ''}>
            Profile
            {isActive('/AdminProfiler') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <Link to="/StudentInfo" onClick={closeMenu}>
          <button className={isActive('/StudentInfo') ? styles.active : ''}>
            Student Info
            {isActive('/StudentInfo') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <button  onClick={()=>{handleLogout(); closeMenu()}} className={styles.logoutButton}>
          LogOut
        </button>
      </div>
      )}
    </div>
  );
};
 
export default React.memo(AdminDashboardHeader);