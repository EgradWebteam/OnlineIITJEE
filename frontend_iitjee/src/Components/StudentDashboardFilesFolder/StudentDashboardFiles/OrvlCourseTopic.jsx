import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup';
import globalCSS from '../../../Styles/Global.module.css'
const OrvlCourseTopic = ({ topicid, onBack }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);             
  const [showExercise, setShowExercise] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {

        const response = await fetch(`${BASE_URL}/OrvlTopics/CourseTopic/${topicid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }
        const data = await response.json();
        setCourseData(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [topicid]);

  const handleLectureClick = (lecture) => {
    setSelectedLecture(lecture);
    setSelectedExercise(null);         // Don't auto-start exercise
    setShowExercise(false);            // Start with lecture only
    setShowPopup(true);
  };
  

  const handleExerciseClick = (exercise) => {
  const parentLecture = courseData.lectures.find((lecture) =>
    lecture.exercises.some((ex) => ex.exercise_name === exercise.exercise_name)
  );

  if (parentLecture) {
    setSelectedLecture(parentLecture);
    setSelectedExercise(exercise);
    setShowExercise(true);
    setShowPopup(true);
  } else {
    console.error("Parent lecture not found for exercise.");
  }
};

  const handleClosePopup = () => {
    setSelectedLecture(null);
    setSelectedExercise(null);
    setShowPopup(false);
  };

  const nextLectureOrExercise = () => {
    if (!courseData || !selectedLecture) return;
  
    const currentLectureIndex = courseData.lectures.findIndex(
      (lecture) => lecture.orvl_lecture_name === selectedLecture.orvl_lecture_name
    );
    const currentLecture = courseData.lectures[currentLectureIndex];
  
    if (!showExercise) {
      // Go from lecture → first exercise (if any)
      if (currentLecture.exercises.length > 0) {
        setSelectedExercise(currentLecture.exercises[0]);
        setShowExercise(true);
      } else {
        // No exercises → next lecture
        const nextLecture = courseData.lectures[currentLectureIndex + 1];
        if (nextLecture) {
          setSelectedLecture(nextLecture);
          setSelectedExercise(null);
          setShowExercise(false);
        } else {
          alert("You're already at the last lecture.");
        }
      }
    } else {
      // In exercises → move to next exercise
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_name === selectedExercise.exercise_name
      );
  
      if (currentExerciseIndex < currentLecture.exercises.length - 1) {
        setSelectedExercise(currentLecture.exercises[currentExerciseIndex + 1]);
      } else {
        // Finished last exercise → move to next lecture
        const nextLecture = courseData.lectures[currentLectureIndex + 1];
        if (nextLecture) {
          setSelectedLecture(nextLecture);
          setSelectedExercise(null);
          setShowExercise(false);
        } else {
          alert("You're already at the last lecture.");
        }
      }
    }
  };
  
  
  const previousLectureOrExercise = () => {
    if (!courseData || !selectedLecture) return;
  
    const currentLectureIndex = courseData.lectures.findIndex(
      (lecture) => lecture.orvl_lecture_name === selectedLecture.orvl_lecture_name
    );
    const currentLecture = courseData.lectures[currentLectureIndex];
  
    if (showExercise && selectedExercise) {
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_name === selectedExercise.exercise_name
      );
  
      if (currentExerciseIndex > 0) {
        // Go to previous exercise
        setSelectedExercise(currentLecture.exercises[currentExerciseIndex - 1]);
      } else {
        // First exercise → back to lecture
        setShowExercise(false);
        setSelectedExercise(null);
      }
    } else {
      // Back from lecture → previous lecture's last exercise (if any)
      const previousLecture = courseData.lectures[currentLectureIndex - 1];
  
      if (previousLecture) {
        setSelectedLecture(previousLecture);
        if (previousLecture.exercises.length > 0) {
          setSelectedExercise(previousLecture.exercises[previousLecture.exercises.length - 1]);
          setShowExercise(true);
        } else {
          setSelectedExercise(null);
          setShowExercise(false);
        }
      } else {
        alert("You're already at the first lecture.");
      }
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
 
     <div className={globalCSS.OrvlCourseTopicContainer}>
         <div className={globalCSS.OrvlCourseTopicbtn}>
         <button onClick={onBack}>Back</button>
         </div>
         <div className={globalCSS.OrvlCourseTopicHeader}>
         <div>{courseData.orvl_topic_name}</div>
         </div>
         <div className={globalCSS.OrvlCourseTopicContent}>

      {showPopup ? (
        <Popup
          lecture={selectedLecture}
          exercise={selectedExercise}
          onClose={handleClosePopup}
          previousLectureOrExercise={previousLectureOrExercise}
          nextLectureOrExercise={nextLectureOrExercise}
        />
      ) : (
        <LectureExerciseList
          lectures={courseData.lectures}
          onLectureClick={handleLectureClick}
          onExerciseClick={handleExerciseClick}
        />
      )}
    </div>
    </div>
  );
};

export default OrvlCourseTopic;
