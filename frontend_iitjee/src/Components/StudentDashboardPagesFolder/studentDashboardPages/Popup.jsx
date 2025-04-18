import React from 'react';
import ReactPlayer from 'react-player'; // Assuming ReactPlayer is installed for video playback

const Popup = ({ lecture, exercise, onClose,previousLectureOrExercise,nextLectureOrExercise }) => {
    
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={onClose}>Close</button>
        <button onClick={previousLectureOrExercise}>Previous</button>
       
        {lecture ? (
          <div>
            <h2>{lecture.orvl_lecture_name}</h2>
            {lecture.lecture_video_link && (
              <ReactPlayer url={lecture.lecture_video_link} controls width="100%" />
            )}
          </div>
        ) : exercise ? (
          <div>
            <h2>{exercise.exercise_name}</h2>
            <div>
              {exercise.questions.map((question) => (
                <div key={question.exercise_question_id}>
                  <p>{question.exercise_question_type}</p>
                  {question.exercise_question_img && (
                    <img
                      src={question.exercise_question_img}
                      alt="exercise question"
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  )}
                  <p>{question.exercise_answer}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>No data available</div>
          
        )}
         <button onClick={nextLectureOrExercise}>Next</button>
      </div>
    </div>
  );
};

export default Popup;
