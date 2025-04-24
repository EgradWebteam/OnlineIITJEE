import React from 'react'
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 

const AdminCards = ({ icon, label, value }) => {
  
  return (
    <div className={styles.statCard}>
    <div className={styles.iconBox}>{icon}</div>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);
  
}

export default AdminCards
