import React, { Suspense, lazy } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import LandingPageNavbar from './LandingPageNavbar.jsx';
import portalImage from "../../assets/HomePageBanner.png"
const MainPageCourseCards = lazy(() => import("./MainPageCourseCards.jsx"));
import MainHeader from './MainPageHeaderFooterFiles/MainHeader.jsx';
import MainFooter from './MainPageHeaderFooterFiles/MainFooter.jsx';
export default function LandingPageIITJEE() {
  return (
    <div className={styles.homePageMainContainer}>
      <div className={styles.homePageSubContainer}>
        <MainHeader/>
        <LandingPageNavbar/>
        <div className={styles.bannerImage}>
          <img src={portalImage} alt='portalimage'/>
        </div>
        <div className={styles.exploreCoursesHeader}>
          <h3>Explore Online Courses</h3>
        </div>
        <div>
          <Suspense fallback={<p>Loading Courses...</p>}>
            <MainPageCourseCards />
          </Suspense>
        </div>
        <MainFooter/>
      </div>
    
    </div>
  )
}
