import React, { useState,memo } from 'react';
import ReactPlayer from 'react-player'; // Assuming ReactPlayer is installed for video playback
import { IoClose } from 'react-icons/io5';
import { GrPrevious, GrNext } from 'react-icons/gr';

// Memoize them to avoid unnecessary re-renders
export const MemoizedIoClose = memo(IoClose);
export const MemoizedGrPrevious = memo(GrPrevious);
export const MemoizedGrNext = memo(GrNext);// Assuming you're using memoized icons

const Popup = ({ lecture, exercise, onClose, previousLectureOrExercise, nextLectureOrExercise }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [answerDisabled, setAnswerDisabled] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Navigate to previous question
    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Navigate to next question
    const nextQuestion = () => {
        if (currentQuestionIndex < exercise.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // Submit answer
    const handleSubmitAnswer = (e) => {
        e.preventDefault();
        // Logic to submit the answer (e.g., validate and store the answer)
        setFeedback('Answer submitted!');
        // setAnswerDisabled(true); // Disable further input
    };

    // Handle answer change for NATD type questions
    const handleNatChange = (key) => {
        setUserAnswer((prevAnswer) => prevAnswer + key);
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

                {lecture ? (
                    <div>
                        <h2>{lecture.orvl_lecture_name}</h2>
                        {lecture.lecture_video_link && (
                            <ReactPlayer url={lecture.lecture_video_link} controls width="100%" />
                        )}
                    </div>
                ) : exercise ? (
                    <div className="slideshow">
                        <div className="SlideShow_Heading_container">
                            <h2>{exercise.exercise_name}</h2>
                        </div>

                        <div className="navigation-buttons">
                          

                            <div className="exercise-question-container">
                                <h4>
                                    {exercise.questions[currentQuestionIndex].exercise_question_sort_id}   
                                    {/* {exercise.questions[currentQuestionIndex]?.exercise_question_type === 'MCQ' ? (
                                        <span>{exercise.questions[currentQuestionIndex]?.exercise_answer}</span>
                                    ) : (
                                        <span>{exercise.questions[currentQuestionIndex]?.exercise_answer}</span>
                                    )} */}
                                </h4>
                                {exercise.questions[currentQuestionIndex]?.exercise_question_type}
                                {exercise.questions[currentQuestionIndex]?.exercise_question_img && (
                                    <div className="img-container">
                                        <img
                                            src={exercise.questions[currentQuestionIndex].exercise_question_img}
                                            alt={`Question ${currentQuestionIndex + 1}`}
                                            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}

                                {/* Handling user input */}
                                {exercise.questions[currentQuestionIndex].exercise_question_type === 'NATD' ? (
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
                                ) : (
                                    <div>{/* Render options for MCQ if needed */}</div>
                                )}
                            </div>

                            {feedback && <div>{feedback}</div>}

                            <form onSubmit={handleSubmitAnswer}>
                                <div className="navigation-buttons-for-ques">
                                    {currentQuestionIndex > 0 && (
                                        <button onClick={previousQuestion}>Previous Question</button>
                                    )}
                                    {!answerDisabled && (
                                        <button type="submit" disabled={answerDisabled}>
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
                            </form>
                        </div>
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
