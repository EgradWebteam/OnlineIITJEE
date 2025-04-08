import React from 'react'

const AdminDashboardHeader = () => {
  console.log("AdminDashboardHeader")
  return (
    <div className="header">
    <div className="logo"></div>
    <div className="header-buttons">
      <button className="btn-blue">OTS Course Admin</button>
      <button>Profile</button>
      <button>Student Info</button>
      <button>LogOut</button>
    </div>
  </div>
  )
}

export default React.memo(AdminDashboardHeader)
