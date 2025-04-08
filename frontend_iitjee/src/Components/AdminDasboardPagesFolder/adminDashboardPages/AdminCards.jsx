import React from 'react'

const AdminCards = ({ icon, label, value }) => {
  console.log("AdminCards called")
  return (
    <div>
    <div className="icon-box">{icon}</div>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);
  
}

export default AdminCards
