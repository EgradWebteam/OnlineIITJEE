import React, { useEffect, useState } from 'react';
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import StudentReportMain from '../../OTS/ResultsFolderOTS/StudentReportMain';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard_MyResults({studentId}) {

     const [showStudentReport, setShowStudentReport] = useState(false);
     const navigate = useNavigate();
     useEffect(() => {
    console.log("myresults")
      },[])

      const handleViewReportClick = () => {
          let url = `/StudentReport`
          navigate(url);
      }

      // if(showStudentReport){
      //   return(
      //     <StudentReportMain/>
      //   )
      // }



      const [testData, setTestData] = useState([]);
  
    
      useEffect(() => {
        if (!studentId) return;
    
        const fetchResultTestData = async () => {
          try {
            const response = await axios.get(`${BASE_URL}/MyResults/FetchResultTestdata/${studentId}`);
            if (response.data.success) {
              setTestData(response.data);
            } else {
              console.error('Failed to fetch data');
            }
          } catch (error) {
            console.error('Error fetching test result data:', error);
          }
        };
    
        fetchResultTestData();
      }, [studentId]);
    
console.log("testData",testData)


  return (
    <div className={styles.StudentDashboardMyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>My Results</h3>
      </div>
      <div className={styles.myResultsSubContainer}>
        <div className={styles.resultsMainDiv}>
          <div className={styles.resultsSubDiv}>
            <p className={styles.testNameInResults}>TEST</p>
            <div className={styles.resultsViewReportBtn}>
              <button onClick={handleViewReportClick}>VIEW REPORT <span className={styles.resultsBtnIcon}><MdKeyboardDoubleArrowRight /></span> </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
