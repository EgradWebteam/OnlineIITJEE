import React, { useEffect, useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import QuestionOptionsContainer from './QuestionOptionsContainer';

export default function QuestionsMainContainer({ 
  testData, 
  activeSubject, 
  activeSection, 
  activeQuestionIndex,
  setSelectedOption,
  userAnswers,
  selectedOption,
  selectedOptionsArray,
  setSelectedOptionsArray,
  natValue,
  setNatValue
}) {

  //  Get current question based on active subject, section, and question index
  const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  const question = section?.questions?.[activeQuestionIndex] || null;
  // console.log("question:", question)
  console.log("Current question ID:", question?.question_id);
 console.log("All userAnswers:", userAnswers);

  useEffect(() => {
    const saved = userAnswers?.[String(question?.question_id)];
    if (saved?.type === "MCQ" && saved.optionId) {
      setSelectedOption({
        option_id: saved.optionId,
        option_index: saved.optionIndex,
      });
    }
    // Add similar conditions for MSQ and NAT if needed
  }, [question?.question_id, userAnswers, setSelectedOption]);

  const savedAnswer = userAnswers?.[String(question?.question_id)];
  console.log("savedanswers for checked:", savedAnswer);

  // useEffect(() => {
  //   const saved = userAnswers?.[String(question?.question_id)];
  
  //   // Reset MCQ selection
  //   setSelectedOption(null);
  //   if (saved?.type === "MCQ" && saved.optionId) {
  //     setSelectedOption({
  //       option_id: saved.optionId,
  //       option_index: saved.optionIndex,
  //     });
  //   }
  
  //   // Reset MSQ selection
  //   setSelectedOptionsArray([]);
  //   if (saved?.type === "MSQ" && saved.selectedOptions) {
  //     setSelectedOptionsArray(saved.selectedOptions);
  //   }
  
  //   // Reset NAT input
  //   setNatValue("");
  //   if (saved?.type === "NAT" && saved.natAnswer) {
  //     setNatValue(saved.natAnswer);
  //   }
  // }, [question?.question_id, userAnswers]);

  useEffect(() => {
    setSelectedOption(null);
    setSelectedOptionsArray([]);
    setNatValue("");
  
    const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
    const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
    const currentQuestion = section?.questions?.[activeQuestionIndex];
  
    const saved = userAnswers?.[currentQuestion?.question_id];
  
    //  Only set values if a saved response exists
    if (saved) {
      if (saved.type === "MCQ" && saved.optionId) {
        setSelectedOption({
          option_id: saved.optionId,
          option_index: saved.optionIndex,
        });
      }
  
      if (saved.type === "MSQ" && Array.isArray(saved.selectedOptions)) {
        setSelectedOptionsArray(saved.selectedOptions);
      }
  
      if (saved.type === "NAT" && typeof saved.natAnswer === "string") {
        setNatValue(saved.natAnswer);
      }
    }
  }, [activeSubject, activeSection, activeQuestionIndex, userAnswers]);
  
    useEffect(() => {
      setSelectedOption(null);
    }, [activeSubject, activeSection, activeQuestionIndex]);
  
  
  
  //  Get question metadata (type, marks)
  const getQuestionMeta = () => {
    const questionTypeId = question?.questionType?.quesionTypeId;

    let displayQuestionType = "";
    if ([1, 2].includes(questionTypeId)) {
      displayQuestionType = "MCQ";
    } else if ([3, 4].includes(questionTypeId)) {
      displayQuestionType = "MSQ";
    } else if ([5, 6].includes(questionTypeId)) {
      displayQuestionType = "NAT";
    }

    return {
      questionType: displayQuestionType,
      marks: question?.marks_text || "N/A",
      negativeMarks: question?.nmarks_text || "N/A",
    };
  };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleLeftClickMain = () => {
    console.log("in handle left click in main page");
    setIsCollapsed((prev) => !prev);
  };
  const { questionType, marks, negativeMarks } = getQuestionMeta();

  //  Render question content (image or text)
  const renderQuestion = (question) => {
    if (!question) return <p>No question available.</p>;

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const isImageQuestion = imageExtensions.some(ext =>
      question?.questionImgName?.toLowerCase().endsWith(ext)
    );

    return (
      <>
        {isImageQuestion ? (
          <div className={styles.QuestionImage}>
            <img
              src={`/path-to-images/${question.questionImgName}`}
              alt="Question"
            />
          </div>
        ) : (
          <p className={styles.QuestionParaNow}>{question.questionImgName}</p>
        )}
      </>
    );
  };
  return (
    <div className={!isCollapsed ? styles.OTSQuestionContainerMainDiv : styles.fullWidth }>
      <div className={styles.QuestionTypeHolderContainer}>
        <p>Question Type: <strong>{questionType}</strong></p>
        <div className={styles.marksContainer}>
          <p>Marks for Correct Answer: <span className={styles.crctMarksSpan}>{marks}</span></p>
          <span className={styles.marksSeparator}> | </span>
          <p>Negative Marks: <span className={styles.negtMarksSpan}>{negativeMarks}</span></p>
        </div>
      </div>

      <div className={styles.QuestionNumberHolderContainer}>
        <p>Question No. {activeQuestionIndex + 1}</p>
      </div>

      <div className={styles.QuestionImageHolder}>
        {renderQuestion(question)}
      </div>

      <QuestionOptionsContainer
        options={question?.options || []} 
        optPatternId={testData?.opt_pattern_id}
        questionTypeId={question?.questionType?.quesionTypeId}
        onSelectOption={setSelectedOption}
        savedAnswer={savedAnswer}
        selectedOption={selectedOption}
        questionId={question?.question_id}
        selectedOptionsArray={selectedOptionsArray}
        setSelectedOptionsArray={setSelectedOptionsArray}
        natValue={natValue}
        setNatValue={setNatValue}
      />

      {isCollapsed && (
        <div className={styles.rightChevronBtn}>
        <button
          onClick={handleLeftClickMain}
        >
          <FaChevronLeft />
        </button>
        </div>
      )}
    </div>
  );
}
