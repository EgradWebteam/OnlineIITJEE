import React from "react";
import Styles from "../../../Styles/MainHeader.module.css";
import { IoMdHome } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import logoImg from "../../../assets/EGTLogoExamHeaderCompressed.jpg";

export default function MainHeader() {
  return (
    <div className={Styles.Header_MainPage}>
      <div className={Styles.Header_container}>
        <div className={Styles.Header_Logo}>
          <img src={logoImg} alt="logoImg" />
        </div>
        <div className={Styles.Header_logins_icons}>
          <div className={Styles.Header_Login}>Login</div>
          <div className={Styles.Header_icons}>
            <IoMdHome />
          </div>
          <div className={Styles.Header_icons}>
           <IoCall />
          </div>
        </div>
      </div>
    </div>
  );
}
