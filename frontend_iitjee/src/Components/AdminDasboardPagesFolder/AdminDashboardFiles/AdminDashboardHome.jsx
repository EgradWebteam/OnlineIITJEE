// AdminDashboardHome.jsx
import React, { useState } from 'react';
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import AdminLeftSideBar from './AdminLeftSideBar.jsx';  
import AdminDashboardHeader from './AdminDashboardHeader.jsx'; 
import DashBoard from './DashBoard.jsx';
import CourseCreationTab from './CourseCreationTab.jsx';
import TestCreationTab from './TestCreationTab.jsx';
import DocumentUpload from '../AdminDashboardFiles/DocumentUpload.jsx';
import InstructionsTab from '../AdminDashboardFiles/InstructionsTab.jsx';

export default function AdminDashboardHome() {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashBoard />;
      case 'course-creation':
        return <CourseCreationTab  portalid={1}/>;
      case 'test-creation':
        return <TestCreationTab />;
      case 'document-upload':
        return <DocumentUpload />;
      case 'instruction':
        return <InstructionsTab />;
      default:
        return <DashBoard />;
    }
  };

  return (
    <div >
      {/* Static Header */}
      <AdminDashboardHeader />
      
      <div className={styles.appLayout}>
        {/* Static Sidebar */}
        <AdminLeftSideBar onMenuClick={handleMenuClick} activeComponent={activeComponent} />

        {/* Dynamic Main Content */}
        <div className={styles.mainContent}>
          {renderMainContent()} {/* Render dynamic content based on the selected component */}
        </div>
      </div>
    </div>
  );
}
