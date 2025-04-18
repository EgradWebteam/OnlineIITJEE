import React from 'react';
import { FaVideo } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import styles from '../../../Styles/StudentDashboardCSS/LectureExcerciseList.module.css'

const LectureExerciseList = ({ lectures, onLectureClick, onExerciseClick }) => {
  return (
    <div className={styles.lectureExcerciseDetails}>
      {lectures.map((lecture) => (
        <div key={lecture.orvl_lecture_name_id} style={{ marginBottom: '20px' }} className={styles.LectureexcerciseContainer}>
          {/* Display the lecture button */}
          <div className={styles.LectureVideosContent}>
            <div className={styles.VideoBtn}>
            <button
              onClick={() => onLectureClick(lecture)}
              style={{ marginBottom: '10px', fontSize: '18px' }}
            >
             <FaVideo /> {lecture.orvl_lecture_name}
            </button>
            </div>
          </div>

          {/* Display the exercises for the current lecture */}
          <div className={styles.LectureExerciseContent}>
          
            {lecture.exercises.map((exercise) => (
              <div className={styles.ExcerciseBtn}>
              <button
                key={exercise.exercise_name_id}
                onClick={() => onExerciseClick(exercise)}
                style={{ marginRight: '10px', marginTop: '5px' }}
              >
               <FaFileAlt /> {exercise.exercise_name}
              </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LectureExerciseList;
