// AdminDashboardHome.jsx
import React, { useState } from 'react';
import OrvlLeftNav from './OrvlLeftNav';
import AdminDashboardHeader from '../adminDashboardPages/AdminDashboardHeader.jsx';
import OrvlCourseCreation from './orvlCourseCreation.jsx';
import OrvlTopicCreation from './orvlTopicCreation.jsx';

import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import OrvlDashborad from './orvlDashborad.jsx';


export default function  OrvlDashboardHome() {
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
        return <OrvlDashborad/>
      case 'course-creation':
        return <OrvlCourseCreation/>
      case 'topic-creation':
        return <OrvlTopicCreation/>;
      default:
        return <OrvlDashborad />;
    }
  };

  return (
    <div >
      {/* Static Header */}
      <AdminDashboardHeader />
      
      <div className={styles.appLayout}>
        <OrvlLeftNav onMenuClick={handleMenuClick} activeComponent={activeComponent} />

        {/* Dynamic Main Content */}
        <div className={styles.mainContent}>
          {renderMainContent()} {/* Render dynamic content based on the selected component */}
        </div>
      </div>
    </div>
  );
}
