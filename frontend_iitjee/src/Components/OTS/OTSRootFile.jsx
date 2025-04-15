import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch } from '../../utils/cryptoUtils.jsx';
import styles from '../../Styles/OTSCSS/OTSMain.module.css';
import OTSHeader from './OTSHeaderFolder/OTSHeader.jsx';
import OTSNavbar from './OTSHeaderFolder/OTSNavbar.jsx';
import OTSMain from './OTSMainFolder/OTSMain.jsx';
import testData from '../StudentDashboardPagesFolder/JSON_Files/WithSections.json';

export default function OTSRootFile() {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState('');
  const [realStudentId, setRealStudentId] = useState('');
  const [testName, setTestName] = useState('');
  const [fullTestData, setFullTestData] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem("navigationToken");
    if (!token) {
      navigate("/Error");
      return;
    }

    const decryptParams = async () => {
      try {
        const [decryptedTestId, decryptedStudentId] = await decryptBatch([
          decodeURIComponent(testId),
          decodeURIComponent(studentId),
        ]);

        setRealTestId(decryptedTestId);
        setRealStudentId(decryptedStudentId);

        //  Keep decryption, but use static test data
        setFullTestData(testData);
        setTestName(testData.TestName || "Test");
      } catch (error) {
        console.error("Decryption failed:", error);
        navigate("/Error");
      }
    };

    decryptParams();
  }, [testId, studentId, navigate]);

  return (
    <div className={styles.OTSRootMainContainer}>
      <OTSHeader />
      <OTSNavbar testName={testName} />
      <OTSMain testData={fullTestData} />
    </div>
  );
}
