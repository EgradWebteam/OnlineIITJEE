import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import styles from "../../../Styles/AdminDashboardCSS/TopicForm.module.css";

const OrvlTopicForm = ({ topic, onClose, onSuccess }) => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(topic ? topic.exam_id : '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(topic ? topic.subject_id : '');
  const [topicName, setTopicName] = useState(topic ? topic.orvl_topic_name : '');
  const [topicPdf, setTopicPdf] = useState(null); // now stores file instead of just name
  const [topicDoc, setTopicDoc] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/OrvlTopicCreation/getexams`);
        setExams(response.data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;

    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/CourseCreation/ExamSubjects/${selectedExamId}`);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [selectedExamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("topic_name", topicName);
    formData.append("exam_id", selectedExamId);
    formData.append("subject_id", selectedSubjectId);

    if (topicPdf) formData.append("topic_pdf", topicPdf); // ✅ binary
    if (topicDoc) formData.append("topic_doc", topicDoc); // ✅ binary

    try {
      const response = topic
        ? await axios.post(`${BASE_URL}/OrvlTopicCreation/updateTopic/${topic.orvl_topic_id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        : await axios.post(`${BASE_URL}/OrvlTopicCreation/addTopic`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

      console.log("Topic submitted successfully:", response.data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting topic:", error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.popup}>
        <h3 className={styles.heading}>{topic ? "Edit Topic" : "Create a New Topic"}</h3>
        <form onSubmit={handleSubmit} className={styles.topicForm}>
          <div className={styles.flex}>
            <label>Topic Name:</label>
            <input
              type="text"
              placeholder="Enter topic name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.flex}>
            <label>Select Exam:</label>
            <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} required className={styles.selectField}>
              <option value="">--Select Exam--</option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
          </div>

          {subjects.length > 0 && (
            <div className={styles.flex}>
              <label>Select Subject:</label>
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} required className={styles.selectField}>
                <option value="">--Select Subject--</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.flex}>
            <label>Upload Topic PDF:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setTopicPdf(e.target.files[0])}
              className={styles.inputFile}
            />
            {topic?.orvl_topic_pdf && !topicPdf && (
              <div className={styles.fileInfo}>
                <span>{topic.orvl_topic_pdf}</span>
              </div>
            )}
          </div>

          <div className={styles.flex}>
            <label>Upload Topic Documentation:</label>
            <input
              type="file"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setTopicDoc(e.target.files[0])}
              className={styles.inputFile}
            />
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={`${styles.submitBtn} button`}>
              {topic ? "Update" : "Submit"}
            </button>
            <button type="button" className={`${styles.closeBtn} button`} onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrvlTopicForm;
