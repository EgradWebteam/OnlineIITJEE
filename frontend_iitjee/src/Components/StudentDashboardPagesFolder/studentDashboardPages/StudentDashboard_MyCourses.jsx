import React, { useEffect, useState, useMemo } from 'react';
import globalCSS from "../../../Styles/global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import CourseCard from '../../LandingPagesFolder/CourseCards.jsx';
import { BASE_URL } from '../../../config/apiConfig';
import TestDetailsContainer from './TestDetailsContainer';

export default function StudentDashboard_MyCourses({studentId}) {
 
  const [structuredCourses, setStructuredCourses] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTestCourse, setSelectedTestCourse] = useState(null);


  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/studentmycourses/Purchasedcourses/${studentId}`);
        const data = await res.json();
        console.log("API Response:", data); // Log the response to inspect it
    
        if (Array.isArray(data) && data.length > 0) {
          const defaultPortal = data[0];
          const firstExam = Object.values(defaultPortal.exams)?.[0];
    
          setStructuredCourses(data);
          setSelectedPortal(defaultPortal.portal_name);
          setSelectedExam(firstExam?.exam_name || null);
        } else {
          setStructuredCourses([]); // No courses found, set empty state
        }
      } catch (err) {
        console.error("Error fetching purchased courses", err);
        setStructuredCourses([]); // In case of error, reset the state
      } finally {
        setLoading(false);
      }
    };
    

    fetchPurchasedCourses();
  }, [studentId]);

  const portalData = useMemo(() => {
    return structuredCourses.find(p => p.portal_name === selectedPortal);
  }, [structuredCourses, selectedPortal]);

  const examsForSelectedPortal = useMemo(() => {
    return portalData ? Object.values(portalData.exams) : [];
  }, [portalData]);

  const filteredCourses = useMemo(() => {
    if (!portalData || !selectedExam) return null; // null means "not ready yet"
    const exam = Object.values(portalData.exams).find(e => e.exam_name === selectedExam);
    if (!exam) return [];
    return exam.courses.map(course => ({
      ...course,
      exam_name: exam.exam_name,
      portal_name: portalData.portal_name,
    }));
  }, [portalData, selectedExam]);

  const handleGoToTest = (course) => {
    setSelectedTestCourse(course);
  };
  
  if (selectedTestCourse) {
    return (
      <TestDetailsContainer
        course={selectedTestCourse}
        onBack={() => setSelectedTestCourse(null)} 
        studentId={studentId}
      />
    );
  }
  return (
    <div className={styles.studentDashboardMyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>My Courses</h3>
      </div>

      {/* Portal Buttons */}
      <div className={styles.toggleTypeButtons}>
        {structuredCourses.map((portal, index) => (
          <button
            key={index}
            className={`${styles.toggleBtn} ${
              selectedPortal === portal.portal_name ?  styles.active  : ""
            }`}
            onClick={() => {
              setSelectedPortal(portal.portal_name);
              const firstExam = Object.values(portal.exams)[0];
              setSelectedExam(firstExam?.exam_name || null);
            }}
          >
            {portal.portal_name}
          </button>
        ))}
      </div>

      {/* Exam Buttons */}
      <div className={globalCSS.examButtonsDiv}>
        {examsForSelectedPortal.map((exam, idx) => (
          <button
            key={idx}
            className={`${globalCSS.examButtons} ${
              selectedExam === exam.exam_name ? globalCSS.examActiveBtn : ""
            }`}
            onClick={() => setSelectedExam(exam.exam_name)}
          >
            {exam.exam_name}
          </button>
        ))}
      </div>

       {/* Loading or Not Ready */}
      {(!structuredCourses.length || !selectedPortal || !selectedExam || filteredCourses.length === 0) ? (
        <div className={globalCSS.noCoursesContainer}>
          <p className={globalCSS.noCoursesMsg}>YOU HAVE NO ACTIVE COURSES</p>
        </div>
      ) : (
        <div className={globalCSS.cardHolderOTSORVLHome}>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.course_creation_id}
              title={course.course_name}
              cardImage={course.card_image}
              context="myCourses"
              onGoToTest={() => handleGoToTest(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
