import React from 'react';

const LectureExerciseList = ({ lectures, onLectureClick, onExerciseClick }) => {
  return (
    <div>
      {lectures.map((lecture) => (
        <div key={lecture.orvl_lecture_name_id} style={{ marginBottom: '20px' }}>
          {/* Display the lecture button */}
          <div>
            <button
              onClick={() => onLectureClick(lecture)}
              style={{ marginBottom: '10px', fontSize: '18px' }}
            >
              {lecture.orvl_lecture_name}
            </button>
          </div>

          {/* Display the exercises for the current lecture */}
          <div>
            <h3>Exercises</h3>
            {lecture.exercises.map((exercise) => (
              <button
                key={exercise.exercise_name_id}
                onClick={() => onExerciseClick(exercise)}
                style={{ marginRight: '10px', marginTop: '5px' }}
              >
                {exercise.exercise_name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LectureExerciseList;
