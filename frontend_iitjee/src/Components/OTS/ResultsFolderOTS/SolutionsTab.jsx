import React, { useState, useEffect } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const SolutionsTab = ({ testId, userData, studentId }) => {
  const [testPaperData, setTestPaperData] = useState([]);
  const [selectedSubjectSection, setSelectedSubjectSection] = useState(null);
  const studentContact = userData?.mobile_no;
  const [visibleSolutions, setVisibleSolutions] = useState({});
  const [videoVisible, setVideoVisible] = useState({});
  const [videoPopup, setVideoPopup] = useState(null); // null or question_id

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/MyResults/StudentReportQuestionPaper/${testId}/${studentId}`
        );
        const data = response.data;
        setTestPaperData(data);

        // Automatically select first subject-section
        if (data?.subjects?.length > 0) {
          const firstSubject = data.subjects[0];

          if (firstSubject.sections && firstSubject.sections.length > 0) {
            const firstSection = firstSubject.sections[0];
            setSelectedSubjectSection({
              SubjectName: firstSubject.SubjectName,
              SectionName: firstSection.SectionName,
              questions: firstSection.questions || [],
            });
          } else {
            // No sections present, just use subject
            setSelectedSubjectSection({
              SubjectName: firstSubject.SubjectName,
              SectionName: null,
              questions: firstSubject.sections?.[0]?.questions || [],
            });
          }
        }
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [testId]);

  const handleDropdownChange = (e) => {
    const [subjectIdx, sectionIdx] = e.target.value.split("-");
    const subject = testPaperData.subjects[subjectIdx];
    const section =
      sectionIdx !== "null" && subject?.sections
        ? subject.sections[sectionIdx]
        : {
            SectionName: null,
            questions: subject?.sections?.[0]?.questions || [],
          };

    setSelectedSubjectSection({
      SubjectName: subject.SubjectName,
      SectionName: section?.SectionName,
      questions: section?.questions || [],
    });
  };
  const toggleSolutionVisibility = (questionId) => {
    setVisibleSolutions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));

    // If hiding the solution, also hide video
    if (visibleSolutions[questionId]) {
      setVideoVisible((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    }
  };

  const openVideoPopup = (questionId) => {
    setVideoPopup(questionId);
    setVisibleSolutions(false)
  };

  const closeVideoPopup = () => {
    setVideoPopup(null);
  };

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);

  // Handle bookmark toggle
  const toggleBookmark = async (questionId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/MyResults/bookmark/${questionId}/${testId}/${studentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: questionId,
            test_creation_table_id: testId,
            student_registration_id: studentId,
          }),
        }
      );

      const data = await response.json();
      console.log("data", data);
      if (response.ok) {
        // Update the bookmarked questions state
        if (bookmarkedQuestions.includes(questionId)) {
          setBookmarkedQuestions(
            bookmarkedQuestions.filter((id) => id !== questionId)
          );
        } else {
          setBookmarkedQuestions([...bookmarkedQuestions, questionId]);
        }
      } else {
        alert("Error bookmarking/unbookmarking");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while bookmarking");
    }
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
    <div className={styles.solutionContainerMain}>
      <div className={styles.subjectDropDownContainer}>
        <select
          className={styles.subjectWiseDropDown}
          onChange={handleDropdownChange}
          value={
            selectedSubjectSection
              ? (() => {
                  const subjectIdx = testPaperData.subjects?.findIndex(
                    (s) => s.SubjectName === selectedSubjectSection.SubjectName
                  );
                  const sectionIdx =
                    testPaperData.subjects?.[subjectIdx]?.sections?.findIndex(
                      (sec) =>
                        sec?.SectionName === selectedSubjectSection.SectionName
                    ) ?? "null";

                  return `${subjectIdx}-${
                    sectionIdx !== -1 ? sectionIdx : "null"
                  }`;
                })()
              : ""
          }
        >
          {/* <option>Choose Subject/Section</option> */}
          {testPaperData.subjects?.map((subject, subjIndex) =>
            subject.sections && subject.sections.length > 0 ? (
              subject.sections.map((section, secIndex) => (
                <option
                  key={`${subjIndex}-${secIndex}`}
                  value={`${subjIndex}-${secIndex}`}
                >
                  {subject.SubjectName}
                  {section.SectionName ? ` - ${section.SectionName}` : ""}
                </option>
              ))
            ) : (
              <option key={`${subjIndex}-null`} value={`${subjIndex}-null`}>
                {subject.SubjectName}
              </option>
            )
          )}
        </select>

        <div>
          {selectedSubjectSection && (
            <div>
              {selectedSubjectSection.questions.map((question) => (
                <div
                  key={question.question_id}
                  className={`${styles.questionSolutionsDiv} ${styles.watermarkForSolution}`}
                >
                  <div className={styles.QuestionNoAnsBookmarkHolder}>
                    <p>Question No: {question.question_id}</p>
                    <button
                      onClick={() => toggleBookmark(question.question_id)}
                      className={`${styles.bookmarkButton} ${
                        bookmarkedQuestions.includes(question.question_id)
                          ? styles.bookmarked
                          : ""
                      }`}
                    >
                      {question.bookMark_Qid === null &&
                      !bookmarkedQuestions.includes(question.question_id) ? (
                        <FaRegBookmark />
                      ) : (
                        <FaBookmark />
                      )}
                    </button>
                  </div>
                  <div className={styles.questionImageInSolutionTab}>
                    <img
                      src={question.questionImgName}
                      alt={`Question ${question.question_id}`}
                    />
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {/* Bookmark Button */}
                    {/* <button
                      onClick={() => toggleBookmark(question.question_id)}
                      className={`${styles.bookmarkButton} ${
                        bookmarkedQuestions.includes(question.question_id)
                          ? styles.bookmarked
                          : ""
                      }`}
                    >
                      {question.bookMark_Qid === null &&
                      !bookmarkedQuestions.includes(question.question_id) ? (
                        <FaRegBookmark />
                      ) : (
                        <FaBookmark />
                      )}
                    </button> */}

                    {(() => {
                      const qTypeId = question.questionType?.quesionTypeId;

                      // NAT: Just show text answers
                      if (qTypeId === 5 || qTypeId === 6) {
                        return (
                          <div style={{ marginTop: "1rem", color: "black" }}>
                            <p>
                              <b>Your Answer: </b>
                              {question.userAnswer?.user_answer ||
                                "Not Attempted"}
                            </p>
                            <p>
                              <b>Correct Answer: </b>
                              {question.answer}
                            </p>
                          </div>
                        );
                      }

                      // MSQ: Multiple select with icons
                      if (qTypeId === 3 || qTypeId === 4) {
                        const correctAnswers =
                          question.answer?.split(",") || [];
                        const userAnswers =
                          question.userAnswer?.user_answer?.split(",") || [];

                        return question.options.map((option) => {
                          const isCorrect = correctAnswers.includes(
                            option.option_index
                          );
                          const isUserSelected = userAnswers.includes(
                            option.option_index
                          );

                          let icon = null;
                          let color = "black";

                          if (isCorrect && isUserSelected) {
                            icon = "✅";
                          } else if (!isCorrect && isUserSelected) {
                            icon = "❌";
                          } else if (isCorrect) {
                            icon = "✅";
                          }

                          return (
                            <div
                              key={option.option_id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                                color,
                              }}
                            >
                              <strong className={styles.correctWrongIcon}>
                                {icon}
                              </strong>
                              <strong>({option.option_index})</strong>
                              <div className={styles.optionImageInSolutionTab}>
                                <img
                                  src={option.optionImgName}
                                  alt={`Option ${option.option_index}`}
                                />
                              </div>
                            </div>
                          );
                        });
                      }

                      // MCQ (1 or 2)
                      return question.options.map((option) => {
                        const isCorrect =
                          option.option_index === question.answer;
                        const isUserAnswer =
                          option.option_index ===
                          question.userAnswer?.user_answer;

                        let icon = null;
                        let color = "black";

                        if (isCorrect && isUserAnswer) {
                          icon = "✅";
                        } else if (isUserAnswer && !isCorrect) {
                          icon = "❌";
                        } else if (isCorrect) {
                          icon = "✅";
                        }

                        return (
                          <div
                            key={option.option_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                              color,
                            }}
                          >
                            <strong className={styles.correctWrongIcon}>
                              {icon}
                            </strong>
                            <strong>({option.option_index})</strong>
                            <div className={styles.optionImageInSolutionTab}>
                              <img
                                src={option.optionImgName}
                                alt={`Option ${option.option_index}`}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {question.solution?.solutionImgName && (
                      <div className={styles.solutionButtonsContainer}>
                        <div className={styles.showSolutionButton}>
                          {/* View Solution Button */}
                          <button
                            onClick={() =>
                              toggleSolutionVisibility(question.question_id)
                            }
                            className={styles.solutionBtnInBookMarks}
                          >
                            {visibleSolutions[question.question_id]
                              ? "Hide Solution"
                              : "View Solution"}
                          </button>
                        </div>
                        {/* View Video Solution Button */}
                        {question.solution?.solutionImgName &&
                          question.solution?.video_solution_link !== "" && (
                            <div className={styles.showSolutionButton}>
                              <button
                                onClick={() =>
                                  openVideoPopup(question.question_id)
                                }
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
                        <div className={styles.solutionImageInSolutionTab}>
                          <p className={styles.solutionTag}>
                            Answer: {question.answer}
                          </p>
                          {question.solution?.solutionImgName && (
                            <>
                              <span className={styles.solutionTag}>
                                Solution:{" "}
                              </span>
                              <div
                                className={styles.solutionImageDivInSolutionTab}
                              >
                                <img
                                  src={question.solution.solutionImgName}
                                  alt={`Solution for question ${question.question_id}`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                    {/* Check for video solution link and display button if available */}

                    {videoPopup === question.question_id && (
                      <div className={styles.videoModalOverlay}>
                        <div className={styles.videoModalContent}>
                          <p className={styles.solutionTag}>Video Solution:</p>
                          <button
                            className={styles.closeVideoModalBtn}
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
                            style={{ width: "100%", height: "400px" }} // Add styling to ensure it fits well in the page
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watermarks */}
        {/* <span className={`${styles.waterMark} ${styles.topWaterMark}`}>
          {studentContact}
        </span>
        <span className={`${styles.waterMark} ${styles.bottomWaterMark}`}>
          {studentContact}
        </span>
        <span className={`${styles.waterMark} ${styles.middleWaterMark}`}>
          {studentContact}
        </span>
        <span className={`${styles.waterMark} ${styles.rightWaterMark}`}>
          {studentContact}
        </span> */}
      </div>
    </div>
  );
};

export default SolutionsTab;
