import React, { useEffect, useMemo, useState } from 'react';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from "../../../Styles/Global.module.css";
import CourseCard from '../../LandingPagesFolder/CourseCards';
import { BASE_URL } from '../../../../apiConfig';

export default function StudentDashboard_BuyCourses() {
   useEffect(() => {
      console.log("buycourses")
        },[])
  const studentId = 6; // Replace with actual ID from auth/session

  const [structuredCourses, setStructuredCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  useEffect(() => {
    const fetchCoursesInBuyCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/studentbuycourses/UnPurchasedcourses/${studentId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setStructuredCourses(data);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("Error fetching unpurchased courses:", err);
      }
    };

    fetchCoursesInBuyCourses();
  }, []);

  // Flatten the structured courses
  const flatCourses = useMemo(() => {
    const courses = [];

    structuredCourses.forEach((portal) => {
      Object.values(portal.exams).forEach((exam) => {
        exam.courses.forEach((course) => {
          courses.push({
            ...course,
            portal_id: portal.portal_id,
            portal_name: portal.portal_name,
            exam_id: exam.exam_id,
            exam_name: exam.exam_name,
          });
        });
      });
    });

    return courses;
  }, [structuredCourses]);

  // Extract unique exam names
  const examNames = useMemo(() => {
    return [...new Set(flatCourses.map((c) => c.exam_name))];
  }, [flatCourses]);

  // Set default selected exam when data is ready
  useEffect(() => {
    if (!selectedExam && examNames.length > 0) {
      setSelectedExam(examNames[0]);
    }
  }, [examNames, selectedExam]);

  // Filter courses based on selected exam
  const filteredCourses = useMemo(() => {
    return flatCourses.filter((c) => c.exam_name === selectedExam);
  }, [flatCourses, selectedExam]);

  return (
    <div className={styles.StudentDashboardBuyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>Buy Courses</h3>
      </div>
     

      {/* Exam Filter Buttons */}
      <div className={globalCSS.examButtonsDiv}>
        {examNames.map((exam, idx) => (
          <button
            key={idx}
            className={`${globalCSS.examButtons} ${
              selectedExam === exam ? globalCSS.examActiveBtn : ""
            }`}
            onClick={() => setSelectedExam(exam)}
          >
            {exam}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className={globalCSS.cardHolderOTSORVLHome}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={`${course.portal_id}-${course.course_creation_id}`}
              title={course.course_name}
              cardImage={course.card_image}
              price={course.total_price}
              context="buyCourses"
              onBuy={() => {
                console.log("Navigating to Student Registration with Course ID:", course.course_creation_id); // Log the course ID
  
                }
              }
            
              onGoToTest={() => console.log("Go to Test:", course.course_creation_id)}
            />
          ))
        ) : (
            <div className={globalCSS.noCoursesContainer}>
              <p className={globalCSS.noCoursesMsg}>No courses available at the moment.</p>
            </div>
        )}
      </div>
    </div>
  );
}
