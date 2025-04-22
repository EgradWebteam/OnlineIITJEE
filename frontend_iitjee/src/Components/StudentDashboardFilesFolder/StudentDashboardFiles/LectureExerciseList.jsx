import React from 'react';
import { FaVideo } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { FaCheckCircle } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../../../Styles/StudentDashboardCSS/LectureExcerciseList.module.css';
 
const LectureExerciseList = ({ lectures, onLectureClick, onExerciseClick, userStatus }) => {
  return (
    <div className={styles.lectureExcerciseDetails}>
      {lectures.map((lecture) => {
        // Get video progress for this lecture
        const videoInfo = userStatus?.videoCount?.find(
          (v) => v.lectureId === lecture.orvl_lecture_name_id
        );
 console.log(videoInfo)
        const videoProgress = videoInfo && videoInfo.totalVideoTime > 0
          ? Math.min((videoInfo.progress_time / videoInfo.totalVideoTime) * 100, 100)
          : 0;
 const videoCount = videoInfo  ? videoInfo.videoCount:0;
        return (
          <div key={lecture.orvl_lecture_name_id} className={styles.LectureexcerciseContainer}>
            <div className={styles.LectureVideosContent}>
              <div className={styles.VideoBtn}>
                <button onClick={() => onLectureClick(lecture)}>
                  <div className={styles.VideoIcon}>
                    <div>
                      <FaVideo /> {lecture.orvl_lecture_name}
                    </div>
                    <div style={{ width: 40, height: 40, marginLeft: 10 }}>
                      {/* Conditionally show the tick mark or progress bar */}
                      {videoProgress === 100 || videoCount > 0  ? (
                          <FaCheckCircle style={{ fontSize: '20px' }} title="Completed" />
                      ) : (
                        <CircularProgressbar
                          value={videoProgress}
                          text={`${Math.round(videoProgress)}%`}
                          styles={buildStyles({
                            textSize: '30px',
                            pathColor: '#00aaff',
                            textColor: '#000',
                            trailColor: '#d6d6d6',
                          })}
                        />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
 
            <div className={styles.LectureExerciseContent}>
              {lecture.exercises.map((exercise) => {
                const exerciseInfo = userStatus?.exerciseDetails?.find(
                  (e) => e.exerciseId === exercise.exercise_name_id
                );
 
                const attempted = exerciseInfo?.answeredQuestions || 0;
                const total = exerciseInfo?.totalQuestions || 0;
 
                return (
                  <div key={exercise.exercise_name_id} className={styles.ExcerciseBtn}>
                    <button onClick={() => onExerciseClick(exercise)}>
                      <div className={styles.VideoIcon}>
                        <div>
                          <FaFileAlt /> {exercise.exercise_name}
                        </div>
                        <div style={{ marginLeft: 10 }}>
                          {attempted === total && total > 0 ? (
                            <FaCheckCircle style={{ fontSize: '20px' }} title="Completed" />
                          ) : (
                            <span style={{ fontSize: '14px', color: "white" }}>{attempted} / {total}</span>
                          )}
                        </div>
 
 
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
 
export default LectureExerciseList;
 
 