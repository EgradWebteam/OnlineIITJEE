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
    setShowPopup(true);
    setShowExercise(false);
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setShowPopup(true);
    setShowExercise(true);
  };

  const handleClosePopup = () => {
    setSelectedLecture(null);
    setSelectedExercise(null);
    setShowPopup(false);
  };

  const nextLectureOrExercise = () => {
    if (!courseData || !courseData.lectures) return;
  
    const currentLecture = courseData.lectures.find(
      (lecture) => lecture.orvl_lecture_name === selectedLecture?.orvl_lecture_name
    );
  
    if (!currentLecture) return;
  
    // If currently on a lecture (not exercise), and it has exercises, go to the first one
    if (!showExercise && currentLecture.exercises.length > 0) {
      setSelectedExercise(currentLecture.exercises[0]);
      setShowExercise(true);
      return;
    }
  
    // If already in an exercise
    if (showExercise) {
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_name === selectedExercise?.exercise_name
      );
  
      const nextExerciseIndex = currentExerciseIndex + 1;
  
      if (nextExerciseIndex < currentLecture.exercises.length) {
        // Go to next exercise
        setSelectedExercise(currentLecture.exercises[nextExerciseIndex]);
      } else {
        // No more exercises, move to next lecture
        const nextLectureIndex = courseData.lectures.indexOf(currentLecture) + 1;
  
        if (nextLectureIndex < courseData.lectures.length) {
          const nextLecture = courseData.lectures[nextLectureIndex];
          setSelectedLecture(nextLecture);
          setSelectedExercise(null);
          setShowExercise(false);
        } else {
          alert("You are already on the last lecture.");
        }
      }
    } else {
      // No exercises and not in exercise mode, just move to next lecture
      const currentLectureIndex = courseData.lectures.indexOf(currentLecture);
      if (currentLectureIndex < courseData.lectures.length - 1) {
        const nextLecture = courseData.lectures[currentLectureIndex + 1];
        setSelectedLecture(nextLecture);
      } else {
        alert("You are already on the last lecture.");
      }
    }
  };
  
  const previousLectureOrExercise = () => {
    if (!courseData || !courseData.lectures) return;
  
    const currentLectureIndex = courseData.lectures.findIndex(
      (lecture) => lecture.orvl_lecture_name === selectedLecture?.orvl_lecture_name
    );
  
    if (currentLectureIndex === -1) return;
  
    const currentLecture = courseData.lectures[currentLectureIndex];
  
    // If currently viewing an exercise
    if (showExercise && selectedExercise) {
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_name === selectedExercise.exercise_name
      );
  
      if (currentExerciseIndex > 0) {
        // Go to previous exercise
        const prevExercise = currentLecture.exercises[currentExerciseIndex - 1];
        setSelectedExercise(prevExercise);
      } else {
        // First exercise: return to lecture
        setShowExercise(false);
        setSelectedExercise(null);
      }
      return;
    }
  
    // If currently on a lecture
    if (!showExercise) {
      if (currentLectureIndex > 0) {
        const previousLecture = courseData.lectures[currentLectureIndex - 1];
        setSelectedLecture(previousLecture);
  
        if (previousLecture.exercises.length > 0) {
          const lastExercise = previousLecture.exercises[previousLecture.exercises.length - 1];
          setSelectedExercise(lastExercise);
          setShowExercise(true);
        } else {
          setSelectedExercise(null);
          setShowExercise(false);
        }
      } else {
        alert("You are already on the first lecture.");
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
