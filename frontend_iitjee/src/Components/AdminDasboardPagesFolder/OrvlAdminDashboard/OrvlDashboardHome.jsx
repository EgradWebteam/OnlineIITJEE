// AdminDashboardHome.jsx
import React, { useState } from 'react';
import OrvlLeftNav from './OrvlLeftNav';
import AdminDashboardHeader from '../AdminDashboardFiles/AdminDashboardHeader.jsx';
import OrvlCourseCreation from './OrvlCourseCreation.jsx';
import OrvlTopicCreation from './OrvlTopicCreation.jsx';

import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import OrvlDashborad from './OrvlDashborad.jsx';


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
        return <OrvlCourseCreation portalid={3}/>
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
