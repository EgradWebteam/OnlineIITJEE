import React from 'react'
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling

const AdminCards = ({ icon, label, value }) => {
  console.log("AdminCards called")
  return (
    <div className={styles.statCard}>
    <div className={styles.iconBox}>{icon}</div>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);
  
}

export default AdminCards
