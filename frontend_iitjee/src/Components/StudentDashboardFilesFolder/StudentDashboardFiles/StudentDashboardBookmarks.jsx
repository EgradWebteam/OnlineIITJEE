import React, { useState, useEffect } from "react";
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL";
import axios from "axios";
import { MdOutlineDeleteForever } from "react-icons/md";

const StudentDashboardBookmarks = ({ studentId }) => {
  const [testPaperData, setTestPaperData] = useState([]);

  const [visibleSolutions, setVisibleSolutions] = useState({});
  const [visibleVideoSolutions, setVisibleVideoSolutions] = useState({});

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/studentBookMarks/BookMarkQuestionOptions/${studentId}`
        );
        setTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [studentId]);

  const handleDelete = async (studentId, questionId) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      try {
        await axios.delete(
          `${BASE_URL}/studentBookMarks/DeleteBookmark/${studentId}/${questionId}`
        );
        // Remove the deleted question from state
        setTestPaperData((prevData) => {
          const updatedSubjects = prevData.subjects.map((subject) => ({
            ...subject,
            sections: subject.sections.map((section) => ({
              ...section,
              questions: section.questions.filter(
                (q) => q.question_id !== questionId
              ),
            })),
          }));
          return { ...prevData, subjects: updatedSubjects };
        });
      } catch (err) {
        console.error("Error deleting bookmark:", err);
      }
    }
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

  return (
    <div className={styles.studentDashboardBookMarksMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>BookMarks</h3>
      </div>
      <div className={styles.BookMarksSubDivForScroll}>
        {/* ✅ Show Test Name with each question */}
        <div className={styles.bookMarksTestName}>
          <h4>
  
            {testPaperData.TestName}
          </h4>
        </div>

        {testPaperData.subjects?.map((subject) => (
          <div key={subject.subjectId}>
            {subject.sections.map((section) => (
              <div key={section.sectionId}>
                {section.questions.map((question) => (
                  <div
                    key={question.question_id}
                    className={styles.questionsContainerInBookMarks}
                  >
                    <div className={styles.bookDeleteConatainer}>
                      <p>Question No: {question.question_id}</p>

                      {/* Delete Icon */}
                      <MdOutlineDeleteForever
                        className={styles.deleteIconForBookMarks}
                        onClick={() =>
                          handleDelete(studentId, question.question_id)
                        }
                        title="Delete Bookmark"
                      />
                    </div>

                    {/* Question Image */}
                    <div className={styles.questionImageDivBookMarks}>
                      <img
                        src={question.questionImgName}
                        alt={`Question ${question.question_id}`}
                      />
                    </div>

                    {/* Options */}
                    <div style={{ marginTop: "1rem" }}>
                      {[...question.options]
                        .sort((a, b) =>
                          a.option_index.localeCompare(b.option_index)
                        ) // Sort A to Z
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
                            <div className={styles.optionImageDivInBookMarks}>
                              <img
                                src={option.optionImgName}
                                alt={`Option ${option.option_index}`}
                              />
                            </div>
                          </div>
                        ))}
                    </div>

                    {question.solution?.solutionImgName && (
                      <div className={styles.solutionButtonsWrapper}>
                        {/* View Solution Button */}
                        <button
                          onClick={() => toggleSolution(question.question_id)}
                          className={styles.solutionBtnInBookMarks}
                        >
                          {visibleSolutions[question.question_id]
                            ? "Hide Solution"
                            : "View Solution"}
                        </button>

                        {/* View Video Solution Button */}
                        {question.solution.video_solution_link && (
                          <button
                            onClick={() =>
                              toggleVideoSolution(question.question_id)
                            }
                            className={styles.solutionBtnInBookMarks}
                          >
                            {visibleVideoSolutions[question.question_id]
                              ? "Hide Video Solution"
                              : "View Video Solution"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Solution Image */}
                    {visibleSolutions[question.question_id] &&
                      question.solution?.solutionImgName && (
                        <div className={styles.solutionsMainDivInBookMarks}>
                          <p>
                            <strong>Solution:</strong>
                          </p>
                          <div className={styles.solutionsMainDivInBookMarks}>
                            <img
                              src={question.solution.solutionImgName}
                              alt="Solution"
                            />
                          </div>
                        </div>
                      )}

                    {/*  Video Solution */}
                    {visibleVideoSolutions[question.question_id] &&
                      question.solution?.video_solution_link && (
                        <div style={{ marginTop: "1rem" }}>
                          <p>
                            <strong>Video Solution:</strong>
                          </p>
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
                      )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboardBookmarks;
