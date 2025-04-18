import React, { useState, memo, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { IoClose } from 'react-icons/io5';
import { GrPrevious, GrNext } from 'react-icons/gr';

// Memoized icons
export const MemoizedIoClose = memo(IoClose);
export const MemoizedGrPrevious = memo(GrPrevious);
export const MemoizedGrNext = memo(GrNext);

const Popup = ({
  lecture,
  exercise,
  onClose,
  previousLectureOrExercise,
  nextLectureOrExercise
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerDisabled, setAnswerDisabled] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Reset state when a new exercise loads
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback('');
    setAnswerDisabled(false);
  }, [exercise]);

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const nextQuestion = () => {
    if (exercise && currentQuestionIndex < exercise.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    setFeedback('Answer submitted!');
    // Optionally disable further input
    // setAnswerDisabled(true);
  };

  const handleNatChange = (e) => {
    setUserAnswer(e.target.value);
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

        {/* ✅ Exercise View Takes Priority */}
        {exercise && exercise.questions && exercise.questions.length > 0 ? (
          <div className="slideshow">
            <div className="SlideShow_Heading_container">
              <h2>{exercise.exercise_name}</h2>
            </div>

            <div className="exercise-question-container">
              <h4>
                {exercise.questions[currentQuestionIndex]?.exercise_question_sort_id}
              </h4>

              <p>{exercise.questions[currentQuestionIndex]?.exercise_question_type}</p>

              {exercise.questions[currentQuestionIndex]?.exercise_question_img && (
                <div className="img-container">
                  <img
                    src={exercise.questions[currentQuestionIndex].exercise_question_img}
                    alt={`Question ${currentQuestionIndex + 1}`}
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* NATD Input */}
              {exercise.questions[currentQuestionIndex]?.exercise_question_type === 'NATD' && (
                <div className="calc-container">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={handleNatChange}
                    disabled={answerDisabled}
                    className="inputnat"
                    placeholder="Enter your answer"
                  />
                </div>
              )}
            </div>

            {feedback && <div>{feedback}</div>}

            <form onSubmit={handleSubmitAnswer}>
              <div className="navigation-buttons-for-ques">
                {currentQuestionIndex > 0 && (
                  <button type="button" onClick={previousQuestion}>
                    Previous Question
                  </button>
                )}
                {!answerDisabled && (
                  <button type="submit">Submit</button>
                )}
                {answerDisabled && (
                  <button type="button" onClick={() => setFeedback('Solution displayed!')}>
                    View Solution
                  </button>
                )}
                {currentQuestionIndex < exercise.questions.length - 1 && (
                  <button type="button" onClick={nextQuestion}>
                    Next Question
                  </button>
                )}
              </div>
            </form>
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
};

export default Popup;
