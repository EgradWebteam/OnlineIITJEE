import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import QuestionData from "../../../Components/StudentDashboardPagesFolder/JSON_Files/QuestionsData.json";
import { BASE_URL } from '../../../config/apiConfig';
const AZURE_STORAGE_ACCOUNT_NAME = 'iitstorage';
const AZURE_SAS_TOKEN = 'sv=2024-11-04&ss=b&srt=o&sp=rwdlactfx&se=2025-04-11T17:23:35Z&st=2025-04-09T09:23:35Z&spr=https,http&sig=jgevAvQaT%2FhAeJnJ36jhkE%2FVNern7BjpG3g1JQ6%2FNMA%3D';
const AZURE_CONTAINER_NAME = 'iit-jee-container';
const AZURE_STORAGE_CONNECTION_STRING = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NAME}?${AZURE_SAS_TOKEN}`;

const ArrangeQuestions = ({ onClose }) => {
  // Get the first subject and section questions from JSON file
  const allSubjects = QuestionData.subjects || [];
  const firstSubject = allSubjects[0];
  const firstSection = firstSubject?.sections[0];
  const defaultQuestions = firstSection?.questions || [];

  const [questions, setQuestions] = useState(defaultQuestions);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const reorderedQuestions = Array.from(questions);
    const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, movedQuestion);
    setQuestions(reorderedQuestions);

    try {
      await axios.post('http://localhost:5000/OTS/QusetionsSorting', {
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
    <div className={styles.popup_viewquestion}>
      <div className={styles.popup_viewquestioncontent}>
        <button onClick={onClose} className={styles.closebutton_viewquestion}>✖</button>
        <h2 className={styles.viewquestion_title}>
          {QuestionData?.TestName || 'Arrange Questions'}
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
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
                        className={styles.questionblock_viewquestion}
                      >
                        <div>
                          <h5 className={styles.viewquestion_heading}>Question: {index + 1}</h5>
                          <img
                            src={getBlobUrl(`${question.document_name}/questions/${question.questionImgName}`)}
                            alt={`Question ${question.question_id}`}
                            className={styles.viewquestion_image}
                          />
                        </div>

                        {question.options && question.options.length > 0 && (
                          <div>
                            <h5 className={styles.viewquestion_heading}>Options:</h5>
                            {question.options.map((option) => (
                              <div
                                className={styles.optionblock_viewquestion}
                                key={option.option_id}
                              >
                                <span>{option.option_index}:</span>
                                <img
                                  src={getBlobUrl(`${question.document_name}/options/${option.optionImgName}`)}
                                  alt={`Option ${option.option_index}`}
                                  className={styles.viewquestion_image}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {question.solution?.solutionImgName && (
                          <div>
                            <h5 className={styles.viewquestion_heading}>Solution:</h5>
                            <img
                              src={getBlobUrl(`${question.document_name}/solution/${question.solution.solutionImgName}`)}
                              alt="Solution"
                              className={styles.viewquestion_image}
                            />
                          </div>
                        )}

                        {question.paragraph?.paragraphImg && (
                          <div>
                            <h5 className={styles.viewquestion_heading}>Paragraph:</h5>
                            <img
                              src={getBlobUrl(`${question.document_name}/paragraph/${question.paragraph.paragraphImg}`)}
                              alt="Paragraph"
                              className={styles.viewquestion_image}
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
