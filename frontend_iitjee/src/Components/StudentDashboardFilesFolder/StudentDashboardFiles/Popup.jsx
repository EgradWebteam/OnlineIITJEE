import React, { useState, memo, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { IoClose } from "react-icons/io5";
import { GrPrevious, GrNext } from "react-icons/gr";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css"; // Import the CSS file
// import DisableKeysAndMouseInteractions from "../../../ContextFolder/DisableKeysAndMouseInteractions.jsx";
export const MemoizedIoClose = memo(IoClose);
export const MemoizedGrPrevious = memo(GrPrevious);
export const MemoizedGrNext = memo(GrNext);

const Popup = ({
  lecture,
  topicid,
  playedTimeRef,

  courseCreationId,
  studentId,
  exercise,
  exerciseStatus,
  onClose,
  previousLectureOrExercise,
  nextLectureOrExercise,
  currentQuestionIndex,
  setAnswerDisabled,
  userAnswer,
  setUserAnswer,
  answerDisabled,
  feedback,
  setFeedback,
  fetchExerciseStatus,
  setCurrentQuestionIndex,
  solutionVideo,
  solutionImage,
  setSelectedOptions,
  selectedOptions,
}) => {
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const playerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPalette, setShowPalette] = useState(window.innerWidth >= 768);
  // DisableKeysAndMouseInteractions();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowPalette(!mobile); // Always show if desktop, hide if mobile
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

  // Track video progress
  const handleProgress = (state) => {
    playedTimeRef.current = state.playedSeconds;
    //console.log("Current Played Time: ", state.playedSeconds);

    localStorage.setItem(
      `${lecture.orvl_lecture_name_id}:playedTime`,
      state.playedSeconds
    );

    if (videoDuration) {
      localStorage.setItem(
        `${lecture.orvl_lecture_name_id}:totalTime`,
        videoDuration
      );
    }
  };
  const inputRef = useRef(null);
  const handleNatipChange = (value) => {
    if (answerDisabled) return;

    const inputElement = inputRef.current;
    // If BACK SPACE is pressed, remove the character left of the caret
    if (value === "BACK SPACE") {
      if (!inputElement) return;
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;

      // If there is a text selection, remove the selected text
      if (start !== end) {
        const newValue = userAnswer.slice(0, start) + userAnswer.slice(end);
        setUserAnswer(newValue);
        setTimeout(() => {
          inputElement.setSelectionRange(start, start);
          inputElement.focus();
        }, 0);
      } else if (start > 0) {
        // Remove the character immediately to the left of the caret
        const newValue =
          userAnswer.slice(0, start - 1) + userAnswer.slice(start);
        setUserAnswer(newValue);
        setTimeout(() => {
          inputElement.setSelectionRange(start - 1, start - 1);
          inputElement.focus();
        }, 0);
      }
      return;
    }

    // For all other inputs, insert the new value at the current caret position
    const cursorPosition = inputElement
      ? inputElement.selectionStart
      : userAnswer.length;
    let newValue =
      userAnswer.slice(0, cursorPosition) +
      value +
      userAnswer.slice(cursorPosition);

    // Allow only numbers, one leading "-", and a single decimal point
    if (/^-?[0-9]*\.?[0-9]*$/.test(newValue)) {
      // Ensure "-" appears only at the beginning
      if (newValue.includes("-") && newValue.indexOf("-") !== 0) return;

      // Remove unnecessary leading zeros (except "0." cases)
      if (
        newValue.startsWith("-0") &&
        newValue.length > 2 &&
        newValue[2] !== "."
      ) {
        newValue = "-" + newValue.slice(2);
      } else if (
        newValue.startsWith("0") &&
        newValue.length > 1 &&
        newValue[1] !== "."
      ) {
        newValue = newValue.slice(1);
      }

      // Limit length to 10 characters
      if (newValue.length <= 10) {
        setUserAnswer(newValue);
        setTimeout(() => {
          if (inputElement) {
            inputElement.setSelectionRange(
              cursorPosition + value.length,
              cursorPosition + value.length
            );
            inputElement.focus();
          }
        }, 0);
      }
    }
  };
  const handleArrowClick = (direction) => {
    if (!inputRef.current) return;
    const inputElement = inputRef.current;
    const cursorPosition = inputElement.selectionStart;

    if (direction === "left" && cursorPosition > 0) {
      inputElement.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
    } else if (
      direction === "right" &&
      cursorPosition < inputElement.value.length
    ) {
      inputElement.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    }
    inputElement.focus();
  };

  // Clears the entire answer and refocuses the input
  const handleClearAll = () => {
    setUserAnswer("");
    if (inputRef.current) {
      inputRef.current.focus();
      // Optionally reset caret position to 0
      inputRef.current.setSelectionRange(0, 0);
    }
  };
  // const handleRightClick = (event) => {
  //   event.preventDefault();
  // };
  const handlePause = () => {
    const currentTime = playerRef.current?.getCurrentTime(); // Safe access with optional chaining
    // console.log(
    //   `Saving time ${currentTime} for video ${lecture.orvl_lecture_name_id}`
    // );

    // Only store duration if it's valid
    if (videoDuration && videoDuration !== 0) {
      // console.log(
      //   `Lecture ID: ${lecture.orvl_lecture_name_id}, Current Time: ${currentTime}`
      // );
    
    } else {
      console.error("Video duration is not valid");
    }
  };

  const handleReady = () => {
    console.log("Player is ready");

    if (!playerRef.current) {
      console.log("Player reference is null or undefined");
      return;
    }

    let duration = playerRef.current.getDuration();

    if (duration && duration > 0) {
      setVideoDuration(duration);
      setIsPlayerReady(true);
      //console.log("Video Duration: ", duration);
    } else {
      //console.log("Duration is not available immediately, polling...");
      const durationInterval = setInterval(() => {
        const polledDuration = playerRef.current?.getDuration();
        if (polledDuration && polledDuration > 0) {
          clearInterval(durationInterval);
          setVideoDuration(polledDuration);
          setIsPlayerReady(true);
          //console.log("Video Duration (After Polling): ", polledDuration);
        }
      }, 1000);
    }
  };


  const handlePlay = () => {
    if (isVideoPaused) {
      setIsVideoPaused(false);
    }
  };

  useEffect(() => {

    if (playerRef.current && playerRef.current.getDuration() > 0) {
      setIsPlayerReady(true);
    }
  }, [playerRef]);
  const [solutionTypes, setSolutionTypes] = useState({}); 
  const [solutionVisibility, setSolutionVisibility] = useState(null);

  const currentQuestion = exercise?.questions?.[currentQuestionIndex];

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitAnswer = async () => {
    let submittedAnswer;
    if (currentQuestion.exercise_question_type === 'NATD' || currentQuestion.exercise_question_type === 'MCQ') {
      if (userAnswer.trim() === '') {
        alert('Please submit an answer before proceeding.');
        return; 
      }
    } else if (currentQuestion.exercise_question_type === 'MSQ') {
      if (selectedOptions.length === 0) {
        alert('Please submit an answer before proceeding.');
        return; 
      }
    }
    if (currentQuestion.exercise_question_type === "NATD") {
      submittedAnswer = userAnswer;
    } else if (currentQuestion.exercise_question_type === "MSQ") {
      submittedAnswer = selectedOptions.sort().join(",");
    } else if (currentQuestion.exercise_question_type === "MCQ") {
      submittedAnswer = userAnswer;
    }

    const payload = {
      question_status: 1,
      orvl_topic_id: topicid,
      exercise_question_id:
        exercise?.questions?.[currentQuestionIndex]?.exercise_question_id,
      exercise_name_id: exercise.exercise_name_id,
      student_registration_id: studentId,
      course_creation_id: courseCreationId,
      exercise_userresponse: submittedAnswer,
    };

    setAnswerDisabled(true);

    try {
      const response = await fetch(`${BASE_URL}/OrvlTopics/SubmitUserAnswer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`); 
      }

      const data = await response.json();
      //console.log("Answer submitted successfully:", data);

      await fetchExerciseStatus();
     
    } catch (error) {
      //console.error("Error submitting answer:", error);
      setFeedback("Failed to submit answer. Please try again."); 
    }
  };

  const handleOptionChange = (value) => {
    if (currentQuestion.exercise_question_type === "MCQ") {
      setUserAnswer(value);
    } else if (currentQuestion.exercise_question_type === "MSQ") {
      if (selectedOptions.includes(value)) {
        setSelectedOptions(selectedOptions.filter((opt) => opt !== value));
      } else {
        setSelectedOptions([...selectedOptions, value]);
      }
    }
  };

  const togglePalette = () => {
    setShowPalette(prev => !prev);
  };
  

  const getStatus = (questionId) => {
    if (exerciseStatus && typeof exerciseStatus === "object") {
      const status = exerciseStatus[questionId];
      //console.log(status);
      return status; 
    }
    return undefined;
  };

  const answeredCount = Object.values(exerciseStatus || {}).filter(
    (status) => status === "answered"
  ).length;
  const unansweredCount = Object.values(exerciseStatus || {}).filter(
    (status) => status === "unanswered"
  ).length;
  const notVisitedCount = Object.values(exerciseStatus || {}).filter(
    (status) => status === "unvisited"
  ).length;
  return (
    <div className={styles.popup_overlay}>
      <div className={styles.popup_content}>
        {/* Header */}
        <div className={styles.headerForCloseSndHeading}>
          <div className={styles.headingForLectures}>
            {exercise ? exercise.exercise_name : lecture?.orvl_lecture_name}
          </div>
          <div className={styles.CloseBtnForPopup}>
            <button onClick={onClose}>
              <IoClose />
            </button>
          </div>
        </div>

        <div className={styles.popup_body}>
          {/* Previous Lecture Button */}
          <button
            onClick={previousLectureOrExercise}
            className={`${styles.side_nav_button} ${styles.previousBtn}`}
          >
            <GrPrevious />
          </button>

          <div className={styles.popup_main_content}>
            {exercise && exercise.questions?.length > 0 ? (
              <div className={styles.slideshow}>
                {/* Question Section */}
                <div className={styles.ExerciseQuestionContainers}>
                  <div className={styles.QuestionsAndImgScrollContainer}>
                    <div className={styles.QuestionTypeAndID}>
                      <h4>
                        Question No :{" "}
                        {currentQuestion.exercise_question_sort_id}
                      </h4>
                      <p>Type : {currentQuestion.exercise_question_type}</p>
                      {isMobile && (
  <div className={styles.toggleIcon} onClick={togglePalette}>
    {showPalette ? (
      <span className={styles.closeIcon}>&#10006;</span>  // ✖ Close icon
    ) : (
      <span className={styles.hamburgerIcon}>&#9776;</span>  // ☰ Hamburger
    )}
  </div>
)}

                    </div>

                    {/* Question Image */}
                    {currentQuestion.exercise_question_img && (
                      <div className={styles.img_container}>
                        <img
                          src={currentQuestion.exercise_question_img}
                          alt={`Question ${currentQuestionIndex + 1}`}
                        />
                      </div>
                    )}

                    {/* NATD Input */}
                    {currentQuestion.exercise_question_type === "NATD" && (
                      <div className={styles.calc_container}>
                        <input
                          type="text"
                          value={userAnswer}
                          ref={inputRef}
                          disabled={answerDisabled}
                          className={styles.inputnat}
                          placeholder="Enter your answer"
                        />
                        {currentQuestion.exercise_answer_unit}
                        <div className={styles.calcButtonsContainer}>
                          <button
                            className={styles.backslash}
                            onClick={() => handleNatipChange("BACK SPACE")}
                            disabled={answerDisabled}
                          >
                            BACK SPACE
                          </button>
                          <div className={styles.keypad}>
                            {[
                              "7",
                              "8",
                              "9",
                              "4",
                              "5",
                              "6",
                              "1",
                              "2",
                              "3",
                              "0",
                              ".",
                              "-",
                            ].map((key) => (
                              <button
                                key={key}
                                onClick={() => handleNatipChange(key)}
                                disabled={answerDisabled}
                              >
                                {key}
                              </button>
                            ))}
                          </div>
                          <div className={styles.calcLeftRightArrows}>
                            <button
                              disabled={answerDisabled}
                              onClick={() => handleArrowClick("left")}
                            >
                              ←
                            </button>
                            <button
                              disabled={answerDisabled}
                              onClick={() => handleArrowClick("right")}
                            >
                              →
                            </button>
                          </div>
                          <div className={styles.clearAll}>
                            <button
                              onClick={handleClearAll}
                              disabled={answerDisabled}
                            >
                              CLEAR ALL
                            </button>
                          </div>{" "}
                        </div>
                      </div>
                    )}

                    {/* Options (MCQ/MSQ) */}
                    {(currentQuestion.exercise_question_type === "MCQ" ||
                      currentQuestion.exercise_question_type === "MSQ") &&
                      currentQuestion.options?.length > 0 && (
                        <div className={styles.options_container}>
                          {currentQuestion.options.map((option) => (
                            <label key={option.exercise_option_id}>
                              <input
                                type={
                                  currentQuestion.exercise_question_type ===
                                  "MSQ"
                                    ? "checkbox"
                                    : "radio"
                                }
                                name={`question_${currentQuestion.exercise_question_id}`}
                                value={option.exercise_option_index}
                                checked={
                                  currentQuestion.exercise_question_type ===
                                  "MSQ"
                                    ? selectedOptions.includes(
                                        option.exercise_option_index
                                      )
                                    : userAnswer ===
                                      option.exercise_option_index
                                }
                                onChange={() =>
                                  handleOptionChange(
                                    option.exercise_option_index
                                  )
                                }
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
                    {feedback && <div>{feedback}</div>}
                  </div>

                  {/* Feedback */}

                  {/* Navigation Buttons */}
                  <div className={styles.navigation_buttons}>
                    {currentQuestionIndex > 0 && (
                      <button onClick={previousQuestion}>
                        Previous Question
                      </button>
                    )}
                    {!answerDisabled && (
                      <button onClick={handleSubmitAnswer}>Submit</button>
                    )}
                    {answerDisabled && (
                      <button
                        onClick={() => {
                          setSolutionVisibility(
                            currentQuestion.exercise_question_id
                          );
                          setSolutionTypes((prev) => ({
                            ...prev,
                            [currentQuestion.exercise_question_id]:
                              solutionVideo ? "video" : "image",
                          }));
                        }}
                      >
                        View Solution
                      </button>
                    )}

                    {currentQuestionIndex < exercise.questions.length - 1 && (
                      <button onClick={nextQuestion}>Next Question</button>
                    )}
                  </div>
                </div>
                {/* Status Palette */}
                {showPalette && (

<div
className={`${styles.exercise_question_Subcontainer} ${
showPalette ? styles.showPaletteMobile : ""
}`}
>

                  <div className={styles.status_pallete}>
                    <div className={styles.status_pallete_container}>
                      {exercise.questions.map((question, index) => {
                        const status = getStatus(question.exercise_question_id);
                        return (
                          <span
                            key={question.exercise_question_id}
                            className={`${styles.status_item} ${
                              styles[getStatus(question.exercise_question_id)]
                            }`}
                            title={`Question ${index + 1}: ${status}`}
                            onClick={() => setCurrentQuestionIndex(index)}
                          >
                            {index + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className={styles.CircleForAllWrapers}>
                    <div className={styles.HeadingForLegend}>Legend</div>

                    <div className={styles.circleWrapper}>
                      <p className={`${styles.circle} ${styles.unanswered}`}>
                        <span>{unansweredCount}</span>
                      </p>
                      <span className={styles.fntSize}>Not answered</span>
                    </div>
                    <div className={styles.circleWrapper}>
                      <p className={`${styles.circle} ${styles.answered}`}>
                        <span>{answeredCount}</span>
                      </p>
                      <span>Answered</span>
                    </div>
                    <div className={styles.circleWrapper}>
                      <p className={`${styles.circle} ${styles.unvisited}`}>
                       <span>{notVisitedCount}</span> 
                      </p>
                      <span>Not Visited</span>
                    </div>
                  </div>
                </div>
                )}
              </div>
            ) : lecture ? (
              <div className={styles.lecture_video_React_Player}>
                {/* <h2>{lecture.orvl_lecture_name}</h2> */}
                {lecture.lecture_video_link && (
                  <ReactPlayer
                    ref={playerRef}
                    url={lecture.lecture_video_link}
                    playing={false}
                    controls={true}
                    width="100%"
                    height="100%"
                    onReady={handleReady}
                    onProgress={handleProgress}
                    onPause={handlePause}
                    onPlay={handlePlay}
                    seekTo={isPlayerReady ? playedTimeRef.current : 0}
                    playbackRate={1}
                    config={{
                      vimeo: {
                        playerOptions: {
                          controls: true,
                          autopause: true,
                          autoplay: false,
                        },
                      },
                    }}
                  />
                )}
              </div>
            ) : (
              <div>No data available</div>
            )}
          </div>

          {/* Next Lecture Button */}
          <button
            onClick={nextLectureOrExercise}
            className={`${styles.side_nav_button} ${styles.nextBtn}`}
          >
            <GrNext />
          </button>
        </div>
      </div>
      {exercise &&
        currentQuestion &&
        solutionVisibility === currentQuestion.exercise_question_id && (
          <div className={styles.solutionModalOverlay}>
            <div className={styles.solutionModalContent}>
              <button
                className={styles.solutionModalCloseBtn}
                onClick={() => setSolutionVisibility(null)}
              >
                <IoClose />
              </button>
              <div className={styles.solutionSection}>
                <div className={styles.solutionButtons}>
                  {solutionVideo && (
                    <button
                      className={
                        solutionTypes[currentQuestion.exercise_question_id] ===
                        "video"
                          ? styles.activeButton
                          : ""
                      }
                      onClick={() =>
                        setSolutionTypes((prev) => ({
                          ...prev,
                          [currentQuestion.exercise_question_id]: "video",
                        }))
                      }
                    >
                      Video Solution
                    </button>
                  )}
                  {solutionImage && (
                    <button
                      className={
                        solutionTypes[currentQuestion.exercise_question_id] ===
                        "image"
                          ? styles.activeButton
                          : ""
                      }
                      onClick={() =>
                        setSolutionTypes((prev) => ({
                          ...prev,
                          [currentQuestion.exercise_question_id]: "image",
                        }))
                      }
                    >
                      Image Solution
                    </button>
                  )}
                </div>

                <div className={styles.solutionDisplay}>
                  {solutionTypes[currentQuestion.exercise_question_id] ===
                    "video" &&
                    solutionVideo && (
                      <iframe
                        src={solutionVideo}
                        title="Video Solution"
                        width="100%"
                        height="400"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.solutionVideoIframe}
                      ></iframe>
                    )}

                  {solutionTypes[currentQuestion.exercise_question_id] ===
                    "image" &&
                    solutionImage && (
                      <img
                        src={solutionImage}
                        alt="Solution"
                        className={styles.solutionImage}
                      />
                    )}
                </div>
              </div>{" "}
            </div>
          </div>
        )}
    </div>
  );
};

export default Popup;
