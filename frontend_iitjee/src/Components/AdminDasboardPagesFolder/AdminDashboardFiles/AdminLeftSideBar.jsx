import React, { useEffect, useState } from 'react';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import { TbDeviceDesktopAnalytics } from 'react-icons/tb'; 
import { FaTableList } from 'react-icons/fa6'; 
import { PiBookOpenTextFill } from 'react-icons/pi'; 
import { DiGhostSmall } from 'react-icons/di'; 
import { GrDocumentStore } from 'react-icons/gr'; 
import { FaBars, FaTimes } from 'react-icons/fa';



const AdminLeftSideBar = ({ onMenuClick, activeComponent }) => {
  const [leftBarMenu,setLeftbarMenu] = useState()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth > 768) {
      setLeftbarMenu(true); // Always open sidebar in desktop
    } else {
      setLeftbarMenu(false); // Hide sidebar by default in mobile
    }
  };

  useEffect(() => {
    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const leftBarToggleMenu=()=>{
    setLeftbarMenu(prev => !prev);
  }
  
  return (
    <div>
       <div className={styles.HamburgerHeader} onClick={leftBarToggleMenu}>
        {leftBarMenu ? <FaTimes/> : <FaBars />}
       </div>
      {leftBarMenu && ( 
    <div className={`${styles.sidebar} ${leftBarMenu ? styles.sidebarOpen : ''}`}>
      <ul className={styles.sidebarMenu}>
        <li
          className={activeComponent === 'dashboard' ? styles.active : ''}
          onClick={() => onMenuClick('dashboard') }
        >
          <TbDeviceDesktopAnalytics className={styles.icon} />
          Dashboard
        </li>
        <li
          className={activeComponent === 'course-creation' ? styles.active : ''}
          onClick={() => onMenuClick('course-creation')}
        >
          <FaTableList className={styles.icon} />
          Course Creation
        </li>
        <li
          className={activeComponent === 'instruction' ? styles.active : ''}
          onClick={() =>  onMenuClick('instruction')}
        >
          <PiBookOpenTextFill className={styles.icon} />
          Instruction
        </li>
        <li
          className={activeComponent === 'test-creation' ? styles.active : ''}
          onClick={() =>  onMenuClick('test-creation')}
        >
          <DiGhostSmall className={styles.icon} />
          Test Creation
        </li>
        <li
          className={activeComponent === 'document-upload' ? styles.active : ''}
          onClick={() =>  onMenuClick('document-upload')}
        >
          <GrDocumentStore className={styles.icon} />
          Document Upload
        </li>
      </ul>
    </div>
    )}
    </div>
  );
};

export default React.memo(AdminLeftSideBar);
