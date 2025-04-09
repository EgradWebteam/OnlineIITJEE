import React from 'react'
import "../../../Styles/AdminDashboardCSS/AdminDashboard.css"
import AdminLeftSideBar from './AdminLeftSideBar.jsx'
import AdminDashboardHeader from './AdminDashboardHeader.jsx'
import AdminCards from './AdminCards.jsx'
import AdminDashboardMainContent from './AdminDashboardMainContent.jsx'
import CourseCreationTab from './CourseCreationTab.jsx'
export default function AdminDashboardHome() {
  return (
    <div>
       <AdminDashboardHeader />
     <div className="app-layout">
      <AdminLeftSideBar />
      <div className="main-content">
       
        {/* <AdminCards /> */}
        <CourseCreationTab/>
        {/* <AdminDashboardMainContent /> */}
      </div>
    </div>
    </div>
  )
}
