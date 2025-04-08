import React from 'react'
import AdminCards from './AdminCards'
import { FaBook, FaFileAlt, FaUserGraduate, FaQuestionCircle } from 'react-icons/fa';
const AdminDashboardMainContent = () => {
  return (
    <div className="dashboard-content">
    <h2 className="dashboard-title">DASHBOARD</h2>
    <div className="stat-grid">
      <AdminCards icon={<FaBook />} label="Total Courses" value="2" />
      <AdminCards icon={<FaFileAlt />} label="Total Tests" value="0" />
      <AdminCards icon={<FaUserGraduate />} label="User Registrations" value="30" />
      <AdminCards icon={<FaQuestionCircle />} label="Total Questions" value="126" />
    </div>
    </div>
  )
}

export default AdminDashboardMainContent
