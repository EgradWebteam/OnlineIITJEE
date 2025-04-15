import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import egradLogo from "../../../assets/EGTLogoExamHeaderCompressed.jpg";

const OTSQuestionPaper = ({ testName, testData }) => {
  return (
    <div className={styles.OTSQuestionPaperMainDiv}>
      <div className={styles.OTSQuestionPaperSubDiv}>
        {/* Header */}
        <div className={styles.navDivForQuestionPaper}>
          <div className={styles.logoDiv}>
            <img src={egradLogo} alt='logo' />
          </div>
          <div className={styles.testNameInQuestionPaper}>
            <h3>{testName}</h3>
          </div>
          <div className={styles.closeBtn}>
            <button>Close</button>
          </div>
        </div>

        {/* Questions */}
        <div className={styles.QuestionOptionsDIV}>
          {testData?.subjects?.map((subject, subjectIndex) => (
            <div key={subjectIndex}>
              <h3>{subject.subjectName}</h3>

              {subject.sections?.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h4>{section.sectionName}</h4>

                  {section.questions?.map((question, questionIndex) => (
                    <div key={questionIndex} className={styles.SingleQuestionBlock}>
                      <div>
                        <h5>Question - {questionIndex + 1}.</h5>
                        <div className={styles.questionImages}>
                          {question.questionImage && (
                            <img src={question.questionImage} alt={`Question ${questionIndex + 1}`} />
                          )}
                        </div>
                      </div>

                      <div className={styles.OptionImages}>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <p>Option {option.optionId}</p>
                            {option.optionImage && (
                              <img src={option.optionImage} alt={`Option ${option.optionId}`} />
                            )}
                          </div>
                        ))}
                      </div>

                      <hr />
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

export default OTSQuestionPaper;
