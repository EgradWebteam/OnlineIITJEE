import React from 'react'
import OTSLogo from "../../../assets/EGTLogoExamHeaderCompressed.png";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css"

 const OTSHeader = () => {
  return (
    <div className={styles.OTSMainHeader}>
      <div className={styles.OTSlogoHolder}>
        <img src={OTSLogo} alt='OTSLogo'/>
      </div>
    </div>
  )
};

export default OTSHeader;
