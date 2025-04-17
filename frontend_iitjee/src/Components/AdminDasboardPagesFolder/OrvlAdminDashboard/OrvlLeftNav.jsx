import React from 'react';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import { TbDeviceDesktopAnalytics } from 'react-icons/tb';  
import { FaTableList } from 'react-icons/fa6'; 
import { DiGhostSmall } from 'react-icons/di'; 



const  OrvlLeftNav = ({ onMenuClick, activeComponent }) => {
  return (
    <div className={styles.sidebar}>
      <ul className={styles.sidebarMenu}>
        <li
          className={activeComponent === 'dashboard' ? styles.active : ''}
          onClick={() => onMenuClick('dashboard')}
        >
          <TbDeviceDesktopAnalytics className={styles.icon} />
          orvl Dashboard
        </li>
        <li
          className={activeComponent === 'course-creation' ? styles.active : ''}
          onClick={() => onMenuClick('course-creation')}
        >
          <FaTableList className={styles.icon} />
           orvl Course Creation
        </li>
      
        <li
          className={activeComponent === 'topic-creation' ? styles.active : ''}
          onClick={() => onMenuClick('topic-creation')}
        >
          <DiGhostSmall className={styles.icon} />
           orvl Topic Creation
        </li>
      
      </ul>
    </div>
  );
};

export default React.memo( OrvlLeftNav);
