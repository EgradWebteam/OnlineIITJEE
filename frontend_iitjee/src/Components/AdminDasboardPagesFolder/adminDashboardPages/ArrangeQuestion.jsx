import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import { BASE_URL } from "../../../../apiConfig";

const ArrangeQuestions = ({ data, onClose }) => {
  const [viewTestPaperData, setViewTestPaperData] = useState([]);

  console.log("data", data);
  const testId = data.test_creation_table_id;
  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedQuestions = Array.from(viewTestPaperData);
    const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, movedQuestion);
    setViewTestPaperData(reorderedQuestions);

    try {
      await axios.post(`${BASE_URL}/TestCreation/updateQuestionOrder`, {
        questions: reorderedQuestions.map((q, index) => ({
          question_id: q.question_id,
          sort_order: index + 1,
        })),
      });
    } catch (error) {
      console.error("Error updating sort order:", error);
      alert("Failed to update sort order.");
    }
  };

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
  console.log("viewTestPaperData", viewTestPaperData);
  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupContent}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <h2 className={styles.title}>
          {viewTestPaperData?.TestName || "Arrange Questions"}
        </h2>

        {/* Show paper info once */}
        {viewTestPaperData?.subjects?.map((subject) => (
          <div key={subject.subjectId}>
            <h3>Subject: {subject.SubjectName}</h3>
            {subject.sections.map((section) => (
              <div key={section.sectionId}>
                <h4>Section: {section.SectionName}</h4>
                {/* Optional display here */}
              </div>
            ))}
          </div>
        ))}

        {/* DRAGGABLE QUESTIONS */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={styles.questionsList}
              >
                {viewTestPaperData.map((question, index) => (
                  <Draggable
                    key={question.question_id}
                    draggableId={question.question_id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={styles.questionBlock}
                      >
                        <div>
                          <h2>{viewTestPaperData.TestName}</h2>

                          {viewTestPaperData.subjects?.map((subject) => (
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
                                          (question.question_id,
                                          question.questionImgName)
                                        }`}
                                        style={{
                                          width: "300px",
                                          height: "auto",
                                        }}
                                      />
                                      <div style={{ marginTop: "1rem" }}>
                                        {question.options.map((option) => (
                                          <div
                                            key={option.option_id}
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <strong>
                                              {option.option_index}:
                                            </strong>
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ArrangeQuestions;
