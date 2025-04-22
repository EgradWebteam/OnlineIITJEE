import React, { useState, useEffect } from "react";
import globalCSS from "../../../Styles/Global.module.css";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL";
import axios from "axios";
import { MdOutlineDeleteForever } from "react-icons/md";

const StudentDashboardBookmarks = ({ studentId }) => {
  const [testPaperData, setTestPaperData] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [showVideoSolution, setShowVideoSolution] = useState(false);

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

  const toggleSolution = () => {
    setShowSolution((prev) => !prev);
  };

  const toggleVideoSolution = () => {
    setShowVideoSolution((prev) => !prev);
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
      <div>
        {testPaperData.subjects?.map((subject) => (
          <div
            className={styles.questionsContainerInBookMarks}
            key={subject.subjectId}
          >
            {subject.sections.map((section) => (
              <div key={section.sectionId}>
                {section.questions.map((question) => (
                  <div
                    key={question.question_id}
                    style={{ marginBottom: "2rem" }}
                  >
                    {/* ✅ Show Test Name with each question */}
                    <div className={styles.bookMarksTestName}>
                      <h4>{testPaperData.TestName}</h4>
                    </div>

                    <h3>Subject: {subject.SubjectName}</h3>
                    <h4>Section: {section.SectionName}</h4>

                    <p>Question No: {question.question_id}</p>

                    {/* Question Image */}
                    <img
                      src={question.questionImgName}
                      alt={`Question ${question.question_id}`}
                      style={{ width: "300px", height: "auto" }}
                    />

                    {/* Delete Icon */}
                    <MdOutlineDeleteForever
                      size={24}
                      color="red"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleDelete(studentId, question.question_id)
                      }
                      title="Delete Bookmark"
                    />

                    {/* Options */}
                    <div style={{ marginTop: "1rem" }}>
                      {question.options.map((option) => (
                        <div
                          key={option.option_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <strong>({option.option_index})</strong>
                          <img
                            src={option.optionImgName}
                            alt={`Option ${option.option_index}`}
                            style={{
                              width: "150px",
                              height: "auto",
                              marginLeft: "10px",
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Solution Toggle */}
                    {question.solution?.solutionImgName && (
                      <div style={{ marginTop: "1rem" }}>
                        <button onClick={toggleSolution}>
                          {showSolution ? "Hide Solution" : "View Solution"}
                        </button>

                        {showSolution && (
                          <div style={{ marginTop: "1rem" }}>
                            <p>
                              <strong>Solution:</strong>
                            </p>
                            <img
                              src={question.solution.solutionImgName}
                              alt="Solution"
                              style={{ width: "300px", height: "auto" }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Check for video solution link and display button if available */}
                    {question.solution?.solutionImgName &&
                      question.solution?.video_solution_link !== "" && (
                        <div style={{ marginTop: "1rem" }}>
                          <button onClick={toggleVideoSolution}>
                            {" "}
                            {showVideoSolution
                              ? "Hide Video Solution"
                              : "View Video Solution"}
                          </button>

                          {showVideoSolution && (
                            <div style={{ marginTop: "1rem" }}>
                              <p>
                                <strong>Video Solution:</strong>
                                <iframe
                                  src={PlayVideoById(
                                    question.solution.video_solution_link
                                  )}
                                  title="Video Solution"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ width: "100%", height: "400px" }} // Add styling to ensure it fits well in the page
                                />
                              </p>
                            </div>
                          )}
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
