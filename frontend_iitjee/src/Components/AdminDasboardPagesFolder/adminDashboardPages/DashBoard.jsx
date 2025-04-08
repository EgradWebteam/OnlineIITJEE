import React from 'react'
import AdminCards from './AdminCards'
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling

import { FaBook, FaFileAlt, FaUserGraduate, FaQuestionCircle } from 'react-icons/fa';
const DashBoard = () => {
    console.log("Dashboard called")
  return (
    <div className={styles.dashboardContent}>
    <div className={styles.dashboardTitle}>DASHBOARD</div>
    <div className={styles.statGrid}>
      <AdminCards icon={<FaBook />} label="Total Courses" value="0" />
      <AdminCards icon={<FaFileAlt />} label="Total Tests" value="0" />
      <AdminCards icon={<FaUserGraduate />} label="User Registrations" value="0" />
      <AdminCards icon={<FaQuestionCircle />} label="Total Questions" value="0" />
    </div>
    </div>
  )
}

export default DashBoard
