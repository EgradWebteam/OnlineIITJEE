import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";

const AZURE_STORAGE_ACCOUNT_NAME = 'iitstorage';
const AZURE_SAS_TOKEN = 'sv=2024-11-04&ss=b&srt=o&sp=rwdlactfx&se=2025-04-11T17:23:35Z&st=2025-04-09T09:23:35Z&spr=https,http&sig=jgevAvQaT%2FhAeJnJ36jhkE%2FVNern7BjpG3g1JQ6%2FNMA%3D';
const AZURE_CONTAINER_NAME = 'iit-jee-container';

// Blob base URL with SAS token
const AZURE_STORAGE_CONNECTION_STRING = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NAME}?${AZURE_SAS_TOKEN}`;

const ArrangeQuestions = ({ data, onClose }) => {
  const [questions, setQuestions] = useState(data?.questions || []);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedQuestions = Array.from(questions);
    const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, movedQuestion);
    setQuestions(reorderedQuestions);

    try {
      await axios.post('/TestCreation/updateQuestionOrder', {
        questions: reorderedQuestions.map((q, index) => ({
          question_id: q.question_id,
          sort_order: index + 1,
        })),
      });
    } catch (error) {
      console.error('Error updating sort order:', error);
      alert('Failed to update sort order.');
    }
  };

  const getBlobUrl = (blobName) => {
    return `${AZURE_STORAGE_CONNECTION_STRING}/${blobName}`;
  };

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupContent}>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
        <h2 className={styles.title}>{data?.TestName || 'Arrange Questions'}</h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={styles.questionsList}
              >
                {questions.map((question, index) => (
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
                        <div className={styles.questionTitle}>
                          <h5>Question: {index + 1}</h5>
                          <img
                            src={getBlobUrl(`${question.document_name}/questions/${question.questionImgName}`)}
                            alt={`Question ${question.question_id}`}
                            className={styles.imageContainer}
                          />
                        </div>

                        {question.options && question.options.length > 0 && (
                          <div className={styles.optionsBlock}>
                            <h5>Options:</h5>
                            {question.options.map((option) => (
                              <div
                                className={styles.optionBlock}
                                key={option.option_id}
                              >
                                <span>{option.option_index}:</span>
                                <img
                                  src={getBlobUrl(`${question.document_name}/options/${option.optionImgName}`)}
                                  alt={`Option ${option.option_index}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {question.solution &&
                          question.solution.solutionImgName && (
                            <div className={styles.solutionBlock}>
                              <h5>Solution:</h5>
                              <img
                                src={getBlobUrl(`${question.document_name}/solution/${question.solution.solutionImgName}`)}
                                alt="Solution"
                                className={styles.imageContainer}
                              />
                            </div>
                          )}

                        {question.paragraph &&
                          question.paragraph.paragraphImg && (
                            <div className={styles.paragraphBlock}>
                              <h5>Paragraph:</h5>
                              <img
                                src={getBlobUrl(`${question.document_name}/paragraph/${question.paragraph.paragraphImg}`)}
                                alt="Paragraph"
                                className={styles.imageContainer}
                              />
                            </div>
                          )}
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
