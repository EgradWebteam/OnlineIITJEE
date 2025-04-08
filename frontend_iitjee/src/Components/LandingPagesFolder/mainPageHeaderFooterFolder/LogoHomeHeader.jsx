import React from 'react'
import style from '../../../Styles/LandingPageCSS/LogoHomeHeader.module.css'
import LogoForHeader from '../../../assets/EGTLogoExamHeaderCompressed.jpg'
import { IoMdHome } from "react-icons/io";
import { Link } from 'react-router-dom';

const LogoHomeHeader = () => {
  return (
    <div className={style.LogoHomeHeaderPage}>
        <div className={style.LogoForHeader}>
        <img src={LogoForHeader} alt="imgsrc" />
        </div>
        <Link to="/">
        <div className={style.HomeIcon}>
              <IoMdHome />
            </div>
          </Link>
        </div>
     
  )
}

export default LogoHomeHeader