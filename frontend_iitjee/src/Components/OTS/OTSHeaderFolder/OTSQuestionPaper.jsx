import React,{useState,useEffect} from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import egradLogo from "../../../assets/EGTLogoExamHeaderCompressed.jpg";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import axios from "axios"

const OTSQuestionPaper = ({ testName,realTestId, closeQuestionPaper }) => {
  const [questionData, setQuestionData] = useState([]);
 
 
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/OTS/QuestionPaper/${realTestId}`);
        console.log("response",response.data)
        setQuestionData(response.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
 
    fetchQuestions();
  }, []);


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
          <div className={styles.OTSQuestionPapercloseBtn}>
            <button onClick={closeQuestionPaper}>Close</button>
          </div>
        </div>

        {/* Questions */}
        <div>
 
      {questionData.subjects?.map((subject) => (
        <div key={subject.subjectId} >
          {subject.sections.map((section) => (
            <div key={section.sectionId}>
              {section.questions.map((question) => (
                <div key={question.question_id}  className={styles.OTSQuestionContainer}>
                  <p className={styles.OTSQuestionPaperNumber}>Question No: {question.question_id}</p>
                  <div className={styles.OTSQuestionPaperQuestionImgDIv}>
                  <img
                    src={question.questionImgName}
                    alt={`Question ${question.question_id,question.questionImgName}`} 
                  />
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {question.options.map((option) => (
                      <div key={option.option_id} style={{ display: "flex", alignItems: "center" }}>
                        <strong className={styles.OTSQuestionPaperOptionIndex}>({option.option_index})</strong>
                        <div className={styles.OTSQuestionPaperOptionsDiv}>
                        <img
                          src={option.optionImgName}
                          alt={`Option ${option.option_index}`}
                        />
                        </div>
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

export default OTSQuestionPaper;
