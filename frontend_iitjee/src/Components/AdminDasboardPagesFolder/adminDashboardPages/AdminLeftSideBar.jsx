import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLeftSideBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li className={isActive('/admin/dashboard') ? 'active' : ''}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li className={isActive('/admin/course-creation') ? 'active' : ''}>
          <Link to="/CourseCreation">Course Creation</Link>
        </li>
        <li className={isActive('/admin/instruction') ? 'active' : ''}>
          <Link to="/admin/instruction">Instruction</Link>
        </li>
        <li className={isActive('/admin/test-creation') ? 'active' : ''}>
          <Link to="/admin/test-creation">Test Creation</Link>
        </li>
        <li className={isActive('/admin/document-upload') ? 'active' : ''}>
          <Link to="/admin/document-upload">Document Upload</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminLeftSideBar;
