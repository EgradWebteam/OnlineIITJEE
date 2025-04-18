import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; // Import the base URL from config
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
