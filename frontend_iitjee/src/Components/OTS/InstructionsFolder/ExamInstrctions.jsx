import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch as decryptDataBatch, encryptBatch } from '../../../utils/cryptoUtils.jsx';
import { BASE_URL } from '../../../../apiConfig';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

const ExamInstructions = () => {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();

  const [realTestId, setRealTestId] = useState('');
  const [realStudentId, setRealStudentId] = useState('');
  const [instructionsData, setInstructionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // 👈 Track checkbox

  useEffect(() => {
    const token = sessionStorage.getItem("navigationToken");
    if (!token) {
      navigate("/Error");
      return;
    }

    const decryptAndFetch = async () => {
      try {
        const [decryptedTestId, decryptedStudentId] = await decryptDataBatch([
          decodeURIComponent(testId),
          decodeURIComponent(studentId)
        ]);

        if (!decryptedTestId || !decryptedStudentId) {
          throw new Error("Decryption failed");
        }

        setRealTestId(decryptedTestId);
        setRealStudentId(decryptedStudentId);

        const response = await fetch(
          `${BASE_URL}/studentmycourses/instructions/${decryptedTestId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch instructions");
        }

        const data = await response.json();
        setInstructionsData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        navigate("/Error");
      }
    };

    decryptAndFetch();
  }, [testId, studentId, navigate]);

  if (isLoading) {
    return <div className={styles.loadingText}>Loading Exam Instructions...</div>;
  }


  const examName = instructionsData[0]?.exam_name || "Exam";
  const instructionPoints = instructionsData[0]?.instruction_points || [];

  const handleBeginTest = async () => {
    //  Store token before navigation
    sessionStorage.setItem("navigationToken", "valid");
    try {
      const encrypted = await encryptBatch([realTestId, realStudentId]);
      const encryptedTestId = encodeURIComponent(encrypted[0]);
      const encryptedStudentId = encodeURIComponent(encrypted[1]);
  
      sessionStorage.setItem("navigationToken", "valid"); // Add session token
      navigate(`/OTSRootFile/${encryptedTestId}/${encryptedStudentId}`);
    } catch (error) {
      console.error("Encryption failed:", error);
      navigate("/Error");
    }
  };
  
  return (
    <div className={styles.examInstructionsContainer}>
      <div className={styles.examinstructionSubdiv}>
        <h2 className={styles.instrctionMianHeading}>{examName}</h2>
        <ul className={styles.instructionList}>
          {instructionPoints.map((point, idx) => (
            <li key={idx} className={styles.instructionPointItem}>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.termsandConditionsDiv}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={() => setAcceptedTerms(prev => !prev)}
        />
        <span className={styles.spanAccept}>I accept all terms & conditions</span>
      </div>

      <div className={styles.readytoBeginDiv}>
        <button className={styles.previuosBtn}>
          <span className={styles.previosBtnArrow}>&lt;</span> Previous
        </button>
        <button
          className={`${styles.readyBeginBtn} ${!acceptedTerms ? styles.disabledBtn : ''}`}
          disabled={!acceptedTerms} //  Disable until accepted
          onClick={handleBeginTest}
        >
          I am ready to begin <span className={styles.nextBtnArrow}>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default ExamInstructions;
