import React from "react";
import Styles from "../../../Styles/LandingPageCSS/MainHeader.module.css";
import { IoMdHome } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import logoImg from "../../../assets/EGTLogoExamHeaderCompressed.jpg";
import { Link } from "react-router-dom";

export default function MainHeader() {
  return (
    <div className={Styles.Header_MainPage}>
      <div className={Styles.Header_container}>
        <div className={Styles.Header_Logo}>
          <img src={logoImg} alt="logoImg" />
        </div>
        <div className={Styles.Header_logins_icons}>
      <Link to="/LoginPage" ><div className={Styles.Header_Login}>Login</div></Link>
         <Link to='/'> <div className={Styles.Header_icons}>
          <IoMdHome />
          </div>
          </Link>
          <div className={Styles.Header_icons}>
           <IoCall />
          </div>
        </div>
      </div>
    </div>
  );
}
