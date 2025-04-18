import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import { BASE_URL } from '../../../Config/ApiConfig.js';

const ArrangeQuestions = ({ data, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const testId = data.test_creation_table_id;

  useEffect(() => {
    const fetchTestPaper = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/TestCreation/ViewTestPaper/${testId}`);
        const paper = response.data;

        const allQuestions = [];

        paper.subjects?.forEach((subject) => {
          subject.sections?.forEach((section) => {
            section.questions?.forEach((question) => {
              allQuestions.push({
                ...question,
                SubjectName: subject.SubjectName,
                SectionName: section.SectionName,
                TestName: paper.TestName,
              });
            });
          });
        });

        setQuestions(allQuestions);
      } catch (err) {
        console.error("Error fetching test paper:", err);
      }
    };

    fetchTestPaper();
  }, [testId]);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    setQuestions(reordered);

    try {
      await axios.post(`${BASE_URL}/OTS/QusetionsSorting`, {
        questions: reordered.map((q, index) => ({
          question_id: q.question_id,
          sort_order: index + 1,
        })),
      });
    } catch (error) {
      console.error("Error updating sort order:", error);
      alert("Failed to update sort order.");
    }
  };

  return (
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <button onClick={onClose} className={styles.closebutton_viewquestion}>✖</button>
        <h2 className={styles.viewquestion_title}>
          {questions.length > 0 ? questions[0].TestName : "Arrange Questions"}
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {questions.map((question, index) => (
                  <Draggable key={question.question_id} draggableId={String(question.question_id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={styles.questionblock_viewquestion}
                      >
                        <p>
                          <strong>Subject:</strong> {question.SubjectName} | <strong>Section:</strong> {question.SectionName}
                        </p>
                        <p><strong>Question ID:</strong> {question.question_id}</p>
                        <img
                          src={question.questionImgName}
                          alt="Question"
                          style={{ width: "300px", height: "auto" }}
                        />
                        <div style={{ marginTop: "1rem" }}>
                          {question.options?.map((option) => (
                            <div key={option.option_id} style={{ display: "flex", alignItems: "center" }}>
                              <strong>{option.option_index}:</strong>
                              <img
                                src={option.optionImgName}
                                alt={`Option ${option.option_index}`}
                                style={{ width: "150px", height: "auto", marginLeft: "10px" }}
                              />
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
