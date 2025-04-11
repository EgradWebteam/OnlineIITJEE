import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch as decryptDataBatch } from '../../../utils/cryptoUtils.jsx';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

const ExamInstrctions = () => {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState('');
  const [realStudentId, setRealStudentId] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(true);

  useEffect(() => {
    try {
      const decodedTestId = decodeURIComponent(testId);
      const decodedStudentId = decodeURIComponent(studentId);

      const { decryptedTestId, decryptedStudentId } = decryptDataBatch(decodedTestId, decodedStudentId);

      setRealTestId(decryptedTestId);
      setRealStudentId(decryptedStudentId);
      setIsDecrypting(false);
    } catch (error) {
      console.error("Decryption failed:", error);
      navigate("/Error"); // Or a custom error page
    }
  }, [testId, studentId, navigate]);

  if (isDecrypting) {
    return <div className={styles.loadingText}>Decrypting exam data...</div>;
  }

  return (
    <div className={styles.examInstructionsContainer}>
      <h1 className={styles.heading}>Exam Instructions</h1>
      <p>Decrypted Test ID: {realTestId}</p>
      <p>Decrypted Student ID: {realStudentId}</p>

      {/* You can now use these IDs for further logic like fetching instructions from API */}
    </div>
  );
};

export default ExamInstrctions;
