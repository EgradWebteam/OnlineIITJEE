// AdminDashboardMainContent.jsx
import React from 'react';
import DashBoard from './DashBoard';
import CourseCreation from './CourseCreation.jsx';
import TestCreationTab from './TestCreationTab.jsx';
import DocumentUpload from './DocumentUpload.jsx';
import InstructionsTab from './InstructionsTab.jsx';

const AdminDashboardMainContent = ({ activeComponent }) => {
  console.log("AdminDashboardMainContent")
  console.log("activeComponent", activeComponent)
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashBoard />;
      case 'course-creation':
        return <CourseCreation />;
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
    <div className="main-content">
      {renderMainContent()}
    </div>
  );
};

export default AdminDashboardMainContent;
