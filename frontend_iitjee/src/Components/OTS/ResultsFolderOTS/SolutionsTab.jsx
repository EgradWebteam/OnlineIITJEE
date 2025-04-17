import React,{useState,useEffect} from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

const SolutionsTab = () => {
  const [testPaperData, setTestPaperData] = useState([]);

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/OTS/QuestionPaper/${realTestId}`
        );
        setTestPaperData(response.data);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [realTestId]);
  return (
    <div className={styles.solutionContainerMain}>
      <div className={styles.subjectDropDownContainer}>
        <select className={styles.subjectWiseDropDown}>
          <option>..</option>
        </select>
        <div className={styles.questionSolutionsDiv}>
          <div>
            <h2>{testPaperData.TestName}</h2>

            {testPaperData.subjects?.map((subject) => (
              <div key={subject.subjectId}>
                <h3>Subject: {subject.SubjectName}</h3>

                {subject.sections.map((section) => (
                  <div key={section.sectionId}>
                    <h4>Section: {section.SectionName}</h4>

                    {section.questions.map((question) => (
                      <div
                        key={question.question_id}
                        style={{ marginBottom: "2rem" }}
                      >
                        <p>Question ID: {question.question_id}</p>
                        <img
                          src={question.questionImgName}
                          alt={`Question ${
                            (question.question_id, question.questionImgName)
                          }`}
                          style={{ width: "300px", height: "auto" }}
                        />
                        <div style={{ marginTop: "1rem" }}>
                          {question.options.map((option) => (
                            <div
                              key={option.option_id}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <strong>{option.option_index}:</strong>
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
          <span className={`${styles.waterMark} ${styles.topWaterMark}`}>
            ..
          </span>
          <span className={`${styles.waterMark} ${styles.bottomWaterMark}`}>
            ..
          </span>
          <span className={`${styles.waterMark} ${styles.middleWaterMark}`}>
            ..
          </span>
          <span className={`${styles.waterMark} ${styles.rightWaterMark}`}>
            ..
          </span>
          <div className={styles.QuestionImgDiv}>
            <img />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsTab;
