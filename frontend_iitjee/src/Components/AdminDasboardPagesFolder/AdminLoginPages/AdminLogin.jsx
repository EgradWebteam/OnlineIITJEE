import React from "react";
import Styles from "../../../Styles/AdminDashboardCSS/AdminLoginPage.module.css";
import AdminLoginPage from '../../LandingPagesFolder/mainPageHeaderFooterFolder/AdminLoginPage.jsx'
import MainHeader from "../../LandingPagesFolder/MainPageHeaderFooterFolder/mainHeader.jsx";
import MainFooter from "../../LandingPagesFolder/MainPageHeaderFooterFolder/mainFooter.jsx";

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
