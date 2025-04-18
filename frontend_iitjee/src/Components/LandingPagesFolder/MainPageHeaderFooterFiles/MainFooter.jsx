import React from "react";
import { Link } from "react-router-dom";
import Styles from "../../../Styles/LandingPageCSS/MainFooter.module.css";
import { IoCall } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { TbCircleLetterR } from "react-icons/tb";

 function MainFooter() {
  return (
    <div className={Styles.Footer_MainPage}>
      <div className={Styles.FooterContainer}>
        <ul className={Styles.Footer_TermsPolicy}>
          <div className={Styles.list_headingforfooter}>
            eGRADTutor
            <TbCircleLetterR />
          </div>
          <li><Link to="/FooterTermsAndConditions">Terms and Conditions</Link></li>
          <li><a>Privacy Policy</a></li>
          <li><a>Pricing & Refund Policy</a></li>
        </ul>
        <div className={Styles.Footer_contactDetails}>
          <div className={Styles.Footer_contactInfo}>
            <IoCall />
            +91-7993270532
          </div>
          <div className={Styles.Footer_contactInfo}>
            <IoIosMail />
            contact@egradtutor.in
          </div>
        </div>
        <ul className={Styles.Footer_AddressInfo}>
          <li className={Styles.list_headingforfooter}>Contact Us</li>
          <li className={Styles.list_heading}>Corporate Office</li>
          <li>eGRADTutor(eGATETutor Academy)</li>
          <li>R.K Nivas,2nd Floor,Shivam Road,</li>
          <li>New Nallakunta, Hyderabad - 500044.</li>
        </ul>
      </div>
      <div className={Styles.Footer_LastSection}>
        <div className={Styles.Footer_icons}>
          <div>
            <FaFacebook />
          </div>
          <div>
            <FaInstagram />
          </div>
          <div>
            <FaLinkedin />
          </div>
          <div>
            <FaYoutube />
          </div>
        </div>
        <p className={Styles.FooterCopyRights}>
          Copyright &copy; 2024 eGRADTutor. All rights reserved.
        </p>
      </div>
    </div>
  );
}
export default MainFooter;