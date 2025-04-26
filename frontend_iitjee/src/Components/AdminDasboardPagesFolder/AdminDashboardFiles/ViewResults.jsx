import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL";
import styles from "../../../Styles/AdminDashboardCSS/ViewResults.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ViewResults = ({ onClose, testCreationTableId }) => {
  const [studentsData, setStudentsData] = useState([]);
  const [testInfo, setTestInfo] = useState({});
  const [questionwiseData, setQuestionwiseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("score-overview");
  const [participantsData, setParticipantsData] = useState([]);
  const [topperData, setTopperData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchData = async (viewType) => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      if (viewType === 'score-overview') {
        const response = await axios.get(`${BASE_URL}/ViewResults/score-overview/${testCreationTableId}`);
        const data = response.data;
        setStudentsData(data);
        const topper = data.find(student => student.student_status === "Topper");
        if (topper) {
          setTopperData(topper);
        }
        if (data.length > 0) {
          const { test_name, total_marks, course_name } = data[0];
          setTestInfo({
            test_name,
            total_marks,
            course_name,
          });
        }
      } else if (viewType === 'questionwise') {
        const response = await axios.get(`${BASE_URL}/ViewResults/questionwise/${testCreationTableId}`);
        setQuestionwiseData(response.data);
      } else if (viewType === 'participations') {
        const response = await axios.get(`${BASE_URL}/ViewResults/participations/${testCreationTableId}`);
        setParticipantsData(response.data);
      } else if (viewType === 'subjectwiseResults') {
        const response = await axios.get(`${BASE_URL}/ViewResults/subjectwise/${testCreationTableId}`);
        setStudentsData(response.data);
      }
    } catch (error) {
      setError("Failed to load data. Please try again later.");
      console.error("Error fetching data: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(viewType);
  }, [viewType, testCreationTableId]);

  const handleViewChange = (view) => {
    setViewType(view);
  };

  // Pagination logic for displaying records
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestionwiseData = questionwiseData.slice(indexOfFirstItem, indexOfLastItem);
  const currentParticipantsData = participantsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalParticipantPages = Math.ceil(participantsData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(questionwiseData.length / itemsPerPage);

  // Calculate the range of page numbers to display
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const chartData = studentsData.length > 0 && {
    labels: studentsData.map(student => student.candidate_name),
    datasets: [
      {
        label: 'Student Marks',
        data: studentsData.map(student => student.total_marks),
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={styles.viewResultsContainer}>
      <div className={styles.header}>
        <h2>View Results</h2>
        <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => handleViewChange('score-overview')} className={`${styles.button} ${viewType === 'score-overview' ? styles.activeButton : ''}`}>Score Overview</button>
        <button onClick={() => handleViewChange('questionwise')} className={`${styles.button} ${viewType === 'questionwise' ? styles.activeButton : ''}`}>Questionwise</button>
        <button onClick={() => handleViewChange('participations')} className={`${styles.button} ${viewType === 'participations' ? styles.activeButton : ''}`}>Participations</button>
        <button onClick={() => handleViewChange('subjectwiseResults')} className={`${styles.button} ${viewType === 'subjectwiseResults' ? styles.activeButton : ''}`}>Subjectwise Results</button>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {viewType === "score-overview" && (
            <div className={styles.scoreOverview}>
              <div className={styles.cardContainer}>
                <div className={styles.card}>
                  <h3>Test Details</h3>
                  <p><strong>Test Name:</strong> {testInfo.test_name}</p>
                  <p><strong>Total Marks:</strong> {testInfo.total_marks}</p>
                  <p><strong>Course Name:</strong> {testInfo.course_name}</p>
                </div>
                {topperData.student_registration_id && (
                  <div className={styles.card}>
                    <h3>Topper Details</h3>
                    <p><strong>Topper Name:</strong> {topperData.candidate_name}</p>
                    <p><strong>Total Marks:</strong> {topperData.total_marks}</p>
                    <p><strong>Percentage:</strong> {topperData.percentage}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewType === "questionwise" && (
            <div className={styles.questionwiseResults}>
              <h3>Questionwise Results</h3>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Question ID</th>
                    <th>Total Participants</th>
                    <th>Corrected By</th>
                    <th>Incorrected By</th>
                    <th>Unattempted By</th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuestionwiseData.length > 0 ? (
                    currentQuestionwiseData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.question_id}</td>
                        <td>{data.total_participants}</td>
                        <td>{data.correct_answers}</td>
                        <td>{data.incorrect_answers}</td>
                        <td>{data.unattempted_answers}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className={styles.pagination}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={currentPage === pageNumber ? styles.activePage : ''}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </div>
          )}

          {viewType === "participations" && (
            <div className={styles.participantsResults}>
              <h3>Participants Details</h3>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Total Attempts</th>
                    <th>Marks Obtained</th>
                    <th>Max Marks</th>
                    <th>Percentage (%)</th>
                    <th>Time Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {currentParticipantsData.length > 0 ? (
                    currentParticipantsData.map((participant, index) => (
                      <tr key={index}>
                        <td>{participant.student_registration_id}</td>
                        <td>{participant.total_attempts}</td>
                        <td>{participant.total_marks_obtained}</td>
                        <td>{participant.max_marks}</td>
                        <td>{participant.percentage}</td>
                        <td>{participant.time_spent_hhmmss}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={currentPage === pageNumber ? styles.activePage : ''}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalParticipantPages}>
                  Next
                </button>
              </div>
            </div>
          )}

          {viewType === "subjectwiseResults" && (
            <div className={styles.subjectwiseResults}>
              <h3>Subjectwise Results</h3>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Total Questions Attempted</th>
                    <th>Correct Answers</th>
                    <th>Incorrect Answers</th>
                    <th>Total Marks</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.length > 0 ? (
                    studentsData.map((student, index) => (
                      <tr key={index}>
                        <td>{student.candidate_name}</td>
                        <td>{student.subject_name}</td>
                        <td>{student.total_questions_attempted}</td>
                        <td>{student.correct_answers}</td>
                        <td>{student.incorrect_answers}</td>
                        <td>{student.total_marks}</td>
                        <td>{student.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {studentsData.length > 0 && viewType === "score-overview" && chartData && (
            <Line data={chartData} />
          )}
        </>
      )}
    </div>
  );
};

export default ViewResults;
