import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch as decryptDataBatch, encryptBatch } from '../../../utils/cryptoUtils.jsx';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import {useStudent} from "../../../ContextFolder/StudentContext.jsx";
import OTSHeader from '../OTSHeaderFolder/OTSHeader.jsx';
import logostudent from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import LoadingSpinner from '../../../ContextFolder/LoadingSpinner.jsx';
const ExamInstructions = () => {
  const { testId, studentId } = useParams();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(logostudent);
  const [realTestId, setRealTestId] = useState('');
  const [realStudentId, setRealStudentId] = useState('');
  const [instructionsData, setInstructionsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false); // 👈 Track checkbox
  const { studentData} = useStudent();

  const userData = studentData?.userDetails;
  const studentName = userData?.candidate_name;
  // useEffect(() => {
  //   const token = sessionStorage.getItem("navigationToken");
  //   if (!token) {
  //     navigate("/Error");
  //     return;
  //   }

  //   const decryptAndFetch = async () => {
  //     try {
  //       const [decryptedTestId, decryptedStudentId] = await decryptDataBatch([
  //         decodeURIComponent(testId),
  //         decodeURIComponent(studentId)
  //       ]);

  //       if (!decryptedTestId || !decryptedStudentId) {
  //         throw new Error("Decryption failed");
  //       }

  //       setRealTestId(decryptedTestId);
  //       setRealStudentId(decryptedStudentId);

  //       const response = await fetch(
  //         `${BASE_URL}/studentmycourses/instructions/${decryptedTestId}`
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch instructions");
  //       }

  //       const data = await response.json();
  //       setInstructionsData(data);
  //       setIsLoading(false);
  //     } catch (err) {
  //       console.error("Error:", err);
  //       navigate("/Error");
  //     }
  //   };

  //   decryptAndFetch();
  // }, [testId, studentId, navigate]);
  const AZURE_STORAGE_BASE_URL = `https://${import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${import.meta.env.VITE_AZURE_CONTAINER_NAME}`;
  const SAS_TOKEN = `?${import.meta.env.VITE_AZURE_SAS_TOKEN}`;
    useEffect(() => {
      if (userData?.uploaded_photo) {
        // Dynamically create the image URL
        const profileImageUrl = `${AZURE_STORAGE_BASE_URL}/${import.meta.env.VITE_AZURE_DOCUMENT_FOLDER}/${userData.uploaded_photo}${SAS_TOKEN}`;
        console.log("Generated Profile Image URL:", profileImageUrl); // Log the URL for debugging
  
        // Check if the URL is valid
        fetch(profileImageUrl, { method: 'HEAD' })
          .then((response) => {
            if (response.ok) {
              setStudentProfile(profileImageUrl); // Set the profile image if it's valid
            } else {
              console.error("Image URL is invalid or not accessible:", profileImageUrl);
            }
          })
          .catch((error) => {
            console.error("Error fetching the image URL:", error);
          });
      }
    }, [userData]);
  useEffect(() => {
    const token = sessionStorage.getItem("navigationToken");
    if (!token) {
      navigate("/Error");
      return;
    }

    const decryptAndFetch = async () => {
      try {
        let decryptedTestId = '';
        let decryptedStudentId = '';

        if (studentId) {
          const [testIdDecrypted, studentIdDecrypted] = await decryptDataBatch([
            decodeURIComponent(testId),
            decodeURIComponent(studentId),
          ]);
          decryptedTestId = testIdDecrypted;
          decryptedStudentId = studentIdDecrypted;
        } else {
          [decryptedTestId] = await decryptDataBatch([decodeURIComponent(testId)]);
        }

        setRealTestId(decryptedTestId);
        setRealStudentId(decryptedStudentId); // empty string if admin

        const response = await fetch(`${BASE_URL}/studentmycourses/instructions/${decryptedTestId}`);
        if (!response.ok) throw new Error("Failed to fetch instructions");

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
    return <div className={styles.loadingText}><LoadingSpinner/></div>;
  }


  const examName = instructionsData[0]?.exam_name || "Exam";
  const instructionPoints = instructionsData[0]?.instruction_points || [];

  // const handleBeginTest = async () => {
  //   //  Store token before navigation
  //   sessionStorage.setItem("navigationToken", "valid");
  //   try {
  //     const encrypted = await encryptBatch([realTestId, realStudentId]);
  //     const encryptedTestId = encodeURIComponent(encrypted[0]);
  //     const encryptedStudentId = encodeURIComponent(encrypted[1]);
  
  //     sessionStorage.setItem("navigationToken", "valid"); // Add session token
  //     navigate(`/OTSRootFile/${encryptedTestId}/${encryptedStudentId}`);
  //   } catch (error) {
  //     console.error("Encryption failed:", error);
  //     navigate("/Error");
  //   }
  // };
  
  const handleBeginTest = async () => {
    sessionStorage.setItem("navigationToken", "valid");

    try {
      const encrypted = studentId
        ? await encryptBatch([realTestId, realStudentId])
        : await encryptBatch([realTestId]);

      const encryptedTestId = encodeURIComponent(encrypted[0]);
      const encryptedStudentId = studentId ? encodeURIComponent(encrypted[1]) : null;

      const route = studentId
        ? `/OTSRootFile/${encryptedTestId}/${encryptedStudentId}`
        : `/OTSRootFile/${encryptedTestId}`; // <-- Use a route for admin preview

      navigate(route);
    } catch (error) {
      console.error("Encryption failed:", error);
      navigate("/Error");
    }
  };
  return (
    <div className={styles.examInstructionsContainer}>
       <div>
            <OTSHeader />
        </div>
      <div className={styles.instrcutionstudentProfileDiv}>
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

      <div className={styles.userImageDivInst}>
        <div className={styles.userDetailsHolder}>
          <div className={styles.userImageSubDiv}>
            <img src={studentProfile} alt='studentProfile' />
          </div>
          <p>{studentName}</p>
        </div>
      </div>
      </div>
      <div className={styles.termandConditionsMainDiv}>
      <div className={styles.termsandConditionsDiv}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={() => setAcceptedTerms(prev => !prev)}
        />
        <span className={styles.spanAccept}>I accept all terms & conditions</span>
      </div>

      <div className={styles.readytoBeginDiv}>
        <button className={styles.previuosBtn} onClick={() => navigate(-1)}>
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
    </div>
  );
};

export default ExamInstructions;
