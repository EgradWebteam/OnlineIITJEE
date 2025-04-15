import React, { useEffect, useState } from 'react'
import AdminLogo from '../../../assets/logoCap.jpeg'
 import style from './../../../Styles/AdminDashboardCSS/AdminProfier.module.css'
import AdminDashboardHeader from './AdminDashboardHeader'
 
const AdminProfile = () => {
  const [adminInfo, setAdminInfo] = useState({});
  useEffect(() => {
    const storedData = localStorage.getItem("adminInfo");
    if (storedData) {
      setAdminInfo(JSON.parse(storedData));
    }
  }, []);
  return (
    <div className={style.AdminProfileHomePageConatiner}>
        <AdminDashboardHeader />
        <div className={style.AdminProfilePage}>
        <div className={style.AdminProfileHeader}>
           Admin Profile
        </div>
        <div className={style.AdminPRofileContainer}>
        <div className={style.AdminLogo}>
<img src={AdminLogo} />
        </div>
        <div className={style.AdminInfo}>
        <div><b>Name :</b> {adminInfo.adminName}</div>
        <div><b>Email :</b> {adminInfo.adminEmail}</div>
        </div>
        </div>
        </div>
    </div>
  )
}
 
export default AdminProfile