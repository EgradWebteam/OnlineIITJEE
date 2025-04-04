import React from "react";
import Styles from "../../../Styles/AdminLogin.module.css";
import AdminLoginPage from '../../LandingPagesFolder/mainPageHeaderFooterFolder/AdminLoginPage.jsx'
import MainFooter from "../../LandingPagesFolder/mainPageHeaderFooterFolder/mainFooter.jsx";
import MainHeader from "../../LandingPagesFolder/mainPageHeaderFooterFolder/mainHeader.jsx";

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
