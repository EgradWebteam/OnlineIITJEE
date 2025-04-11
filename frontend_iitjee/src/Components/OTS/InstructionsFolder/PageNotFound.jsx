import React from 'react';
import pageNotfoundImg from "../../../assets/OTSTestInterfaceImages/NotFound.png"
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
const PageNotFound = () => {
  return (
    <div className={styles.pageNotFoundMaindiv}>
      <div className={styles.pagenotFoundImage}>
        <img src={pageNotfoundImg} alt='errorimage'/>
      </div>
      <div className={styles.pagenotfoundPARA}>
      <p className={styles.errorMSGPAGE}>Page Not Found</p>
      <p>The page you are looking for does not exist.</p>
      </div>
     
    </div>
  )
}

export default PageNotFound
