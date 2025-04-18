import React from 'react';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import { TbDeviceDesktopAnalytics } from 'react-icons/tb'; 
import { FaTableList } from 'react-icons/fa6'; 
import { PiBookOpenTextFill } from 'react-icons/pi'; 
import { DiGhostSmall } from 'react-icons/di'; 
import { GrDocumentStore } from 'react-icons/gr'; 


const AdminLeftSideBar = ({ onMenuClick, activeComponent }) => {
  return (
    <div className={styles.sidebar}>
      <ul className={styles.sidebarMenu}>
        <li
          className={activeComponent === 'dashboard' ? styles.active : ''}
          onClick={() => onMenuClick('dashboard')}
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
          onClick={() => onMenuClick('instruction')}
        >
          <PiBookOpenTextFill className={styles.icon} />
          Instruction
        </li>
        <li
          className={activeComponent === 'test-creation' ? styles.active : ''}
          onClick={() => onMenuClick('test-creation')}
        >
          <DiGhostSmall className={styles.icon} />
          Test Creation
        </li>
        <li
          className={activeComponent === 'document-upload' ? styles.active : ''}
          onClick={() => onMenuClick('document-upload')}
        >
          <GrDocumentStore className={styles.icon} />
          Document Upload
        </li>
      </ul>
    </div>
  );
};

export default React.memo(AdminLeftSideBar);
