import React, { useEffect, useState, useMemo } from "react";
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import CourseCard from "../../LandingPagesFolder/CourseCards.jsx";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import TestDetailsContainer from "./TestDetailsContainer.jsx";
import OrvlTopicCards from "./OrvlTopicCards.jsx";
import OrvlCourseTopic from "./OrvlCourseTopic.jsx";


export default function StudentDashboard_MyCourses({ studentId,userData }) {
  const [structuredCourses, setStructuredCourses] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTestCourse, setSelectedTestCourse] = useState(null);
  const [openCourseOrvl, setOpenCourseOrvl] = useState(false);
  const [showQuizContainer, setShowQuizContainer] = useState(true);
  const [showTestContainer, setShowTestContainer] = useState(false);
  const [showTopicContainer, setShowTopicContainer] = useState(false);
  const [topicId, setTopicId] = useState("");
  useEffect(() => {
    const fetchPurchasedCourses = async () => {
  
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/studentmycourses/Purchasedcourses/${studentId}`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const defaultPortal = data[0];
          const firstExam = Object.values(defaultPortal.exams)?.[0];
          setStructuredCourses(data);
          setSelectedPortal(defaultPortal.portal_name);
          setSelectedExam(firstExam?.exam_name || null);
        } else {
          setStructuredCourses([]);
        }
      } catch (err) {
        console.error("Error fetching purchased courses", err);
        setStructuredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [studentId]);

  const portalData = useMemo(() => {
    return structuredCourses.find((p) => p.portal_name === selectedPortal);
  }, [structuredCourses, selectedPortal]);

  const examsForSelectedPortal = useMemo(() => {
    return portalData ? Object.values(portalData.exams) : [];
  }, [portalData]);

  const filteredCourses = useMemo(() => {
    if (!portalData || !selectedExam) return null;
    const exam = Object.values(portalData.exams).find(
      (e) => e.exam_name === selectedExam
    );
    if (!exam) return [];
    return exam.courses.map((course) => ({
      ...course,
      exam_name: exam.exam_name,
      portal_name: portalData.portal_name,
      portal_id: portalData.portal_id,
    }));
  }, [portalData, selectedExam]);

  const handleGoToTest = (course) => {
    setSelectedTestCourse(course);
    setShowQuizContainer(false);
    if (course.portal_id === 3) {
      setShowTopicContainer(true);
    } else {
      setShowTestContainer(true);
    }
  };

  const handleBackToCourses = () => {
    setSelectedTestCourse(null);
    setShowQuizContainer(true);
    setShowTestContainer(false);
    setShowTopicContainer(false);
  };

  return (
    <>
     {(!showQuizContainer || selectedTestCourse) && (
  <div className={styles.breadcrumbContainer}>
    <span className={styles.breadcrumbLink}>My Courses</span>
    <span className={styles.breadcrumbSeparator}> &gt; </span>
    <span
      className={styles.breadcrumbLink}
      onClick={() => {
        const portal = structuredCourses.find(
          (p) => p.portal_name === selectedPortal
        );
        const firstExam = portal ? Object.values(portal.exams)[0] : null;
        setSelectedExam(firstExam?.exam_name || null);
        setSelectedTestCourse(null);
        setShowTestContainer(false);
        setShowTopicContainer(false);
        setOpenCourseOrvl(false);
        setShowQuizContainer(true);
      }}
    >
      {selectedPortal}
    </span>

    <span className={styles.breadcrumbSeparator}> &gt; </span>

    {selectedExam && (
      <>
        <span
          className={styles.breadcrumbLink}
          onClick={() => {
            setSelectedTestCourse(null);
            setShowTestContainer(false);
            setShowTopicContainer(false);
            setOpenCourseOrvl(false);
            setShowQuizContainer(true);
          }}
        >
          {selectedExam}
        </span>
        <span className={styles.breadcrumbSeparator}> &gt; </span>
      </>
    )}

    {selectedTestCourse && (
      <span className={styles.breadcrumbCurrent}>
        {selectedTestCourse.course_name}
      </span>
    )}
  </div>
)}
      {showQuizContainer && (
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
                  selectedPortal === portal.portal_name ? styles.active : ""
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
          <div className={globalCSS.examButtonsDiv}  style={{margin:"0rem 1rem"}}>
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
          {loading ? (
            <div className={globalCSS.loadingContainer}>
              <p className={globalCSS.loadingText}>Loading your courses...</p>
            </div>
          ) : !structuredCourses.length ||
            !selectedPortal ||
            !selectedExam ||
            filteredCourses.length === 0 ? (
            <div className={globalCSS.noCoursesContainer}>
              <p className={globalCSS.noCoursesMsg}>
                YOU HAVE NO ACTIVE COURSES
              </p>
            </div>
          ) : (
            <div className={styles.StduentDashboardRightSideBarForBggg}>
            <div className={globalCSS.cardHolderOTSORVLHome}>
              {filteredCourses.map((course) => (
              
                <CourseCard
                  key={course.course_creation_id}
                  title={course.course_name}
                  cardImage={course.card_image}
                  context="myCourses"
                  portalId={course.portal_id}
                  onGoToTest={() => handleGoToTest(course)}
                />
              ))}
            </div>
            </div>
          )}
        </div>
      )}

      {showTestContainer && selectedTestCourse && (
        <TestDetailsContainer
          course={selectedTestCourse}
          onBack={handleBackToCourses}
          studentId={studentId}
          userData={userData}
        />
      )}

      {showTopicContainer && selectedTestCourse && (
        <OrvlTopicCards
          key={selectedTestCourse.course_creation_id}
          studentId={studentId}
          courseCreationId={selectedTestCourse.course_creation_id}
          context="myCourses"
          setTopicId={setTopicId}
          topicId={topicId}
          setShowQuizContainer={setShowQuizContainer}
          setOpenCourseOrvl={setOpenCourseOrvl}
          setSelectedTestCourse={setSelectedTestCourse}
          setShowTestContainer={setShowTestContainer}
          setShowTopicContainer={setShowTopicContainer}
          onBack={handleBackToCourses}
        />
      )}
      {openCourseOrvl && (
        <OrvlCourseTopic
          studentId={studentId}
          setOpenCourseOrvl={setOpenCourseOrvl}
          setSelectedTestCourse={setSelectedTestCourse}
          setShowTestContainer={setShowTestContainer}
          setShowTopicContainer={setShowTopicContainer}
          courseCreationId={selectedTestCourse.course_creation_id}
          topicid={topicId}
          onBack={() => {
            setOpenCourseOrvl(false);
            setShowTopicContainer(true); // When going back, show topic container again
          }}
        />
      )}
    </>
  );
}
