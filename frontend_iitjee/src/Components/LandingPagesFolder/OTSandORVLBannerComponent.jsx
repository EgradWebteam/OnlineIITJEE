import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import globalCSS from "../../Styles/Global.module.css";
import otsBannerImg from "../../assets/PortalBanner.png";
import orvlBannerImg from "../../assets/PortalBanner.png";
import otsFeatureImg from "../../assets/TestSeriesDescription.png";
import orvlFeatureImg from "../../assets/TestSeriesDescription.png";
import pqbBannerImg from "../../assets/PortalBanner.png";
import pqbFeatureImg from "../../assets/TestSeriesDescription.png";
import { BASE_URL } from '../../ConfigFile/ApiConfigURL.js';
import { useNavigate } from 'react-router-dom';
import CourseCard from "./CourseCards";

const OTSandORVLBannerComponent = () => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  let portalId = null;
  if (path === "/OTSHomePage") portalId = 1;
  else if (path === "/PQBHomePage") portalId = 2;
  else if (path === "/ORVLHomePage") portalId = 3;

  const [courses, setCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState("All");

  const bannerDataMap = {
    1: {
      title: "Online Test Series",
      image: otsBannerImg,
      features: "Features of Online Test Series",
      featureImage: otsFeatureImg,
    },
    2: {
      title: "Online Practice Question Bank",
      image: pqbBannerImg,
      features: "Features of Practice Question Bank",
      featureImage: pqbFeatureImg,
    },
    3: {
      title: "Online Recorded Video Lectures",
      image: orvlBannerImg,
      features: "Features of Recorded Video Lectures",
      featureImage: orvlFeatureImg,
    },
  };

  const bannerData = bannerDataMap[portalId];

  useEffect(() => {
    const fetchCoursesInHomePage = async () => {
      try {
        const res = await fetch(`${BASE_URL}/CourseHomePage/AvailableCourse/${portalId}`);
        const data = await res.json();
  
        if (Array.isArray(data)) {
          // Extract all courses from nested structure
          const allCourses = [];
          data.forEach((portalGroup) => {
            Object.values(portalGroup.exams).forEach((examGroup) => {
              examGroup.courses.forEach((course) => {
                allCourses.push({
                  ...course,
                  exam_id: examGroup.exam_id,
                  exam_name: examGroup.exam_name,
                  portal_id: portalGroup.portal_id,
                  portal_name: portalGroup.portal_name,
                });
              });
            });
          });
  
          setCourses(allCourses);
          if (allCourses.length > 0) {
            setSelectedExam(allCourses[0].exam_name);
          }
        } else {
          console.error("Invalid course data format:", data);
          setCourses([]);
        }
      } catch (err) {
        console.error("Error fetching Course details:", err);
        setCourses([]);
      }
    };
  
    fetchCoursesInHomePage();
  }, [portalId]);
  
  
 const examNames = useMemo(() => {
    const allExams = courses.map((course) => course.exam_name);
    return [...new Set(allExams)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedExam === "All") return courses;
    return courses.filter((course) => course.exam_name === selectedExam);
  }, [courses, selectedExam]);

  if (!portalId || !bannerData) return <p>Invalid Portal Page</p>;

  return (
    <div>
      {/* Main Banner */}
      <div className={styles.bannerContainer}>
        <div className={styles.imageSection}>
          <img src={bannerData.image} alt={bannerData.title} />
        </div>
        <div className={styles.exploreCoursesHeader}>
          <h3>{bannerData.title}</h3>
        </div>
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
          filteredCourses.map((course, index) => (
            <CourseCard
              key={`${course.course_creation_id}-${index}`} // ensures uniqueness
              title={course.course_name}
              cardImage={course.card_image}
              price={course.total_price}
              context={
                portalId === 1
                  ? "OTSHomePage"
                  : portalId === 2
                  ? "PQBHomePage"
                  : "ORVLHomePage"
              }
              onBuy={() => {
                console.log("Navigating to Student Registration with Course ID:", course.course_creation_id); // Log the course ID
                navigate('/StudentRegistrationPage', { state: { courseCreationId: course.course_creation_id } });
                }
              }
              onGoToTest={() => console.log("Go to Test:", course.course_creation_id)}
            />
          ))
          
        ) : (
          <p>No courses available.</p>
        )}
      </div>

      {/* Features Section */}
      <div className={styles.bannerContainer}>
        <div className={styles.exploreCoursesHeader}>
          <h3>{bannerData.features}</h3>
        </div>
        <div className={styles.FeatureimageSection}>
          <img src={bannerData.featureImage} alt={bannerData.title} />
        </div>
      </div>
    </div>
  );
};

export default OTSandORVLBannerComponent;
