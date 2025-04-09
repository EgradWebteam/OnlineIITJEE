// AdminDashboardHome.jsx
import React, { useState } from 'react';
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling
import AdminLeftSideBar from './AdminLeftSideBar';  // Static Sidebar
import AdminDashboardHeader from './AdminDashboardHeader'; // Static Header
import DashBoard from './DashBoard';
import CourseCreation from './CourseCreation';
import TestCreation from './TestCreation';
import DocumentUpload from './DocumentUpload';
import Instruction from './Instruction';

export default function AdminDashboardHome() {
  // State to track the selected component
  const [activeComponent, setActiveComponent] = useState('dashboard');

  // Function to handle menu item click
  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };

  // Function to render the appropriate component based on activeComponent state
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashBoard />;
      case 'course-creation':
        return <CourseCreation />;
      case 'test-creation':
        return <TestCreation />;
      case 'document-upload':
        return <DocumentUpload />;
      case 'instruction':
        return <Instruction />;
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
