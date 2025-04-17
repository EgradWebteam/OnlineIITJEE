

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from '../../../config/apiConfig';
import { jsPDF } from "jspdf"; // Ensure jsPDF is imported
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";

const ViewQuestions = ({ data, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  if (!data) return null;

  const testId = data.test_creation_table_id;
  const [viewTestPaperData, setViewTestPaperData] = useState([]);

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/TestCreation/ViewTestPaper/${testId}`
        );
        setViewTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [testId]);


  
  const getBase64ImageFromURL = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return base64data;
    } catch (error) {
      console.error("Error converting image to Base64:", error);
      return null;
    }
  };
 
 
 
 
  
 
  const handleDownloadQuestionPaper = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`${BASE_URL}/TestCreation/ViewTestPaper/${testId}`);
      console.log("API Response:", response);
  
      const data = response.data;
      const doc = new jsPDF();
      let yPosition = 20;
  
      doc.setFontSize(16);
      doc.text("Question Paper", 10, yPosition);
      yPosition += 10;
  
      // Helper function to load image and preserve aspect ratio
      const addImageWithAspectRatio = async (doc, imageSrc, x, y, maxWidth, maxHeight) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = imageSrc;
  
          img.onload = () => {
            let { width, height } = img;
            const aspectRatio = width / height;
  
            if (width > maxWidth) {
              width = maxWidth;
              height = maxWidth / aspectRatio;
            }
            if (height > maxHeight) {
              height = maxHeight;
              width = maxHeight * aspectRatio;
            }
  
            doc.addImage(imageSrc, "JPEG", x, y, width, height);
            resolve(height);
          };
        });
      };
  
      if (data?.subjects?.length > 0) {
        for (const subject of data.subjects) {
          doc.setFontSize(14);
          doc.text(`Subject: ${subject.SubjectName}`, 10, yPosition);
          yPosition += 10;
  
          for (const section of subject.sections || []) {
            doc.setFontSize(13);
            doc.text(`Section: ${section.SectionName}`, 10, yPosition);
            yPosition += 10;
  
            for (const [index, question] of (section.questions || []).entries()) {
              doc.setFontSize(12);
              doc.text(`Q${index + 1}:`, 10, yPosition);
              yPosition += 10;
  
              if (question.questionImgName) {
                const base64Img = await getBase64ImageFromURL(question.questionImgName);
                if (base64Img) {
                  const imgHeight = await addImageWithAspectRatio(doc, base64Img, 10, yPosition, 180, 80);
                  yPosition += imgHeight + 10;
                }
              }
  
              if (question.options && question.options.length > 0) {
                for (const [optIndex, option] of question.options.entries()) {
                  doc.text(`   ${String.fromCharCode(65 + optIndex)}`, 15, yPosition);
                  yPosition += 10;
  
                  if (option.optionImgName) {
                    const optBase64Img = await getBase64ImageFromURL(option.optionImgName);
                    if (optBase64Img) {
                      const optImgHeight = await addImageWithAspectRatio(doc, optBase64Img, 15, yPosition, 30, 20);

                      yPosition += optImgHeight + 10;
                    }
                  }
                }
              }
  
              // Page break if needed
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
            }
          }
        }
  
        doc.save("QuestionPaper.pdf");
      } else {
        console.error("No subjects found in the data.");
      }
    } catch (error) {
      console.error("Error fetching or downloading question paper:", error);
    } finally {
      setDownloading(false);
    }
  };
  
  
  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <button onClick={onClose} className={styles.closebutton_viewquestion}>
          ✖
        </button>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>
        <button
          onClick={handleDownloadQuestionPaper}
          className={styles.printbutton_viewquestion}
     
        >
          {downloading ? "Downloading..." : "Download Question Paper"}
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
                        <p>Question No: {question.question_id}</p>
                        <img
                          src={question.questionImgName}
                          alt={`Question ${question.question_id}`}
                          style={{ width: "300px", height: "auto" }}
                        />
                        <div style={{ marginTop: "1rem" }}>
                          {question.options.map((option) => (
                            <div key={option.option_id} style={{ display: "flex", alignItems: "center" }}>
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

export default ViewQuestions;
