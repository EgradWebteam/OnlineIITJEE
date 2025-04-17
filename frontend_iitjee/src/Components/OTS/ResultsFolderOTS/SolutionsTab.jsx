import React, { useState, useEffect } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import axios from "axios";
import { BASE_URL } from "../../../config/apiConfig";

const SolutionsTab = ({ testId, userData, studentId }) => {
  const [testPaperData, setTestPaperData] = useState([]);
  const [selectedSubjectSection, setSelectedSubjectSection] = useState(null);
  const studentContact = userData?.mobile_no;

  // useEffect(() => {
  //   const fetchTestPaper = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/MyResults/StudentReportQuestionPaper/${testId}/${studentId}`
  //       );
  //       setTestPaperData(response.data);
  //     } catch (err) {
  //       console.error("Error fetching test paper:", err);
  //     }
  //   };

  //   fetchTestPaper();
  // }, [testId]);

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
                     (sec) => sec?.SectionName === selectedSubjectSection.SectionName
                   ) ?? "null";
       
                 return `${subjectIdx}-${sectionIdx !== -1 ? sectionIdx : "null"}`;
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
                  {section.SectionName
                    ? ` - ${section.SectionName}`
                    : ""}
                </option>
              ))
            ) : (
              <option key={`${subjIndex}-null`} value={`${subjIndex}-null`}>
                {subject.SubjectName}
              </option>
            )
          )}
        </select>

        <div className={styles.questionSolutionsDiv}>
          {selectedSubjectSection && (
            <div>
              {/* <h3>Subject: {selectedSubjectSection.SubjectName}</h3> */}
              {/* {selectedSubjectSection.SectionName && (
                <h4>Section: {selectedSubjectSection.SectionName}</h4>
              )} */}
              {selectedSubjectSection.questions.map((question) => (
                <div key={question.question_id} style={{ marginBottom: "2rem" }}>
                  <p>Question No: {question.question_id}</p>
                  <div className={styles.questionImageInSolutionTab}>
                    <img
                      src={question.questionImgName}
                      alt={`Question ${question.question_id}`}
                      style={{ width: "300px", height: "auto" }}
                    />
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {question.options.map((option) => (
                      <div
                        key={option.option_id}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <strong>({option.option_index})</strong>
                        <div className={styles.optionImageInSolutionTab}>
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
                        
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watermarks */}
        <span className={`${styles.waterMark} ${styles.topWaterMark}`}>
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
        </span>
      </div>
    </div>
  );
};

export default SolutionsTab;
