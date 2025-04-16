import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch } from '../../utils/cryptoUtils.jsx';
import styles from '../../Styles/OTSCSS/OTSMain.module.css';
import OTSHeader from './OTSHeaderFolder/OTSHeader.jsx';
import OTSNavbar from './OTSHeaderFolder/OTSNavbar.jsx';
import OTSMain from './OTSMainFolder/OTSMain.jsx';
// import testData from '../StudentDashboardPagesFolder/JSON_Files/WithSections.json';
import axios from 'axios'
import {BASE_URL} from '../../../apiConfig.js'

export default function OTSRootFile() {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState('');
  const [realStudentId, setRealStudentId] = useState('');
  // const [testName, setTestName] = useState('');
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
        // setFullTestData(testData);
        // setTestName(testData.TestName || "Test");
      } catch (error) {
        console.error("Decryption failed:", error);
        navigate("/Error");
      }
    };

    decryptParams();
  }, [testId, studentId, navigate]);


  
  const [testPaperData, setTestPaperData] = useState([]);
 
useEffect(() => {
  const fetchTestPaper = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/OTS/QuestionPaper/${realTestId}`);
      setTestPaperData(response.data);
    } catch (err) {
      console.error("Error fetching test paper:", err);
    }
  };

  fetchTestPaper();
}, [realTestId]);
console.log("testPaperData",testPaperData)

const testName = testPaperData.TestName
  return (
    <div className={styles.OTSRootMainContainer}>
      <OTSHeader />
      <OTSNavbar realTestId={realTestId} testName={testName} testData={testPaperData}/>
      <OTSMain testData={testPaperData} realStudentId={realStudentId} realTestId={realTestId} />
    </div>
  );
}
