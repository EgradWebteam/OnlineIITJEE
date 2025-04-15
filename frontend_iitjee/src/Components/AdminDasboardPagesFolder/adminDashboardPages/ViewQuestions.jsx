import React, { useState } from 'react';
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import QuestioData from "../../../Components/StudentDashboardPagesFolder/JSON_Files/QuestionsData.json";

const AZURE_STORAGE_ACCOUNT_NAME = "iitstorage";
const AZURE_CONTAINER_NAME = "iit-jee-container";
const AZURE_SAS_TOKEN = "sv=2024-11-04&ss=b&srt=o&sp=rwdlactfx&se=2025-04-11T17:23:35Z&st=2025-04-09T09:23:35Z&spr=https,http&sig=jgevAvQaT%2FhAeJnJ36jhkE%2FVNern7BjpG3g1JQ6%2FNMA%3D";
const AZURE_STORAGE_BASE_URL = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NAME}`;

const ViewQuestions = ({ onClose }) => {
  const [imagesLoaded, setImagesLoaded] = useState(true);

  const data = QuestioData;

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

  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <button onClick={onClose} className={styles.closebutton_viewquestion}>✖</button>
        <h2 className={styles.viewquestion_title}>{data.TestName}</h2>

        <button onClick={handlePrint} className={styles.printbutton_viewquestion} disabled={!imagesLoaded}>
          {imagesLoaded ? "Print Question Paper" : "Loading Images... Please Wait"}
        </button>

        <div id="printable-content">
          {data.subjects.map((subject) => (
            <div key={subject.subjectId}>
              <h3 className={styles.subject_heading}>{subject.SubjectName}</h3>

              {subject.sections.map((section, secIndex) => (
                <div key={secIndex}>
                  {section.SectionName && <h4>{section.SectionName}</h4>}

                  {section.questions.map((question) => (
                    <div key={question.question_id} className={styles.questionblock_viewquestion}>
                      {/* Question */}
                      <div>
                        <h5 className={styles.viewquestion_heading}>Question:</h5>
                        <img
                          src={`${AZURE_STORAGE_BASE_URL}/${question.document_name}/questions/${question.questionImgName}?${AZURE_SAS_TOKEN}`}
                          alt={`Question ${question.question_id}`}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          className={styles.viewquestion_image}
                        />
                      </div>

                      {/* Options */}
                      {question.options && (
                        <div>
                          <h5 className={styles.viewquestion_heading}>Options:</h5>
                          {question.options.map((option) => (
                            <div className={styles.optionblock_viewquestion} key={option.option_id}>
                              <span>{option.option_index}:</span>
                              <img
                                src={`${AZURE_STORAGE_BASE_URL}/${question.document_name}/options/${option.optionImgName}?${AZURE_SAS_TOKEN}`}
                                alt={`Option ${option.option_index}`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                className={styles.viewquestion_image}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Paragraph */}
                      {question.paragraph && question.paragraph.paragraphImg && (
                        <div>
                          <h5 className={styles.viewquestion_heading}>Paragraph:</h5>
                          <img
                            src={`${AZURE_STORAGE_BASE_URL}/${question.document_name}/paragraph/${question.paragraph.paragraphImg}?${AZURE_SAS_TOKEN}`}
                            alt="Paragraph"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className={styles.viewquestion_image}
                          />
                        </div>
                      )}

                      {/* Solution */}
                      {question.solution && question.solution.solutionImgName && (
                        <div>
                          <h5 className={styles.viewquestion_heading}>Solution:</h5>
                          <img
                            src={`${AZURE_STORAGE_BASE_URL}/${question.document_name}/solution/${question.solution.solutionImgName}?${AZURE_SAS_TOKEN}`}
                            alt="Solution"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className={styles.viewquestion_image}
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
    </div>
  );
};

export default ViewQuestions;
