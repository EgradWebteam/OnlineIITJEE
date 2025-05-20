import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";

const ViewDocumentData = ({ data, onClose }) => {

  if (!data) return null;

  const testId = data.test_creation_table_id;
  const documentId = data.document_id;
  const [viewTestPaperData, setViewTestPaperData] = useState([]);

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/DocumentUpload/ViewTestDocumentData/${testId}/${documentId}`
        );
        setViewTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [testId, documentId]);

  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <div className={styles.closebutton_viewquestion}>
        <button onClick={onClose} >✖</button>
        </div>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>

        <div id="printable-content">
          <h2>{viewTestPaperData?.TestName}</h2>
          {viewTestPaperData?.subjects?.map((subject) => (
            <div key={subject.subjectId}>
              <h3>Subject: {subject.SubjectName}</h3>
              {subject.sections.map((section) => (
                <div key={section.sectionId}>
                  <h4>Section: {section.SectionName}</h4>
                  {section.questions.map((question, index) => (
                    <div key={question.question_id} style={{ marginBottom: "2rem" }}>
                      {/* Incremental Question Numbering */}
                      <p>Question {index + 1}:</p> {/* Increment here */}
                      {question.questionImgName && (
                        <div className={styles.questionImage}>
                        <img
                          src={question.questionImgName}
                          alt={`Question ${question.question_id}`}
                          style={{
                            maxWidth: "100%",
                            height: "auto",
                            maxHeight: "300px",
                            display: "block",
                            marginBottom: "1rem",
                          }}
                        />
                        </div>
                      )}
                      <div style={{ marginTop: "1rem" }}>
                        {question.options.map((option) => (
                          <div
                            key={option.option_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            <strong>({option.option_index})</strong>
                            {option.optionImgName && (
                              <img
                                src={option.optionImgName}
                                alt={`Option ${option.option_index}`}
                                style={{
                                  maxWidth: "150px",
                                  height: "auto",
                                  maxHeight: "150px",
                                  marginLeft: "10px",
                                  display: "block",
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentData;
