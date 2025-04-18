// import React, { useState, memo, useEffect } from "react";
// import ReactPlayer from "react-player";
// import { IoClose } from "react-icons/io5";
// import { GrPrevious, GrNext } from "react-icons/gr";
// import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
// import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css"; // Import the CSS file

// export const MemoizedIoClose = memo(IoClose);
// export const MemoizedGrPrevious = memo(GrPrevious);
// export const MemoizedGrNext = memo(GrNext);

// const Popup = ({
//   lecture,
//   topicid,
//   courseCreationId,
//   fetchExerciseStatus,
//   studentId,
//   exercise,
//   exerciseStatus, // Assuming exerciseStatus contains the status of each question
//   onClose,
//   previousLectureOrExercise,
//   nextLectureOrExercise,
//   currentQuestionIndex,
//   setCurrentQuestionIndex,
// }) => {
//   const [userAnswer, setUserAnswer] = useState("");
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [answerDisabled, setAnswerDisabled] = useState(false);
//   const [feedback, setFeedback] = useState("");

//   const [userAnswers, setUserAnswers] = useState({});

//   const currentQuestion = exercise?.questions?.[currentQuestionIndex];


//   useEffect(() => {
//     resetAnswerState();
//   }, [currentQuestionIndex]);
//   const previousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       resetAnswerState();
//     }
//   };

//   const nextQuestion = () => {
//     if (currentQuestionIndex < exercise.questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       resetAnswerState();
//     }
//   };

//   const resetAnswerState = () => {

//       setUserAnswer('');
//       setSelectedOptions([]);
//     }
  
//     setFeedback('');
//   };
  

//   const handleSubmitAnswer = () => {
//     let submittedAnswer;
  
//     if (currentQuestion.exercise_question_type === 'NATD') {
//       submittedAnswer = userAnswer;
//     } else if (currentQuestion.exercise_question_type === 'MSQ') {
//       submittedAnswer = selectedOptions.sort().join(',');
//     } else if (currentQuestion.exercise_question_type === 'MCQ') {
//       submittedAnswer = userAnswer;
//     }
  
//     const payload = {
//       question_status: 1, // or "not_answered", etc.
//       orvl_topic_id: topicid,
//       exercise_question_id: exercise?.questions?.[currentQuestionIndex]?.exercise_question_id,
//       exercise_name_id: exercise.exercise_name_id,
//       student_registration_id: studentId,
//       course_creation_id: courseCreationId,
//       exercise_userresponse: submittedAnswer,  // Pass the answer here
//     };
  
//     setFeedback('Answer submitted!');
//     setAnswerDisabled(true);
  
//     console.log('Answer:', submittedAnswer);
  
//     // Send the answer via fetch request
//     fetch(`${BASE_URL}/OrvlTopics/SubmitUserAnswer`, {
//       method: 'PUT', // Specify the request method
//       headers: {
//         'Content-Type': 'application/json', // We are sending JSON data
//       },
//       body: JSON.stringify(payload), // Convert the payload to JSON string
//     })
//       .then(response => response.json()) // Parse the response as JSON
//       .then(data => {
//         console.log('Answer submitted successfully:', data);
//       })
//       fetchExerciseStatus()
//       .catch(error => {
//         console.error('Error submitting answer:', error);
//       });
//   };
  

//   const handleOptionChange = (value) => {
//     if (currentQuestion.exercise_question_type === "MCQ") {
//       setUserAnswer(value);
//     } else if (currentQuestion.exercise_question_type === "MSQ") {
//       if (selectedOptions.includes(value)) {
//         setSelectedOptions(selectedOptions.filter((opt) => opt !== value));
//       } else {
//         setSelectedOptions([...selectedOptions, value]);
//       }
//     }
//   };

//   const getStatus = (questionId) => {
//     if (exerciseStatus && typeof exerciseStatus === 'object') {
//       const status = exerciseStatus[questionId];
//       console.log(status);
//       return status; // No default here
//     }
//     return undefined;
//   };

