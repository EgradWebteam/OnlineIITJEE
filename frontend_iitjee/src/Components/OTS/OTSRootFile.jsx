import React, { useEffect, useState } from 'react'
import styles from '../../Styles/OTSCSS/OTSMain.module.css';
import OTSHeader from './OTSHeaderFolder/OTSHeader.jsx';
import OTSNavbar from './OTSHeaderFolder/OTSNavbar.jsx';
import testData from '../StudentDashboardPagesFolder/JSON_Files/WithSections.json';
import OTSMain from './OTSMainFolder/OTSMain.jsx';

export default function OTSRootFile() {
  const [fullTestData, setFullTestData] = useState({});

  // UseEffect to store data only once
  useEffect(() => {
    setFullTestData(testData);
  }, []);

  //  Logic: Extract Test Name safely from any JSON shape
  const getTestName = () => {
    return fullTestData?.TestName || "Test Name Not Available";
  };
  console.log("test data",fullTestData);

  return (
    <div className={styles.OTSRootMainContainer}>
      <OTSHeader/>
      <OTSNavbar testName={getTestName()}/>
      <OTSMain testData={fullTestData} />
    </div>
  )
}
