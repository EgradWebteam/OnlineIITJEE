import React,{useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css';
import headerImage from '../../../assets/EGTLogoExamHeaderCompressed.jpg';
 
const AdminDashboardHeader = () => {
  const location = useLocation();
 
  const isActive = (path) => location.pathname === path;
 
  return (
    <div className={styles.header}>
      {/* Logo/Header Image */}
      <div className={styles.headerImg}>
        <img src={headerImage} alt="Header Image" />
      </div>
 
      {/* Navigation Buttons */}
      <div className={styles.headerButtons}>
        <Link to="/AdminDashboard">
          <button className={isActive('/AdminDashboard') ? styles.active : ''}>
            OTS Course Admin
            {isActive('/AdminDashboard') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
        <Link to="/OrvlDashboard">
        <button className={isActive('/OrvlDashboard') ? styles.active : ''}>
            ORVL Course Admin
            {isActive('/OrvlDashboard') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <Link to="/AdminProfiler">
          <button className={isActive('/AdminProfiler') ? styles.active : ''}>
            Profile
            {isActive('/AdminProfiler') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <Link to="/StudentInfo">
          <button className={isActive('/StudentInfo') ? styles.active : ''}>
            Student Info
            {isActive('/StudentInfo') && <span className={styles.activeDot}></span>}
          </button>
        </Link>
 
        <button className={styles.logoutButton}>
          LogOut
        </button>
      </div>
    </div>
  );
};
 
export default React.memo(AdminDashboardHeader);