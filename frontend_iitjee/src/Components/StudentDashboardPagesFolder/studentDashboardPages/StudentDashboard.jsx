import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentDashboardHeader from '../StudentDashboardPages/StudentDashboardHeader.jsx';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import StudentDashboardLeftSideBar from '../StudentDashboardPages/StudentDashboardLeftSidebar.jsx';

export default function StudentDashboard() {
  // Access sessionId from the URL using useParams
  const { sessionId } = useParams();

  const [studentData, setStudentData] = useState(null); // To store the fetched student data

  useEffect(() => {
    // Fetch student data using the sessionId from the URL
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/student/${sessionId}`); // Assume your API fetches data using the sessionId
        const data = await response.json();
        
        if (response.ok) {
          setStudentData(data); // Save fetched data in state
        } else {
          console.error("Failed to fetch student data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (sessionId) {
      fetchStudentData(); // Fetch data only if sessionId exists
    }
  }, [sessionId]);

  return (
    <div>
      <StudentDashboardHeader />
      <div className={styles.StudentDashboardContentHolder}>
        <div className={styles.studentDashboardLeftNavHolder}>
          <StudentDashboardLeftSideBar />
        </div>
        <div className={styles.StudentDashboardRightSideContentHolder}>
          {studentData ? (
            <div>
              <h2>Welcome, {studentData.name}!</h2>
              <p>Email: {studentData.email}</p>
              <p>Other Info: {studentData.otherInfo}</p>
              {/* Add more student-specific data here */}
            </div>
          ) : (
            <p>Loading student data...</p> // Loading state when data is not yet fetched
          )}
        </div>
      </div>
    </div>
  );
}
