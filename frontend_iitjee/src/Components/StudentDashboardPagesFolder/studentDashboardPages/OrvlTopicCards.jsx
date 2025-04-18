import React, { useEffect, useState } from "react";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from "../../../Styles/Global.module.css";
import OrvlTopicCardSub from "./OrvlTopicCardSub.jsx";


export default function OrvlTopicCards({
  studentId,
  courseCreationId,
  setShowTestContainer,
  context,
  setOpenCourseOrvl,
  setShowQuizContainer,
  setSelectedTestCourse,
  setShowTopicContainer,
  onBack,
}) {
  const [courseData, setCourseData] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);


  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/OrvlTopics/OrvlTopicForCourse/${studentId}/${courseCreationId}`
        );
        const data = await res.json();
        setCourseData(data);

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

  const handleGoToTest = (topic) => {
    console.log("CourseCard clicked!");
    setOpenCourseOrvl(true);
    setShowTopicContainer(false); // Hide topics container when opening OrvlCourseTopic
  };

  return (
    <div className={styles.OrvlTopicCardsMainDiv}>
      {/* Subject Buttons */}
      <div className={globalCSS.examButtonsDiv}>
        {courseData.subjects.map((subject) => (
          <button
            key={subject.subject_id}
            className={`${globalCSS.examButtons} ${
              selectedSubjectId === subject.subject_id
                ? globalCSS.examActiveBtn
                : ""
            }`}
            onClick={() => setSelectedSubjectId(subject.subject_id)}
          >
            {subject.subject_name}
          </button>
        ))}
      </div>

      {/* Topic Cards */}
      <div className={globalCSS.cardHolderOTSORVLHome}>
        {selectedSubject?.topics.length > 0 ? (
          selectedSubject.topics.map((topic) => (
            <OrvlTopicCardSub
              key={topic.orvl_topic_id}
              title={topic.orvl_topic_name}
              price={500}
              context={context}
              portalId={courseData.portal_id}
              type={true}
              onGoToTest={() => handleGoToTest(topic)}
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


    </div>
  );
}
