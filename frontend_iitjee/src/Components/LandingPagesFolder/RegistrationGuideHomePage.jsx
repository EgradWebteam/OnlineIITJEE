import React, { lazy, memo, Suspense } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";

const LandingPageNavbar = lazy(() => import("./LandingPageNavbar.jsx"));
const CourseRegistrationGuide =lazy(() => import("./CourseRegistrationGuide.jsx"));
const MainHeader = lazy(() => import('../LandingPagesFolder/MainPageHeaderFooterFiles/MainHeader.jsx'));
const MainFooter = lazy(() => import('../LandingPagesFolder/MainPageHeaderFooterFiles/MainFooter.jsx'));
const RegistrationGuideHomePage = memo(() => {



  return (
    <div className={styles.otsAndOrvlHomePageMainDiv}>
      <div className={styles.otsAndOrvlHomePageSubDiv}>
        <Suspense >
          <MainHeader/>
          <LandingPageNavbar />
       <CourseRegistrationGuide/>
          <MainFooter/>
        </Suspense>
      </div>
    </div>
  )
});

export default RegistrationGuideHomePage;