//   return (
//     <div className={styles.popup_overlay}>
//       <div className={styles.popup_content}>
//         {/* Header: Close Button and Heading */}
//         <div className={styles.headerForCloseSndHeading}>
//           <div className={styles.headingForLectures}>
//             {exercise ? exercise.exercise_name : lecture?.orvl_lecture_name}
//           </div>
//           <div className={styles.CloseBtnForPopup}>
//             <button onClick={onClose}>❌</button>
//           </div>
//         </div>
//         <div className={styles.popup_body}>
//           {/* Previous Button (left side) */}
//           <button
//             onClick={previousLectureOrExercise}
//             className={styles.side_nav_button}
//           >
//             <GrPrevious />
//           </button>

//           {/* Main Content */}
//           <div className={styles.popup_main_content}>
//             {exercise && exercise.questions?.length > 0 ? (
//               <div className={styles.slideshow}>
//                 <div className={styles.ExerciseQuestionContainers}>
//                   <div className={styles.QuestionsAndImgScrollContainer}>
//                     <div className={styles.QuestionTypeAndID}>
//                       <h4>{currentQuestion.exercise_question_sort_id}</h4>
//                       <p>{currentQuestion.exercise_question_type}</p>
//                     </div>
//                     <div className={styles.QuestionImgForExercise}>
//                       {currentQuestion.exercise_question_img && (
//                         <div className={styles.img_container}>
//                           <img
//                             src={currentQuestion.exercise_question_img}
//                             alt={`Question ${currentQuestionIndex + 1}`}
//                           />
//                         </div>
//                       )}

//                       {currentQuestion.exercise_question_type === "NATD" && (
//                         <div className={styles.calc_container}>
//                           <input
//                             type="text"
//                             value={userAnswer}
//                             onChange={(e) => setUserAnswer(e.target.value)}
//                             disabled={answerDisabled}
//                             className="inputnat"
//                             placeholder="Enter your answer"
//                           />
//                         </div>
//                       )}

//                       {(currentQuestion.exercise_question_type === "MCQ" ||
//                         currentQuestion.exercise_question_type === "MSQ") &&
//                         currentQuestion.options?.length > 0 && (
//                           <div className={styles.options_container}>
//                             {currentQuestion.options.map((option) => (
//                               <label key={option.exercise_option_id}>
//                                 <input
//                                   type={
//                                     currentQuestion.exercise_question_type ===
//                                     "MSQ"
//                                       ? "checkbox"
//                                       : "radio"
//                                   }
//                                   name={`question_${currentQuestion.exercise_question_id}`}
//                                   value={option.exercise_option_index}
//                                   checked={
//                                     currentQuestion.exercise_question_type ===
//                                     "MSQ"
//                                       ? selectedOptions.includes(
//                                           option.exercise_option_index
//                                         )
//                                       : userAnswer ===
//                                         option.exercise_option_index
//                                   }
//                                   onChange={() =>
//                                     handleOptionChange(
//                                       option.exercise_option_index
//                                     )
//                                   }
//                                   disabled={answerDisabled}
//                                 />
//                                 {option.exercise_option_img ? (
//                                   <img
//                                     src={option.exercise_option_img}
//                                     alt={`Option ${option.exercise_option_index}`}
//                                   />
//                                 ) : (
//                                   option.exercise_option_index
//                                 )}
//                               </label>
//                             ))}
//                           </div>
//                         )}
//                     </div>
//                   </div>
//                   {feedback && <div>{feedback}</div>}

//                   <div className={styles.navigation_buttons_for_ques}>
//                     {currentQuestionIndex > 0 && (
//                       <div className={styles.BtnForQuestion}>
//                         <button onClick={previousQuestion}>
//                           Previous Question
//                         </button>
//                       </div>
//                     )}
//                     {!answerDisabled && (
//                       <div className={styles.BtnForQuestion}>
//                         <button onClick={handleSubmitAnswer}>Submit</button>
//                       </div>
//                     )}
//                     {answerDisabled && (
//                       <div className={styles.BtnForQuestion}>
//                         <button
//                           onClick={() => setFeedback("Solution displayed!")}
//                         >
//                           View Solution
//                         </button>
//                       </div>
//                     )}
//                     {currentQuestionIndex < exercise.questions.length - 1 && (
//                       <div className={styles.BtnForQuestion}>
//                         <button onClick={nextQuestion}>Next Question</button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className={styles.exercise_question_Subcontainer}>
//                   <div className={styles.status_pallete}>
//                     {exercise.questions.map((question, index) => {
//                       const status = getStatus(question.exercise_question_id);
//                       return (
//                         <span
//                           key={question.exercise_question_id}
//                           className={`${styles.status_item} ${
//                             styles[getStatus(question.exercise_question_id)]
//                           }`}
//                           title={`Question ${index + 1}: ${status}`}
//                           onClick={() => setCurrentQuestionIndex(index)}
//                         >
//                           {index + 1}
//                         </span>
//                       );
//                     })}
//                   </div>
//                   <div className={styles.CircleForAllWrapers}>
//                     <div className={styles.HeadingForLegend}>Legend</div>

