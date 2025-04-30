import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import { jsPDF } from "jspdf";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";

const ViewQuestions = ({ data, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [viewTestPaperData, setViewTestPaperData] = useState(null); // State to store test data
  const testId = data?.test_creation_table_id;

  if (!data || !testId) return null;

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

  // Convert image to base64 for PDF embedding
  const getBase64ImageFromURL = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Image conversion error:", error);
      return null;
    }
  };

  const addImageWithAspectRatio = async (doc, imageSrc, x, y, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        let { width, height } = img;
        const aspectRatio = width / height;

        // Ensure the image fits within the maxWidth and maxHeight
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Make sure the image is scaled properly
        doc.addImage(imageSrc, "JPEG", x, y, width, height);
        resolve(height);
      };
    });
  };

  const handleDownloadQuestionPaper = async () => {
    if (!viewTestPaperData) {
      console.error("No test paper data available for download.");
      return;
    }
  
    setDownloading(true);
    const doc = new jsPDF();
    let yPosition = 20;
    let questionNumber = 1;  // Initialize the question number
  
    try {
      doc.setFontSize(16);
      doc.text("Question Paper", 10, yPosition);
      yPosition += 10;
  
      if (viewTestPaperData?.subjects?.length > 0) {
        for (const subject of viewTestPaperData.subjects) {
          doc.setFontSize(14);
          doc.text(`Subject: ${subject.SubjectName}`, 10, yPosition);
          yPosition += 10;
  
          for (const section of subject.sections || []) {
            doc.setFontSize(13);
            doc.text(`Section: ${section.SectionName}`, 10, yPosition);
            yPosition += 10;
  
            for (const question of section.questions) {
              doc.setFontSize(12);
  
              // Use the `questionNumber` for sequential numbering
              doc.text(`Q${questionNumber}:`, 10, yPosition);
              yPosition += 10;
              questionNumber++;  // Increment the question number after each question
  
              // Image scaling for question image
              if (question.questionImgName) {
                const base64Img = await getBase64ImageFromURL(question.questionImgName);
                if (base64Img) {
                  const imgHeight = await addImageWithAspectRatio(doc, base64Img, 10, yPosition, 180, 80);
                  yPosition += imgHeight + 10;
                }
              }
  
              if (question.options?.length > 0) {
                for (const [optIndex, option] of question.options.entries()) {
                  doc.setFontSize(12);
                  doc.text(`   ${String.fromCharCode(65 + optIndex)}`, 15, yPosition);
                  yPosition += 10;
  
                  // Image scaling for option image
                  if (option.optionImgName) {
                    const optBase64Img = await getBase64ImageFromURL(option.optionImgName);
                    if (optBase64Img) {
                      const optImgHeight = await addImageWithAspectRatio(doc, optBase64Img, 15, yPosition, 50, 30);
                      yPosition += optImgHeight + 10;
                    }
                  }
                }
              }
  
              const pageHeight = doc.internal.pageSize.height;
              if (yPosition + 30 > pageHeight) {
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
      console.error("Error downloading question paper:", error);
    } finally {
      setDownloading(false);
    }
  };
  

  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
      
          <div className={styles.closebutton_viewquestion}>
        <button onClick={onClose} >✖</button>
        </div>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>
        <button onClick={handleDownloadQuestionPaper} className={styles.printbutton_viewquestion}>
          {downloading ? "Downloading..." : "Download Question Paper"}
        </button>
       
        <div id="printable-content">
          <h2 className={styles.HeadingForViewTestData}>{viewTestPaperData?.TestName}</h2>
          {viewTestPaperData?.subjects?.map((subject) => (
            <div  key={subject.subjectId}>
              <h3  className={styles.HeadingForViewTestData}>Subject: {subject.SubjectName}</h3>
              {subject.sections.map((section) => (
                <div key={section.sectionId}>
                  <h4 className={styles.HeadingForViewTestData}>Section: {section.SectionName}</h4>
                  {section.questions.map((question,index) => (
                    <div key={question.question_id} style={{ marginBottom: "2rem" }}>
                        <p>Question {`${index + 1}`}</p>
                      {question.questionImgName && (
                        <div className={styles.ImagesInQuestions}>
                        <img src={question.questionImgName} alt={`Question ${question.question_id}`} style={{ maxWidth: "100%", height: "auto", maxHeight: "300px", display: "block", marginBottom: "1rem" }} />
                    </div>
                      )}
                      <div style={{ marginTop: "1rem" }}>
                        {question.options.map((option) => (
                          <div key={option.option_id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                            <strong>({option.option_index})</strong>
                            {option.optionImgName && (
                              <img src={option.optionImgName} alt={`Option ${option.option_index}`} style={{ maxWidth: "150px", height: "auto", maxHeight: "150px", marginLeft: "10px", display: "block" }} />
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

export default ViewQuestions;
