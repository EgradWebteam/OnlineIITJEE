import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup';

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
    if (!courseData || !courseData.lectures) {
      console.log("No course data available.");
      return;
    }
  
    const currentLecture = courseData.lectures.find(
      (lecture) => lecture.orvl_lecture_name === selectedLecture?.orvl_lecture_name
    );
  
    if (!currentLecture) {
      console.log("Current lecture not found.");
      return;
    }
  
    if (showExercise) {
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_id === selectedExercise?.exercise_id
      );
  
      const nextExerciseIndex = currentExerciseIndex + 1;
  
      if (nextExerciseIndex < currentLecture.exercises.length) {
        const nextExercise = currentLecture.exercises[nextExerciseIndex];
        setSelectedExercise(nextExercise);
      } else {
        // Move to next lecture after the last exercise
        const nextLectureIndex = courseData.lectures.indexOf(currentLecture) + 1;
        if (nextLectureIndex < courseData.lectures.length) {
          const nextLecture = courseData.lectures[nextLectureIndex];
          setSelectedLecture(nextLecture);
          setShowExercise(false);
        } else {
          alert("You are already on the last lecture.");
        }
      }
    } else {
      if (currentLecture.exercises.length > 0) {
        // Go to the first exercise if available
        const firstExercise = currentLecture.exercises[0];
        setSelectedExercise(firstExercise);
        setShowExercise(true);
      } else {
        // If no exercises, just go to the next lecture
        const currentLectureIndex = courseData.lectures.indexOf(selectedLecture);
        if (currentLectureIndex < courseData.lectures.length - 1) {
          const nextLecture = courseData.lectures[currentLectureIndex + 1];
          setSelectedLecture(nextLecture);
          setShowExercise(false);
        } else {
          alert("You are already on the last lecture.");
        }
      }
    }
  };
  
  const previousLectureOrExercise = () => {
    if (!courseData || !courseData.lectures) {
      console.log("No course data available.");
      return;
    }
  
    const currentLecture = courseData.lectures.find(
      (lecture) => lecture.orvl_lecture_name === selectedLecture?.orvl_lecture_name
    );
  
    if (!currentLecture) {
      console.log("Current lecture not found.");
      return;
    }
  
    if (showExercise) {
      const currentExerciseIndex = currentLecture.exercises.findIndex(
        (ex) => ex.exercise_id === selectedExercise?.exercise_id
      );
  
      if (currentExerciseIndex === 0) {
        // Exit exercises and stay on the current lecture
        setShowExercise(false);
      } else if (currentExerciseIndex > 0) {
        // Go to the previous exercise
        const prevExercise = currentLecture.exercises[currentExerciseIndex - 1];
        setSelectedExercise(prevExercise);
      }
    } else {
      const currentLectureIndex = courseData.lectures.indexOf(selectedLecture);
      if (currentLectureIndex === 0) {
        alert("You are already on the first lecture.");
      } else if (currentLectureIndex > 0) {
        const previousLecture = courseData.lectures[currentLectureIndex - 1];
        setSelectedLecture(previousLecture);
  
        // If the previous lecture has exercises, go to the last exercise
        if (previousLecture.exercises.length > 0) {
          const lastExercise = previousLecture.exercises[previousLecture.exercises.length - 1];
          setSelectedExercise(lastExercise);
          setShowExercise(true);
        } else {
          setShowExercise(false);
        }
      }
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h1>{courseData.orvl_topic_name}</h1>

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
  );
};

export default OrvlCourseTopic;