//                     <div className={styles.circleWrapper}>
//                       <div className={`${styles.circle} ${styles.unanswered}`}>
//                         1
//                       </div>
//                       <span>Unanswered</span>
//                     </div>
//                     <div className={styles.circleWrapper}>
//                       <div className={`${styles.circle} ${styles.answered}`}>
//                         2
//                       </div>
//                       <span>Answered</span>
//                     </div>
//                     <div className={styles.circleWrapper}>
//                       <div className={`${styles.circle} ${styles.notVisited}`}>
//                         3
//                       </div>
//                       <span>Not Visited</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : lecture ? (
//               <div className={styles.ContainerforLectures}>
//                 {lecture.lecture_video_link && (
//                   <div className={styles.lecture_video_link}>
//                     <ReactPlayer
//                       url={lecture.lecture_video_link}
//                       controls
//                       width="100%"
//                     />
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div>No data available</div>
//             )}
//           </div>

//           {/* Next Button (right side) */}
//           <button
//             onClick={nextLectureOrExercise}
//             className={styles.side_nav_button}
//           >
//             <GrNext />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Popup;









import React, { useState, memo } from 'react';
import ReactPlayer from 'react-player';
import { IoClose } from 'react-icons/io5';
import { GrPrevious, GrNext } from 'react-icons/gr';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";// Import the CSS file
 
export const MemoizedIoClose = memo(IoClose);
export const MemoizedGrPrevious = memo(GrPrevious);
export const MemoizedGrNext = memo(GrNext);
 
