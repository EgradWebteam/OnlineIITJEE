import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../../../apiConfig";
import axios from 'axios';

const TopicForm = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicPdf, setTopicPdf] = useState(null);
  const [topicDoc, setTopicDoc] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/OrvlTopicCreation/getexams`);
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
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
        console.error('Error fetching subjects:', error);
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
  
    if (topicPdf) formData.append("topic_pdf", topicPdf);
    if (topicDoc) formData.append("topic_doc", topicDoc);
  
    try {
      const response = await axios.post(
        `${BASE_URL}/OrvlTopicCreation/addTopic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Topic submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting topic:", error.response?.data || error.message);
    }
  };
  
  
  

  return (
    <div>
      <h3>Create a New Topic</h3>
      <form onSubmit={handleSubmit} className='topicform'>
        <div>
          <input
            type="text"
            placeholder="Enter topic name"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            required
          />
        </div>

        {/* Exams Dropdown */}
        <div>
          <label>Select Exam:</label>
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} required>
            <option value="">--Select Exam--</option>
            {exams.map((exam) => (
              <option key={exam.exam_id} value={exam.exam_id}>
                {exam.exam_name}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Dropdown */}
        {subjects.length > 0 && (
          <div>
            <label>Select Subject:</label>
            <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} required>
              <option value="">--Select Subject--</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PDF Upload */}
        <div>
          <label>Upload Topic PDF:</label>
          <input type="file" accept="application/pdf" onChange={(e) => setTopicPdf(e.target.files[0])} />
        </div>

        {/* Documentation Upload */}
        <div>
          <label>Upload Topic Documentation:</label>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setTopicDoc(e.target.files[0])}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TopicForm;
