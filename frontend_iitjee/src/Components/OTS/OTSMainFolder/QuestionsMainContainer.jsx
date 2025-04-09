import React from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import QuestionOptionsContainer from './QuestionOptionsContainer';

export default function QuestionsMainContainer({ testData, activeSubject, activeSection, activeQuestionIndex }) {

  //  Get current question based on active subject, section, and question index
  const subject = testData?.subjects?.find(sub => sub.SubjectName === activeSubject);
  const section = subject?.sections?.find(sec => sec.SectionName === activeSection);
  const question = section?.questions?.[activeQuestionIndex] || null;

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
    <div className={styles.OTSQuestionContainerMainDiv}>
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
      />
    </div>
  );
}
