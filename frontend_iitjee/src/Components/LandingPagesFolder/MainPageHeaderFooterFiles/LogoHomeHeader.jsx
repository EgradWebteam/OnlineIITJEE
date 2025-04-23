import React from 'react'
import style from '../../../Styles/LandingPageCSS/LogoHomeHeader.module.css'
import LogoForHeader from '../../../assets/EGTLogoExamHeaderCompressed.png'
import { IoMdHome } from "react-icons/io";
import { Link } from 'react-router-dom';

const LogoHomeHeader = () => {
  return (
    <div className={style.LogoHomeHeaderPage}>
        <div className={style.LogoForHeader}>
        <img src={LogoForHeader} alt="imgsrc" />
        </div>
            <div className={style.Header_logins_icons}>
                  <Link to="/LoginPage">
                    <div className={style.Header_Login}>Login</div>
                  </Link>
        <Link to="/">
        <div className={style.HomeIcon}>
              <IoMdHome />
            </div>
          </Link>
          </div>
        </div>
     
  )
}

export default LogoHomeHeader