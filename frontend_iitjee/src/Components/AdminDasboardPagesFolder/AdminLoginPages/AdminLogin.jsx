import React from "react";
import Styles from "../../../Styles/AdminDashboardCSS/AdminLogin.module.css";
import AdminLoginPage from './AdminLoginForm.jsx'
import MainHeader from "../../LandingPagesFolder/MainPageHeaderFooterFiles/MainHeader.jsx";
import MainFooter from "../../LandingPagesFolder/MainPageHeaderFooterFiles/MainFooter.jsx";


export default function AdminLogin() {
  return (
    <div className={Styles.AdminHomeLogin}>
      <div className={Styles.AdminMainHeader}>
        <MainHeader />
      </div>
      <div className={Styles.AdminAdminLoginPage}>
        <AdminLoginPage />
      </div>
      <div className={Styles.MainFooter}>
        <MainFooter />
      </div>
    </div>
  );
}
