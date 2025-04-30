import React, { useEffect, useState } from 'react';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import { TbDeviceDesktopAnalytics } from 'react-icons/tb';  
import { FaTableList } from 'react-icons/fa6'; 
import { DiGhostSmall } from 'react-icons/di';
import { FaBars, FaTimes } from 'react-icons/fa'; 



const  OrvlLeftNav = ({ onMenuClick, activeComponent }) => {
    const [orvlLeftBarMenu,setOrvlLeftbarMenu] = useState()
   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth > 768) {
      setOrvlLeftbarMenu(true); // Always open sidebar in desktop
    } else {
      setOrvlLeftbarMenu(false); // Hide sidebar by default in mobile
    }
  };

  useEffect(() => {
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const orvlLeftBarToggleMenu=()=>{
    setOrvlLeftbarMenu(prev => !prev);
  }

  return (
    <div>
       <div className={styles.HamburgerHeader} onClick={orvlLeftBarToggleMenu}>
              {orvlLeftBarMenu ? <FaTimes/> : <FaBars />}
             </div>
             {orvlLeftBarMenu && (
    <div className={`${styles.sidebar} ${orvlLeftBarMenu ? styles.sidebarOpen :''}`}>
      <ul className={styles.sidebarMenu}>
        <li
          className={activeComponent === 'dashboard' ? styles.active : ''}
          onClick={() => onMenuClick('dashboard')}
        >
          <TbDeviceDesktopAnalytics className={styles.icon} />
          ORVL Dashboard 
        </li>
        <li
          className={activeComponent === 'course-creation' ? styles.active : ''}
          onClick={() => onMenuClick('course-creation')}
        >
          <FaTableList className={styles.icon} />
          ORVL Course Creation
        </li>
      
        <li
          className={activeComponent === 'topic-creation' ? styles.active : ''}
          onClick={() => onMenuClick('topic-creation')}
        >
          <DiGhostSmall className={styles.icon} />
          ORVL Topic Creation
        </li>
      
      </ul>
    </div>
    )}
    </div>
  );
};

export default React.memo( OrvlLeftNav);
