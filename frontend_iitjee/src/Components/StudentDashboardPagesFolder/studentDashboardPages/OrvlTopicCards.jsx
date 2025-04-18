import React, { useEffect, useState } from "react";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from "../../../Styles/Global.module.css";
import CourseCard from "../../LandingPagesFolder/CourseCards.jsx"; // Import CourseCard component

export default function OrvlTopicCards({ studentId, courseCreationId, setShowTestContainer, context, setShowQuizContainer,setSelectedTestCourse,setShowTopicContainer, onBack }) {
  const [courseData, setCourseData] = useState(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [openCourseOrvl,setOpenCourseOrvl] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/OrvlTopics/OrvlTopicForCourse/${studentId}/${courseCreationId}`
        );
        const data = await res.json();
        setCourseData(data);

        // Default to the first subject
        if (data.subjects?.length > 0) {
          setSelectedSubjectId(data.subjects[0].subject_id);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    };

    fetchCourseData();
  }, [studentId, courseCreationId]);

  if (!courseData) {
    return <div>Loading...</div>;
  }

  const selectedSubject = courseData.subjects.find(
    (subj) => subj.subject_id === selectedSubjectId
  );
  const handleGoToTest = () => {
setOpenCourseOrvl(true);
setShowQuizContainer(false);
setShowTopicContainer(false);
setShowTestContainer(false);
  }
  return (
    <div className={styles.OrvlTopicCardsMainDiv}>
 
  


      {/* Subject Buttons */}
      <div className={globalCSS.examButtonsDiv}>
  {courseData.subjects.map((subject) => (
    <button
      key={subject.subject_id}
      className={`${globalCSS.examButtons} ${
        selectedSubjectId === subject.subject_id ? globalCSS.examActiveBtn : ""
      }`}
      onClick={() => setSelectedSubjectId(subject.subject_id)}
    >
      {subject.subject_name}
    </button>
  ))}
</div>


      {/* Topic Cards for Selected Subject */}
      <div className={globalCSS.cardHolderOTSORVLHome}>
        {selectedSubject?.topics.length > 0 ? (
          selectedSubject.topics.map((topic) => (
            <CourseCard
              key={topic.orvl_topic_id}
              title={topic.orvl_topic_name}
              price={500}
              context={context}
              portalId={courseData.portal_id}
              type={true}
             
              onGoToTest={() => handleGoToTest()}
            />
          ))
        ) : (
          <div className={globalCSS.noTopicsContainer}>
            <p className={globalCSS.noTopicsMsg}>
              No topics available for {selectedSubject.subject_name}.
            </p>
          </div>
        )}
      </div>
      {openCourseOrvl && (
        <div>
          dfjfds
          </div>
      )}
    </div>
  );
}
