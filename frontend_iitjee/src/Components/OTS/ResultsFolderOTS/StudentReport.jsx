import React, { useEffect } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { useParams } from 'react-router-dom';

const StudentReport = () => {
  const { testCreationId } = useParams();

  useEffect(() => {
    console.log("testCreationId from URL:", testCreationId);
    // Fetch report based on testCreationId
  }, [testCreationId]);
  return (
    <div className={styles.studentPerformanceReportMain}>
      <div className={styles.AIRholderDiv}>
        <div className={styles.airRankSubDiv}>
            AIR: <b>..</b>
        </div>
        <div className={styles.timeSpentContainer}> 
            <p className={styles.timeProgressPara}>Time Progress</p>
            <div className={styles.timeProgressContainer}>
                <div className={styles.timeLeftContainer}>
                  <p className={styles.timeLeftData}>..</p>
                    <p className={styles.timeLeftSpentPara}>
                        <span className={styles.timeLeftIcon}></span>
                        <span>Time Left</span>
                    </p>
                </div>
                <div className={styles.timeLeftContainer}>
                  <p className={styles.timeLeftData}>..</p>
                    <p className={styles.timeLeftSpentPara}>
                        <span className={styles.timeSpentIcon}></span>
                        <span>Time Spent</span>
                    </p>
                </div>
                
            </div>
        </div>
      </div>
      <div className={styles.studentReportSubjectWiseConatiner}>
            <h2 className={styles.subjectWiseReportHeading}>Subject Wise Report</h2>
            <div className={styles.subjectwiseTableMainDiv}>
            <table
                className={styles.tableMain}
                border="1"
                cellPadding="10"
                cellSpacing="0"
              >
                <thead>
                  <tr className={styles.tableTr}>
                    <th className={styles.tableTh}>Subject Name</th>
                    <th className={styles.tableTh}>Section-Type</th>
                    <th className={styles.tableTh}>Total Questions</th>
                    <th className={styles.tableTh}>Correct</th>
                    <th className={styles.tableTh}>Incorrect</th>
                    <th className={styles.tableTh}>+ve Marks</th>
                    <th className={styles.tableTh}>-ve Marks</th>
                    <th className={styles.tableTh}>Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                    <tr className={styles.tableTr}>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                      <td className={styles.tableTd}></td>
                    </tr>
                  <tr className={styles.tableTrTotalMarks}>
                    <td colSpan="2">
                      <strong >Total</strong>
                    </td>
                    <td className={styles.tableTd}>
                     
                    </td>
                    <td className={styles.tableTd}>
                    
                    </td>
                    <td className={styles.tableTd}>
                      
                    </td>
                    <td className={styles.tableTd}>
                     
                    </td>
                    <td className={styles.tableTd}>
                      
                    </td>
                    <td className={styles.tableTd}>
                      
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>

    </div>
  )
}

export default StudentReport
