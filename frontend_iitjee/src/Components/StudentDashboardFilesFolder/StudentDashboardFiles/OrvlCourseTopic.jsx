import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../Config/ApiConfig.js'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from '../../../Styles/Global.module.css'
const OrvlCourseTopic = ({ topicid, onBack,studentId ,courseCreationId}) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);             
  const [showExercise, setShowExercise] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const[exerciseStatus,setExerciseStatus] = useState(null)
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
    const fetchExerciseStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/OrvlTopics/GetExcerciseQuestionStatus/${topicid}/${exercise_name_id}/${studentId}/${courseCreationId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        const statuses = {};
  
        // Check if there are any questions to iterate over and if data is not empty
        if (data && Object.keys(data).length > 0 && selectedExercise.exerciseQuestions?.length > 0) {
          selectedExercise.exerciseQuestions.forEach((question) => {
            const questionStatus = data[question.exercise_question_id];
  
            // If no status is found, set it as "NotVisited", otherwise set as "Answered" or "NotAnswered"
            if (questionStatus === undefined) {
              statuses[question.exercise_question_id] = "NotVisited";
            } else {
              statuses[question.exercise_question_id] = questionStatus === 1 ? "Answered" : "NotAnswered";
            }
          });
        } else {
          // Default every question to "NotVisited" if no response found or exerciseQuestions is empty
          if (selectedExercise.exerciseQuestions?.length > 0) {
            selectedExercise.exerciseQuestions.forEach((question) => {
              statuses[question.exercise_question_id] = "NotVisited";
            });
          }
        }
  
        setExerciseStatus(statuses); // Store statuses as an object
      } catch (err) {
        console.error('Error fetching exercise status:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    const exercise_name_id = selectedExercise?.exercise_name_id;
  
    const fetchExerciseStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/OrvlTopics/GetExcerciseQuestionStatus/${topicid}/${exercise_name_id}/${studentId}/${courseCreationId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        const statuses = {};
  
        // Check if there are any questions to iterate over and if data is not empty
        if (data && Object.keys(data).length > 0 && selectedExercise.exerciseQuestions?.length > 0) {
          selectedExercise.exerciseQuestions.forEach((question) => {
            const questionStatus = data[question.exercise_question_id];
  
            // If no status is found, set it as "NotVisited", otherwise set as "Answered" or "NotAnswered"
            if (questionStatus === undefined) {
              statuses[question.exercise_question_id] = "NotVisited";
            } else {
              statuses[question.exercise_question_id] = questionStatus === 1 ? "Answered" : "NotAnswered";
            }
          });
        } else {
          // Default every question to "NotVisited" if no response found or exerciseQuestions is empty
          if (selectedExercise.exerciseQuestions?.length > 0) {
            selectedExercise.exerciseQuestions.forEach((question) => {
              statuses[question.exercise_question_id] = "NotVisited";
            });
          }
        }
  
        setExerciseStatus(statuses); // Store statuses as an object
      } catch (err) {
        console.error('Error fetching exercise status:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
  
    if (topicid && exercise_name_id && studentId && courseCreationId) {
      fetchExerciseStatus();
    }
  }, [topicid, selectedExercise, studentId, courseCreationId]);
  
  
  useEffect(() => {
    if (
      selectedExercise &&
      selectedExercise.exerciseQuestions &&
      exerciseStatus
    ) {
      selectedExercise.exerciseQuestions.forEach((question) => {
        const status = exerciseStatus[question.exercise_question_id];
        if (status === "NotVisited") {
         
          submitExerciseStatus(); 
        } else {
          console.log({ alldhf: 'Question already visited or answered' });
        }
      });
    }
  }, [selectedExercise, exerciseStatus]);
  
  const submitExerciseStatus = async () => {
    const payload = {
      question_status: 0, // or "not_answered", etc.
      orvl_topic_id: topicid,
      exercise_question_id: yourQuestionId,
      exercise_name_id: selectedExercise.exercise_name_id,
      student_registration_id: studentId,
      course_creation_id: courseCreationId,
    };
  
    try {
      const response = await fetch(`${BASE_URL}/ExerciseQuestionstatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      fetchExerciseStatus();
      console.log('Response submitted:', data);
    } catch (error) {
      console.error('Error submitting exercise status:', error);
    }
  };
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
          exerciseStatus={exerciseStatus}
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