const Popup = ({
  lecture,
  topicid,
  courseCreationId,
  studentId,
  exercise,
  exerciseStatus, // Assuming exerciseStatus contains the status of each question
  onClose,
  previousLectureOrExercise,
  nextLectureOrExercise,
  currentQuestionIndex,
  setCurrentQuestionIndex
}) => {
 
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [answerDisabled, setAnswerDisabled] = useState(false);
  const [feedback, setFeedback] = useState('');
 
  const currentQuestion = exercise?.questions?.[currentQuestionIndex];
 
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetAnswerState();
    }
  };
 
  const nextQuestion = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetAnswerState();
    }
  };
 
  const resetAnswerState = () => {
    setUserAnswer('');
    setSelectedOptions([]);
    setFeedback('');
    setAnswerDisabled(false);
  };
 
  const handleSubmitAnswer = () => {
    let submittedAnswer;
 
    if (currentQuestion.exercise_question_type === 'NATD') {
      submittedAnswer = userAnswer;
    } else if (currentQuestion.exercise_question_type === 'MSQ') {
      submittedAnswer = selectedOptions.sort().join(',');
    } else if (currentQuestion.exercise_question_type === 'MCQ') {
      submittedAnswer = userAnswer;
    }
 
    const payload = {
      question_status: 1, // or "not_answered", etc.
      orvl_topic_id: topicid,
      exercise_question_id: exercise?.questions?.[currentQuestionIndex]?.exercise_question_id,
      exercise_name_id: exercise.exercise_name_id,
      student_registration_id: studentId,
      course_creation_id: courseCreationId,
      exercise_userresponse: submittedAnswer,  // Pass the answer here
    };
 
    setFeedback('Answer submitted!');
    setAnswerDisabled(true);
 
    console.log('Answer:', submittedAnswer);
 
    // Send the answer via fetch request
    fetch(`${BASE_URL}/OrvlTopics/SubmitUserAnswer`, {
      method: 'PUT', // Specify the request method
      headers: {
        'Content-Type': 'application/json', // We are sending JSON data
      },
      body: JSON.stringify(payload), // Convert the payload to JSON string
    })
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        console.log('Answer submitted successfully:', data);
      })
      .catch(error => {
        console.error('Error submitting answer:', error);
      });
  };
 
  const handleOptionChange = (value) => {
    if (currentQuestion.exercise_question_type === 'MCQ') {
      setUserAnswer(value);
    } else if (currentQuestion.exercise_question_type === 'MSQ') {
      if (selectedOptions.includes(value)) {
        setSelectedOptions(selectedOptions.filter((opt) => opt !== value));
      } else {
        setSelectedOptions([...selectedOptions, value]);
      }
    }
  };
 
  const getStatus = (questionId) => {
    if (exerciseStatus && typeof exerciseStatus === 'object') {
      const status = exerciseStatus[questionId];
      console.log(status);
      return status; // No default here
    }
    return undefined;
  };
 
 
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={onClose}>
          <MemoizedIoClose />
        </button>
        <button onClick={previousLectureOrExercise}>
          <MemoizedGrPrevious />
        </button>
 
        {exercise && exercise.questions?.length > 0 ? (
          <div className="slideshow">
            <div className="SlideShow_Heading_container">
              <h2>{exercise.exercise_name}</h2>
            </div>
 
            <div className="exercise-question-container">
              <h4>{currentQuestion.exercise_question_sort_id}</h4>
              <p>{currentQuestion.exercise_question_type}</p>
 
              {currentQuestion.exercise_question_img && (
                <div className="img-container">
                  <img
                    src={currentQuestion.exercise_question_img}
                    alt={`Question ${currentQuestionIndex + 1}`}
                  />
                </div>
              )}
 
              {currentQuestion.exercise_question_type === 'NATD' && (
                <div className="calc-container">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={answerDisabled}
                    className="inputnat"
                    placeholder="Enter your answer"
                  />
                </div>
              )}
 
              {(currentQuestion.exercise_question_type === 'MCQ' ||
                currentQuestion.exercise_question_type === 'MSQ') &&
                currentQuestion.options?.length > 0 && (
                  <div className={styles['options-container']}>
                    {currentQuestion.options.map((option) => (
                      <label key={option.exercise_option_id}>
                        <input
                          type={
                            currentQuestion.exercise_question_type === 'MSQ'
                              ? 'checkbox'
                              : 'radio'
                          }
                          name={`question_${currentQuestion.exercise_question_id}`}
                          value={option.exercise_option_index}
                          checked={
                            currentQuestion.exercise_question_type === 'MSQ'
                              ? selectedOptions.includes(option.exercise_option_index)
                              : userAnswer === option.exercise_option_index
                          }
                          onChange={() => handleOptionChange(option.exercise_option_index)}
                          disabled={answerDisabled}
                        />
                        {option.exercise_option_img ? (
                          <img
                            src={option.exercise_option_img}
                            alt={`Option ${option.exercise_option_index}`}
                          />
                        ) : (
                          option.exercise_option_index
                        )}
                      </label>
                    ))}
                  </div>
                )}
            </div>
 
            {feedback && <div>{feedback}</div>}
 
            <div className="navigation-buttons-for-ques">
              {currentQuestionIndex > 0 && (
                <button onClick={previousQuestion}>Previous Question</button>
              )}
              {!answerDisabled && (
                <button onClick={handleSubmitAnswer} disabled={answerDisabled}>
                  Submit
                </button>
              )}
              {answerDisabled && (
                <button onClick={() => setFeedback('Solution displayed!')}>
                  View Solution
                </button>
              )}
              {currentQuestionIndex < exercise.questions.length - 1 && (
                <button onClick={nextQuestion}>Next Question</button>
              )}
            </div>
 
            <div className={styles['status-pallete']}>
              {exercise.questions.map((question, index) => {
                const status = getStatus(question.exercise_question_id);
                return (
                  <span
                    key={question.exercise_question_id}
                    className={`${styles['status-item']} ${status}`}
                    title={`Question ${index + 1}: ${status}`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </div>
        ) : lecture ? (
          <div>
            <h2>{lecture.orvl_lecture_name}</h2>
            {lecture.lecture_video_link && (
              <ReactPlayer url={lecture.lecture_video_link} controls width="100%" />
            )}
          </div>
        ) : (
          <div>No data available</div>
        )}
 
        <button onClick={nextLectureOrExercise}>
          <MemoizedGrNext />
        </button>
      </div>
    </div>
  );
 
}
 
export default Popup;
 
 