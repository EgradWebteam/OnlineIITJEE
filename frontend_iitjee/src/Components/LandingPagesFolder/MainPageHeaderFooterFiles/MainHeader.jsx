import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import Styles from "../../../Styles/LandingPageCSS/MainHeader.module.css";
import logoImg from "../../../assets/EGTLogoExamHeaderCompressed.png";

export default function MainHeader() {

  const handleLoginClick = () => {
    setIsForgotPassword(false);
    setIsResetPassword(false);
  };

  return (
    <div className={Styles.Header_MainPage}>
      <div className={Styles.Header_container}>

        <div className={Styles.Header_Logo}>
          <img src={logoImg} alt="EGT Logo" />
        </div>

        <div className={Styles.Header_logins_icons}>
          <Link to="/LoginPage" onClick={handleLoginClick} className={Styles.Header_Login}>
            Login
          </Link>

          <Link to="/" className={Styles.Header_icons}>
            <IoMdHome />
          </Link>

          <Link to="/ContactUs" className={Styles.Header_icons}>
            <IoCall />
          </Link>
        </div>
      </div>
    </div>
  );
}
