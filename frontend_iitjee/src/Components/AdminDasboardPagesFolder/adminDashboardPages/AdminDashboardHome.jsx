import React from 'react'
import "../../../Styles/AdminDashboardCSS/AdminDashboard.css"
import AdminLeftSideBar from './AdminLeftSideBar'
import AdminDashboardHeader from './AdminDashboardHeader'
import AdminCards from './AdminCards'
import AdminDashboardMainContent from './AdminDashboardMainContent'
export default function AdminDashboardHome() {
  return (
    <div>
       <AdminDashboardHeader />
     <div className="app-layout">
      <AdminLeftSideBar />
      <div className="main-content">
       
        <AdminCards />
        <AdminDashboardMainContent />
      </div>
    </div>
    </div>
  )
}
