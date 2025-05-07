import React, { useState, useEffect } from "react";
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import Styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL";
import axios from "axios";
import { MdOutlineDeleteForever } from "react-icons/md";
import LoadingSpinner from "../../../ContextFolder/LoadingSpinner";

const StudentDashboardBookmarks = ({ studentId }) => {
  const [testPaperData, setTestPaperData] = useState([]);
   const [loading, setLoading] = useState(true);
  const [visibleSolutions, setVisibleSolutions] = useState({});
  const [visibleVideoSolutions, setVisibleVideoSolutions] = useState({});
    const [videoPopup, setVideoPopup] = useState(null);

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        setLoading(true); 
        const response = await axios.get(
          `${BASE_URL}/studentBookMarks/BookMarkQuestionOptions/${studentId}`
        );
        setTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }finally {
        setLoading(false);
      }
    };

    fetchTestPaper();
  }, [studentId]);

  // const handleDelete = async (studentId, questionId) => {
  //   if (window.confirm("Are you sure you want to delete this bookmark?")) {
  //     try {
  //       await axios.delete(
  //         `${BASE_URL}/studentBookMarks/DeleteBookmark/${studentId}/${questionId}`
  //       );
  //       // Remove the deleted question from state
  //       setTestPaperData((prevData) => {
  //         const updatedSubjects = prevData.subjects.map((subject) => ({
  //           ...subject,
  //           sections: subject.sections.map((section) => ({
  //             ...section,
  //             questions: section.questions.filter(
  //               (q) => q.question_id !== questionId
  //             ),
  //           })),
  //         }));
  //         return { ...prevData, subjects: updatedSubjects };
  //       });
  //     } catch (err) {
  //       console.error("Error deleting bookmark:", err);
  //     }
  //   }
  // };

  const handleDelete = async (studentId, questionId) => {
    // if (window.confirm("Are you sure you want to delete this bookmark?")) {
      try {
        await axios.delete(
          `${BASE_URL}/studentBookMarks/DeleteBookmark/${studentId}/${questionId}`
        );

        setTestPaperData((prevData) => {
          const updatedSubjects = prevData.subjects
            .map((subject) => ({
              ...subject,
              sections: subject.sections.map((section) => ({
                ...section,
                questions: section.questions.filter(
                  (q) => q.question_id !== questionId
                ),
              })),
            }))
            .filter((subject) =>
              subject.sections.some(
                (section) => section.questions.length > 0
              )
            );

          const anyQuestionsLeft = updatedSubjects.some((subject) =>
            subject.sections.some((section) => section.questions.length > 0)
          );

          if (!anyQuestionsLeft) {
            return {};
          }

          return {
            ...prevData,
            subjects: updatedSubjects,
          };
        });
      } catch (err) {
        console.error("Error deleting bookmark:", err);
      }
    // }
  };

  const toggleSolution = (questionId) => {
    setVisibleSolutions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const toggleVideoSolution = (questionId) => {
    setVisibleVideoSolutions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const PlayVideoById = (url) => {
    if (typeof url !== "string" || !url || url === "null") {
      console.error("Invalid URL:", url);
      return "";
    }

    let videoId = "";

    // Handle 'youtu.be' format
    if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    // Handle 'youtube.com/watch?v=' format
    else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1].split("&")[0];
    }
    // Handle '/v/' format
    else if (url.includes("/v/")) {
      videoId = url.split("/v/")[1].split("?")[0];
    }

    // If a valid video ID is found, return the embed link
    if (videoId) {
      console.log("Extracted Video ID:", videoId);
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    console.error("Unrecognized URL format:", url); // Log for debugging
    return "";
  };

  const isEmpty =
  !testPaperData.subjects ||
  testPaperData.subjects.length === 0 ||
  testPaperData.subjects.every((subject) =>
    subject.sections.every((section) => section.questions.length === 0)
  );
  const openVideoPopup = (questionId) => {
    setVideoPopup(questionId);
    setVisibleSolutions(false);
  };

  const closeVideoPopup = () => {
    setVideoPopup(null);
  };

  return (
    <div className={styles.studentDashboardBookMarksMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>BookMarks</h3>
      </div>
  
      <div className={styles.BookMarksSubDivForScroll}>
      {loading ? ( // <-- Loading spinner block
          <div className={globalCSS.loadingContainer}>
            <p className={globalCSS.loadingText}><LoadingSpinner/></p>
          </div>
        ) :
      isEmpty ? (
          <div className={globalCSS.noCoursesContainer}>
            <p className={globalCSS.noCoursesMsg}>You have not yet bookmarked anything.</p>
          </div>
        ) : (
          <>
            {/* ✅ Test Name */}
            <div className={styles.bookMarksTestName}>
              <h4>{testPaperData.TestName}</h4>
            </div>

            {testPaperData.subjects?.map((subject) => (
              <div key={subject.subjectId}>
                {subject.sections.map((section) => (
                  <div key={section.sectionId}>
                    {section.questions.map((question, index) => (
                      <div
                        key={question.question_id}
                        className={styles.questionsContainerInBookMarks}
                      >
                        <div className={styles.bookDeleteConatainer}>
                          <p>Question No: {index + 1}</p>
                          <MdOutlineDeleteForever
                            className={styles.deleteIconForBookMarks}
                            onClick={() =>
                              handleDelete(studentId, question.question_id)
                            }
                            title="Delete Bookmark"
                          />
                        </div>
                     <div className={styles.QuestionImgContainer}>
                        <div className={styles.questionImageDivBookMarks}>
                          <img
                            src={question.questionImgName}
                            alt={`Question ${question.question_id}`}
                          />
                        </div>

                        <div style={{ marginTop: "1rem" }}>
                          {[...question.options]
                            .sort((a, b) =>
                              a.option_index.localeCompare(b.option_index)
                            )
                            .map((option) => (
                              <div
                                key={option.option_id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                <strong>({option.option_index})</strong>
                                <div
                                  className={styles.optionImageDivInBookMarks}
                                >
                                  <img
                                    src={option.optionImgName}
                                    alt={`Option ${option.option_index}`}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
</div>
                        {question.solution?.solutionImgName && (
                          <div className={styles.solutionButtonsWrapper}>
                            <button
                              onClick={() =>
                                toggleSolution(question.question_id)
                              }
                              className={styles.solutionBtnInBookMarks}
                            >
                              {visibleSolutions[question.question_id]
                                ? "Hide Solution"
                                : "View Solution"}
                            </button>

                           {question.solution?.solutionImgName &&
                                                     question.solution?.video_solution_link !== "" && (
                                                       <div className={Styles.showSolutionButton}>
                              <button
                                onClick={() =>
                                  openVideoPopup(question.question_id)
                                }
                                className={styles.solutionBtnInBookMarks}
                              >
                                {videoPopup === question.question_id
                                  ? "Hide Video Solution"
                                  : "View Video Solution"}
                              </button>
                              </div>
                            )}
                          </div>
                        )}

                        {visibleSolutions[question.question_id] &&
                          question.solution?.solutionImgName && (
                            <div
                              className={styles.solutionsMainDivInBookMarksContainer}
                            >
                                 <p className={Styles.solutionTag}>
                                <strong>Solution:</strong>
                              </p>
                              <div
                                className={styles.solutionsMainDivInBookMarks}
                              >
                                <img
                                  src={question.solution.solutionImgName}
                                  alt={`Solution for question ${question.question_id}`}
                                />
                              </div>
                            </div>
                          )}

{videoPopup === question.question_id && (
                           <div className={Styles.videoModalOverlay}>
                                                   <div className={Styles.videoModalContent}>
                                                     <p className={Styles.solutionTag}>Video Solution:</p>
                             <button
                                                         className={Styles.closeVideoModalBtn}
                                                         onClick={closeVideoPopup}
                                                       >
                                                         ✖
                                                       </button>
                              <iframe
                                src={PlayVideoById(
                                  question.solution.video_solution_link
                                )}
                                title="Video Solution"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: "100%", height: "400px" }}
                              />
                            </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
  
};

export default StudentDashboardBookmarks;
