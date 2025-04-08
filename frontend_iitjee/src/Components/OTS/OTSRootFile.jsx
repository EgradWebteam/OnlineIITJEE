import React from 'react'
import styles from '../../Styles/OTSCSS/OTSMain.module.css';
import OTSHeader from './OTSHeaderFolder/OTSHeader';
import OTSNavbar from './OTSHeaderFolder/OTSNavbar';

export default function OTSRootFile() {
  return (
    <div className={styles.OTSRootMainContainer}>
      <OTSHeader/>
      <OTSNavbar/>
    </div>
  )
}
