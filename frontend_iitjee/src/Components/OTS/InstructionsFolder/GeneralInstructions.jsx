import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decryptBatch as decryptDataBatch, encryptBatch } from '../../../utils/cryptoUtils.jsx'; // Batch API decryption
import { Intstruction_content } from './InstructionsData.js';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css"
import OTSHeader from '../OTSHeaderFolder/OTSHeader.jsx';
import {useStudent} from "../../../ContextFolder/StudentContext.jsx";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
const GeneralInstructions = () => {
    const { testId, studentId } = useParams();
    const navigate = useNavigate();

    const [realTestId, setRealTestId] = useState('');
    const [realStudentId, setRealStudentId] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(true);
    const { studentData} = useStudent();
  
    const userData = studentData?.userDetails;

    const studentName = userData?.candidate_name;
    const studentProfile = userData?.uploaded_photo;
    useEffect(() => {
        const token = sessionStorage.getItem("navigationToken");
    
        if (!token) {
          navigate("/Error");
          return;
        }
    
        const decryptParams = async () => {
          try {
            const encryptedParams = [decodeURIComponent(testId)];
            if (studentId) {
              encryptedParams.push(decodeURIComponent(studentId));
            }
    
            const decryptedValues = await decryptDataBatch(encryptedParams);
    
            if (!decryptedValues || decryptedValues.length === 0) {
              navigate("/Error");
              return;
            }
    
            setRealTestId(decryptedValues[0]);
            if (studentId) {
              setRealStudentId(decryptedValues[1]); // set only if it's student flow
            }
    
            setIsDecrypting(false);
          } catch (error) {
            console.error("Batch decryption error:", error);
            navigate("/Error");
          }
        };
    
        decryptParams();
      }, [testId, studentId, navigate]);


    if (isDecrypting) {
        return (
            <div>
                <h2>loading...</h2>
            </div>
        );
    }
    
      
    const handleNextClick = async () => {
        sessionStorage.setItem("navigationToken", "valid");
    
        try {
          const payload = studentId ? [realTestId, realStudentId] : [realTestId];
          const encryptedArray = await encryptBatch(payload);
    
          const encryptedTestId = encodeURIComponent(encryptedArray[0]);
    
          if (studentId) {
            const encryptedStudentId = encodeURIComponent(encryptedArray[1]);
            navigate(`/ExamInstructions/${encryptedTestId}/${encryptedStudentId}`);
          } else {
            navigate(`/ExamInstructions/${encryptedTestId}`);
          }
        } catch (error) {
          console.error("Encryption failed:", error);
          navigate("/Error");
        }
      };
      
    return (
        <div className={styles.InstrcutionMainDiv}>
            <div>
                <OTSHeader />
            </div>
            <div className={styles.instrcutionstudentProfileDiv}>
                <div className={styles.instructionSubdiv}>
                    <h1 className={styles.instrctionMianHeading}>Instrcuctions</h1>
                    <h2 >
                        {Intstruction_content[0].Intstruction_content_text_center}
                    </h2>

                    <div className={styles.instructionSection}>
                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_1}</h3>
                        <ul>
                            <li>
                                "Please note: If you open any other window, switch tabs, or
                                minimize this window during the exam, it will be
                                automatically terminated. Be careful while taking the exam!"
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_1}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_2}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_3}</li>
                            <div className={styles.tableOFbtns}>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotVisitedBehaviourBtns}`}>1</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p1}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.NotAnsweredBtnCls}`}>3</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p2}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnswerdBtnCls}`}>5</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p3}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.MarkedForReview}`}>7</span>
                                    </div>
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p4}</div>
                                </div>
                                <div className={styles.rowTableClass}>
                                    <div className={styles.displayIcon}>
                                        <span className={`${styles.functionimageCls} ${styles.AnsMarkedForReview}`}>9</span>
                                    </div >
                                    <div className={styles.forTotalWidth}>{Intstruction_content[0].Intstruction_content_points_p5}</div>
                                </div>
                            </div>
                            <li>{Intstruction_content[0].Intstruction_content_points_p}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_2}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_4}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_b}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_4_c}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_5}
                                <strong> {Intstruction_content[0].span_1} </strong>
                                {Intstruction_content[0].Intstruction_content_points_5__}
                            </li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_3}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_6}</li>
                            <ul>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_a}</li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_b}</li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_c}
                                    <strong> {Intstruction_content[0].span_2} </strong>
                                </li>
                                <li>
                                    {Intstruction_content[0].Intstruction_content_points_6_d}
                                    <strong> {Intstruction_content[0].span_3} </strong>
                                    {Intstruction_content[0].Intstruction_content_points_6_d__}
                                </li>
                                <li>{Intstruction_content[0].Intstruction_content_points_6_e}</li>
                            </ul>
                            <li>
                                {Intstruction_content[0].Intstruction_content_points_7}
                                <strong> {Intstruction_content[0].span_4} </strong>
                                {Intstruction_content[0].Intstruction_content_points_7__}
                            </li>
                            <li>{Intstruction_content[0].Intstruction_content_points_8}</li>
                        </ul>

                        <h3 className={styles.instructionHeading}>{Intstruction_content[0].Intstruction_content_text_subheading_4}</h3>
                        <ul>
                            <li>{Intstruction_content[0].Intstruction_content_points_9}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_10}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_11}</li>
                            <li>{Intstruction_content[0].Intstruction_content_points_12}</li>
                        </ul>
                    </div>

                </div>
                <div className={styles.userImageDivInst}>
                    <div className={styles.userDetailsHolder}>
                        <div className={styles.userImageSubDiv}>
                        
                                  <img
                          src={studentProfile || defaultImage}
                          alt="Student Profile"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                          }}
                        />
                        
                        </div>
                        <p>{studentName}</p>
                    </div>    
                </div>
            </div>
          
            <div className={styles.nextBtnDiv}>
                <button onClick={handleNextClick}>Next <span className={styles.nextBtnArrow}>&rarr;</span></button>
            </div>
        </div>

    );

};

export default GeneralInstructions;
