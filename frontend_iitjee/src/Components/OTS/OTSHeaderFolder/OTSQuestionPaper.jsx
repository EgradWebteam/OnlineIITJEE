import React,{useState,useEffect} from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import egradLogo from "../../../assets/EGTLogoExamHeaderCompressed.jpg";
import { BASE_URL } from '../../../config/apiConfig.js';
import axios from "axios"

const OTSQuestionPaper = ({ testName,realTestId }) => {
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
          <div className={styles.closeBtn}>
            <button>Close</button>
          </div>
        </div>

        {/* Questions */}
        <div>
      <h2>{questionData.TestName}</h2>
 
      {questionData.subjects?.map((subject) => (
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
                    alt={`Question ${question.question_id,question.questionImgName}`}
                    style={{ width: "300px", height: "auto" }}
                  />
                  <div style={{ marginTop: "1rem" }}>
                    {question.options.map((option) => (
                      <div key={option.option_id} style={{ display: "flex", alignItems: "center" }}>
                        <strong>({option.option_index})</strong>
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
  );
};

export default OTSQuestionPaper;
