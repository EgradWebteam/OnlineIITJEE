import React, { useState,useEffect } from 'react';
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import axios from 'axios'
import {BASE_URL} from '../../../../apiConfig'

const ViewQuestions = ({ data, onClose }) => {
  const [imagesLoaded, setImagesLoaded] = useState(true);

  if (!data) return null;
console.log("data",data)
const testId = data.test_creation_table_id;
console.log("testId",testId)
  const handleImageLoad = () => {
    setImagesLoaded(true);
  };

  const handleImageError = () => {
    setImagesLoaded(false);
  };

  const handlePrint = () => {
    if (!imagesLoaded) {
      alert('Please wait for all images to load before printing.');
      return;
    }

    const printableContent = document.getElementById("printable-content");

    if (!printableContent) {
      console.error("Printable content not found!");
      return;
    }

    const printContent = printableContent.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

    
  const [viewTestPaperData, setViewTestPaperData] = useState([]);
 
useEffect(() => {
  const fetchTestPaper = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/TestCreation/ViewTestPaper/${testId}`);
      setViewTestPaperData(response.data);
    } catch (err) {
      console.error("Error fetching test paper:", err);
    }
  };

  fetchTestPaper();
}, [testId]);
console.log("viewTestPaperData",viewTestPaperData)


  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <button onClick={onClose} className={styles.closebutton_viewquestion}>✖</button>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>
        <button onClick={handlePrint} className={styles.printbutton_viewquestion} disabled={!imagesLoaded}>
          {imagesLoaded ? "Print Question Paper" : "Loading Images... Please Wait"}
        </button>

        <div id="printable-content">
        <div>
      <h2>{viewTestPaperData.TestName}</h2>
 
      {viewTestPaperData.subjects?.map((subject) => (
        <div key={subject.subjectId}>
          <h3>Subject: {subject.SubjectName}</h3>
 
          {subject.sections.map((section) => (
            <div key={section.sectionId}>
              <h4>Section: {section.SectionName}</h4>
 
              {section.questions.map((question) => (
                <div key={question.question_id} style={{ marginBottom: "2rem" }}>
                  <p>Question ID: {question.question_id}</p>
                  <img
                    src={question.questionImgName}
                    alt={`Question ${question.question_id,question.questionImgName}`}
                    style={{ width: "300px", height: "auto" }}
                  />
                  <div style={{ marginTop: "1rem" }}>
                    {question.options.map((option) => (
                      <div key={option.option_id} style={{ display: "flex", alignItems: "center" }}>
                        <strong>{option.option_index}:</strong>
                        <img
                          src={option.optionImgName}
                          alt={`Option ${option.option_index}`}
                          style={{ width: "150px", height: "auto", marginLeft: "10px" }}
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

export default ViewQuestions;
