// AdminLeftSideBar.jsx
import React from 'react';

const AdminLeftSideBar = ({ onMenuClick, activeComponent }) => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li
          className={activeComponent === 'dashboard' ? 'active' : ''}
          onClick={() => onMenuClick('dashboard')}
        >
          Dashboard
        </li>
        <li
          className={activeComponent === 'course-creation' ? 'active' : ''}
          onClick={() => onMenuClick('course-creation')}
        >
          Course Creation
        </li>
        <li
          className={activeComponent === 'instruction' ? 'active' : ''}
          onClick={() => onMenuClick('instruction')}
        >
          Instruction
        </li>
        <li
          className={activeComponent === 'test-creation' ? 'active' : ''}
          onClick={() => onMenuClick('test-creation')}
        >
          Test Creation
        </li>
        <li
          className={activeComponent === 'document-upload' ? 'active' : ''}
          onClick={() => onMenuClick('document-upload')}
        >
          Document Upload
        </li>
      </ul>
    </div>
  );
};

export default React.memo(AdminLeftSideBar);
