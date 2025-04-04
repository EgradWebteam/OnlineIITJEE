import React, { lazy, memo, Suspense } from 'react'
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import { useLocation } from 'react-router-dom';
const LandingPageNavbar = lazy(() => import("./LandingPageNavbar.jsx"));
const OTSandORVLBannerComponent =lazy(() => import("./OTSandORVLBannerComponent.jsx"));
const OTSandORVLHomePage = memo(() => {
    const location = useLocation();

    // Determine the type based on the path
    const isOTS = location.pathname === "/OTSHomePage";
    const isORVL = location.pathname === "/ORVLHomePage";
  return (
    <div className={styles.otsAndOrvlHomePageMainDiv}>
      <div className={styles.otsAndOrvlHomePageSubDiv}>
        <Suspense fallback={<p>Loading Courses...</p>}>
          <LandingPageNavbar />
          <OTSandORVLBannerComponent /> {/* Banner will internally handle what to render */}
        </Suspense>
      </div>
    </div>
  )
});

export default OTSandORVLHomePage;
