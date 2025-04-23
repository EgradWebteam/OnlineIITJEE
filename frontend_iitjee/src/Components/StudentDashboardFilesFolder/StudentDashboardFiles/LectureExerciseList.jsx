import React, { useEffect, useState } from 'react';
import { FaVideo, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../../../Styles/StudentDashboardCSS/LectureExcerciseList.module.css';
import DisableKeysAndMouseInteractions from '../../../ContextFolder/DisableKeysAndMouseInteractions.jsx';
 


 
 

 
// ✅ Vite + ESM worker setup
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';

// Set the PDF worker
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const LectureExerciseList = ({ lectures, onLectureClick, onExerciseClick, userStatus, orvlpdf }) => {
  const [pdfpopup, setPdfpopup] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdf, setPdf] = useState(null);
  DisableKeysAndMouseInteractions();
  // Load PDF when URL changes
  useEffect(() => {
    if (pdfUrl) {
      pdfjsLib.getDocument(pdfUrl)
        .promise.then(setPdf)
        .catch((error) => console.error("Failed to load PDF:", error));
    }
  }, [pdfUrl]);

  // Render the PDF when loaded
  useEffect(() => {
    if (pdf) renderPdf();
  }, [pdf]);

  const handleOpenPdf = (fileName) => {
    const url = `${fileName}`;
    setPdfUrl(url);
    setPdfpopup(true);
  };

  const handleClosePopup = () => {
    setPdfpopup(false);
    setPdfUrl("");
    setPdf(null);
  };

  const renderPdf = () => {
    if (pdf) {
      const container = document.getElementById("pdfContainer");
      if (container) container.innerHTML = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          page.render({ canvasContext: context, viewport }).promise.then(() => {
            if (container) container.appendChild(canvas);
          });
        });
      }
    }
  };

  return (
    <>
      <div className={styles.lectureExcerciseDetails}>
        {lectures.map((lecture) => {
          const videoInfo = userStatus?.videoCount?.find(
            (v) => v.lectureId === lecture.orvl_lecture_name_id
          );
          const videoProgress = videoInfo && videoInfo.totalVideoTime > 0
            ? Math.min((videoInfo.progress_time / videoInfo.totalVideoTime) * 100, 100)
            : 0;
          const videoCount = videoInfo ? videoInfo.videoCount : 0;

          return (
            <div key={lecture.orvl_lecture_name_id} className={styles.LectureexcerciseContainer}>
              <div className={styles.LectureVideosContent}>
                <div className={styles.VideoBtn}>
                  <button onClick={() => onLectureClick(lecture)}>
                    <div className={styles.VideoIcon}>
                      <div><FaVideo /> {lecture.orvl_lecture_name}</div>
                      <div className={styles.ExerciesCircleProgress}>
                        {videoProgress === 100 || videoCount > 0 ? (
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
                 
                  const exerciseProgress = total > 0 ? Math.min((attempted / total) * 100, 100) : 0;
                  return (
                    <div key={exercise.exercise_name_id} className={styles.ExcerciseBtn}>
                      <button onClick={() => onExerciseClick(exercise)}>
                        <div className={styles.VideoIcon}>
                          <div><FaFileAlt /> {exercise.exercise_name}</div>
                          <div  className={styles.ExerciesCircleProgress}>
                            {attempted === total && total > 0 ? (
                              <FaCheckCircle style={{ fontSize: '20px' }} title="Completed" />
                            ) : (

                              <CircularProgressbar
                              value={exerciseProgress}
                              text={`${Math.round(exerciseProgress)}%`}
                              styles={buildStyles({
                                textSize: "30px",
                                pathColor: "#00cc66",
                                textColor: "#000",
                                trailColor: "#eee",
                              })}
                            />
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
           {orvlpdf && (
        <div className={styles.VideoIcon}>
          <button className={styles.PdfBtn} onClick={() => handleOpenPdf(orvlpdf)}>
            📄 {decodeURIComponent(orvlpdf.split('/').pop()?.replace(/^\d+_/, '').replace(/\.pdf.*$/i, ''))}
          </button>
        </div>
      )}
      </div>

      {/* PDF Button */}
   

      {/* PDF Popup */}
      {pdfpopup && (
        <div className={styles.pdfMainContainer}>
          <div className={styles.pdfSubContainer}>
            <div className={styles.pdfCloseWrapper}>
              <button onClick={handleClosePopup} className={styles.btnClosePdf}>Close ✖</button>
            </div>
            <div id="pdfContainer"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default LectureExerciseList;
