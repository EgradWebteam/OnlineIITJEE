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
        <button onClick={onClose} className={styles.closebutton_viewquestion}>
          ✖
        </button>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>

        <div id="printable-content">
          <div>
            <h2>{viewTestPaperData.TestName}</h2>
            {viewTestPaperData.subjects?.map((subject) => (
              <div key={subject.subjectId}>
                <h3>Subject: {subject.SubjectName}</h3>
                {subject.sections.map((section) => (
                  <div key={section.sectionId}>
                    {/* <h4>Section: {section.SectionName}</h4> */}
                    {section.SectionName && (
                      <h4>Section: {section.SectionName}</h4>
                    )}

                    {section.questions.map((question) => (
                      <div
                        key={question.question_id}
                        style={{ marginBottom: "2rem" }}
                      >
                        <p>Question No: {question.question_id}</p>
                        <img
                          src={question.questionImgName}
                          alt={`Question ${question.question_id}`}
                          style={{ width: "300px", height: "auto" }}
                        />
                        <div style={{ marginTop: "1rem" }}>
                          {question.options.map((option) => (
                            <div
                              key={option.option_id}
                              style={{ display: "flex", alignItems: "center" }}
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
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentData;
