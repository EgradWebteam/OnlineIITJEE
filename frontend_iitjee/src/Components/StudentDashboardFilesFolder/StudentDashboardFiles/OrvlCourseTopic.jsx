import React, { useState, useEffect,useRef } from 'react';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from '../../../Styles/Global.module.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
const OrvlCourseTopic = ({ topicid, onBack,studentId ,courseCreationId}) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);             
  const [showExercise, setShowExercise] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const[exerciseStatus,setExerciseStatus] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [answerDisabled, setAnswerDisabled] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [solutionVideo, setSolutionVideo] = useState(null);
const [solutionImage, setSolutionImage] = useState(null);
const [refetchTrigger, setRefetchTrigger] = useState(false);
const playedTimeRef = useRef(0);

   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
          const exercise_name_id = selectedExercise?.exercise_name_id;
        
            try {
              const response = await fetch(
                `${BASE_URL}/OrvlTopics/GetExcerciseQuestionStatus/${topicid}/${exercise_name_id}/${studentId}/${courseCreationId}`
              );
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
        
              const statusData = await response.json(); // API response for question status
        
              // Initialize an object to store statuses
              const statuses = {};
        
              // Map over the exercises and questions
              selectedExercise.questions.forEach((question) => {
                // Find the corresponding status from the statusData
                const questionStatus = statusData.find(
                  (status) => status.exercise_question_id === question.exercise_question_id
                );
        
                // Determine the question status
                const status = questionStatus
                  ? questionStatus.question_status === 1
                    ? "answered"
                    : questionStatus.question_status === 0
                    ? "unanswered"
                    : "unvisited"
                  : "unvisited"; // Default to "unvisited" if no status found
        
                // Add the status to the statuses object with question ID as key
                statuses[question.exercise_question_id] = status;
              });
        
              setExerciseStatus(statuses);
              console.log(statuses);
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
    
          const statusData = await response.json(); // API response for question status
    
          // Initialize an object to store statuses
          const statuses = {};
    
          // Map over the exercises and questions
          selectedExercise.questions.forEach((question) => {
            // Find the corresponding status from the statusData
            const questionStatus = statusData.find(
              (status) => status.exercise_question_id === question.exercise_question_id
            );
    
            // Determine the question status
            const status = questionStatus
              ? questionStatus.question_status === 1
                ? "answered"
                : questionStatus.question_status === 0
                ? "unanswered"
                : "unvisited"
              : "unvisited"; // Default to "unvisited" if no status found
    
            // Add the status to the statuses object with question ID as key
            statuses[question.exercise_question_id] = status;
          });
    
          setExerciseStatus(statuses);
          console.log(statuses);
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
    const useranswervalue = async () => {
      const questionid = selectedExercise?.questions?.[currentQuestionIndex]?.exercise_question_id;
    
      if (!questionid) return;
    
      try {
        const response = await fetch(
          `${BASE_URL}/OrvlTopics/UserAnswer/${studentId}/${courseCreationId}/${topicid}/${questionid}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (data.length > 0) {
          const result = data[0];
          const isCorrect = result.userAnswer === result.correctAnswer;
    
          setUserAnswer(result.userAnswer || '');
    
          if (!result.userAnswer) {
            setFeedback('Not answered yet.');
          } else if (isCorrect) {
            setFeedback('Correct Answer! ✅');
          } else {
            setFeedback('Incorrect Answer ❌');
          }
          if(result){
            setAnswerDisabled(true)
          }
          // Set solution video and image if available
          if (result.videoSolution) {
          setSolutionVideo(result.videoSolution || null);
          }
          if (result.imageSolution) {
          setSolutionImage(result.imageSolution || null);
          }
    
          setAnswerDisabled(true);
        } else {
          setUserAnswer('');
          setFeedback('No attempt found.');
          setSolutionVideo(null);
          setSolutionImage(null);
        }
      } catch (error) {
        console.error('Error fetching user answer:', error);
        setFeedback('Error loading answer.');
        setSolutionVideo(null);
        setSolutionImage(null);
      }
    };
    ;
     
  useEffect(() => {
    console.log("gd");
  
    if (selectedExercise) {
      console.log("gdgdgd");
      console.log(selectedExercise)
  console.log(selectedExercise?.questions?.[currentQuestionIndex]?.exercise_question_id)
      const questionid = selectedExercise?.questions?.[currentQuestionIndex]?.exercise_question_id;
      if (!questionid) return; // If there's no questionid, exit early
  
      // Check if exerciseStatus is an object and not null
      if (exerciseStatus && typeof exerciseStatus === 'object') {
        const status = exerciseStatus[questionid]; // Get the status for the current question

  
        // Only submit if the status is "NotVisited"
        if (status === 'unvisited') {
          submitExerciseStatus(questionid);
          setAnswerDisabled(false)
          setUserAnswer("")
          setFeedback(null)
          setSolutionVideo(null);
          setSolutionImage(null);
        } 
        else if (status === 'answered'){
          useranswervalue()
        }
          else {
            setAnswerDisabled(false)
            setUserAnswer("")
            setFeedback(null)
            setSolutionVideo(null);
            setSolutionImage(null);
          console.log({ alldhf: 'Question already visited or answered' });
        }
      } else {
        console.log("exerciseStatus or questionid is invalid.");
      }
    }
  }, [selectedExercise, currentQuestionIndex,exerciseStatus]);
  
  
  


  
  
  
  
  const submitExerciseStatus = async (questionid ) => {
    const payload = {
      question_status: 0, // or "not_answered", etc.
      orvl_topic_id: topicid,
      exercise_question_id: questionid,
      exercise_name_id: selectedExercise.exercise_name_id,
      student_registration_id: studentId,
      course_creation_id: courseCreationId,
    };
  
    try {
      const response = await fetch(`${BASE_URL}/OrvlTopics/ExerciseQuestionstatus`, {
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
    setCurrentQuestionIndex(0);
    setSelectedExercise(exercise);
    setShowExercise(true);
    setShowPopup(true);
  } else {
    console.error("Parent lecture not found for exercise.");
  }
};

const handleClosePopup = async () => {
  if (selectedLecture) {
    console.log("hi");
    await trackVideoVisitpost(selectedLecture.orvl_lecture_name_id); // Ensure this finishes first
  }

  // Now update the states
  setSelectedLecture(null);
  setRefetchTrigger(prev => !prev);
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
        setCurrentQuestionIndex(0);
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
        setCurrentQuestionIndex(0);
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
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/OrvlTopics/UserResponseStatus/${studentId}/${courseCreationId}/${topicid}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user response status');
        }
        const data = await response.json();
        setUserStatus(data);
      } catch (err) {
        console.error('Error fetching user status:', err);
      }
    };
 
    if (studentId && courseCreationId && topicid) {
      fetchUserStatus();
    }
  }, [studentId, courseCreationId, topicid,refetchTrigger]);
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
  const trackVideoVisitpost = async (videoId) => {
    try {
      const savedProgress = localStorage.getItem(`${videoId}:playedTime`);
            const savedTotalTime = localStorage.getItem(`${videoId}:totalTime`);
        console.log(savedProgress, savedTotalTime);

        if (!studentId || !topicid || !videoId || !savedProgress || savedProgress === "0" || !savedTotalTime || savedTotalTime === null) {
            console.log("Missing required data: studentId, topicid, or videoId, savedProgress, savedTotalTime.");
            return;
        }

        const response = await fetch(`${BASE_URL}/OrvlTopics/VideoVisitStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                student_registration_id: studentId,
                orvl_topic_id: topicid,
                orvl_lecture_name_id: videoId,
                course_creation_id: courseCreationId, // Ensure this is set properly
                progress_time: savedProgress,
                total_video_time: savedTotalTime,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Successfully tracked video visit:", data);
      
        localStorage.removeItem(`${videoId}:playedTime`);
        localStorage.removeItem(`${videoId}:totalTime`);
    } catch (err) {
        setError(`Error posting video visit: ${err.message}`);
    }
};

  useEffect(() => {

    const handleBeforeUnload = () => {
      console.log("fgjdf")
        if (selectedLecture && !showExercise) {
            trackVideoVisitpost(selectedLecture.orvl_lecture_name_id
            );
        }

    };

    const handleRouteChange = () => {
      console.log("fgjdf")
        if (selectedLecture && !showExercise) {
            trackVideoVisitpost(selectedLecture.orvl_lecture_name_id
            );
        }

    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Call handleRouteChange on unmount to capture navigation away
    return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        handleRouteChange();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location, selectedLecture, showExercise]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
 
     <div className={globalCSS.OrvlCourseTopicContainer}>
         <div className={globalCSS.OrvlCourseTopicbtn}>
         <button onClick={onBack}>Back</button>
         </div>
         <div className={globalCSS.OrvlCourseTopicHeader}>
         {userStatus && (
          <div className={globalCSS.completionInfo}>
          
     
            <div style={{ width: 60, height: 60 }}>
              <CircularProgressbar
                value={parseFloat(userStatus.totalCompletionPercentage)}
                text={`${userStatus.totalCompletionPercentage}%`}
                styles={buildStyles({
                  textSize: '16px',
                  pathColor: '#4caf50',
                  textColor: 'white',
                  trailColor: '#d6d6d6',
                })}
              />
           
            </div>
          </div>
        )}
         <div className={globalCSS.OrvlTopicName}>{courseData.orvl_topic_name}</div>
         </div>
         <div className={globalCSS.OrvlCourseTopicContent}>

      {showPopup ? (
        <Popup
          lecture={selectedLecture}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}           
          answerDisabled={answerDisabled}  
          setAnswerDisabled = {setAnswerDisabled}      
          feedback={feedback}
          setFeedback={setFeedback} 
          useranswervalue={useranswervalue}
          exercise={selectedExercise}
          onClose={handleClosePopup}
          fetchExerciseStatus={fetchExerciseStatus}
          topicid={topicid}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          exerciseStatus={exerciseStatus}
          previousLectureOrExercise={previousLectureOrExercise}
          nextLectureOrExercise={nextLectureOrExercise}
          studentId = {studentId} 
          courseCreationId = {courseCreationId}
          solutionVideo={solutionVideo}
          solutionImage={solutionImage}
          playedTimeRef={playedTimeRef}
         
        
        />
      ) : (
        <LectureExerciseList
          lectures={courseData.lectures}
          onLectureClick={handleLectureClick}
          onExerciseClick={handleExerciseClick}
          userStatus={userStatus}
        />
      )}
    </div>
    </div>
  );
};

export default OrvlCourseTopic;
