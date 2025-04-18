import React, { useEffect, useState } from "react";
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";
import axios from "axios";
import { BASE_URL } from "../../../config/apiConfig.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";

const StudentReport = ({ testId, studentId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch(`${BASE_URL}/MyResults/StudentRankSummary/${studentId}/${testId}`)
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjectMarks = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/MyResults/TestSubjectWiseStudentMarks/${studentId}/${testId}`
        );
        setSubjectMarks(response.data.subjects);
      } catch (err) {
        setError("Error fetching data. Please try again later.");
        console.error("Error fetching data:", err);
      }
    };

    fetchSubjectMarks();
  }, [studentId, testId]);

  if (error) {
    return <div>{error}</div>;
  }
  // Convert HH:MM:SS to seconds
  const parseTimeToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert seconds to HH:MM:SS
  const formatToHHMMSS = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((val) => String(val).padStart(2, "0"))
      .join(":");
  };

  if (!data) return <p>Loading...</p>;

  const {
    duration,
    TimeLeft,
    rank_position,
    totalAttemptedStudents,
    test_total_marks,
    totalQuestions,
    totalCorrect,
    totalWrong,
    sumStatus1,
    sumStatus0,
  } = data;

  const timeLeftSec = parseTimeToSeconds(TimeLeft);
  const totalDurationSec = duration * 60;
  const timeSpentSec = totalDurationSec - timeLeftSec;

  const timeSpentPercentage = (timeSpentSec / totalDurationSec) * 100;
  const timeLeftPercentage = 100 - timeSpentPercentage;

  const notAttempted = totalQuestions - totalCorrect - totalWrong;

  const pieChartData1 = [
    { name: "Correct", value: totalCorrect },
    { name: "Wrong", value: totalWrong },
    { name: "Not Attempted", value: notAttempted },
  ];

  const pieChart1COLORS = ["#28a745", "#dc3545", "#77878a3d"];

  // Parse the marks data
  const correctMarks = parseInt(sumStatus1) || 0; // Marks for correct answers
  const wrongMarks = parseInt(sumStatus0) || 0; // Marks for wrong answers

  // Calculate total difference (correct marks - absolute of wrong marks)
  const totalDifference = correctMarks - Math.abs(wrongMarks);

  // Calculate the percentage using the provided formula
  let percentage = test_total_marks
    ? (totalDifference / test_total_marks) * 100
    : 0;
  percentage = percentage.toFixed(2); // Ensure percentage has two decimal places

  // Ensure percentage is not negative
  percentage = Math.max(percentage, 0);
  // Ring chart data
  const pieChartData2 = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  const pieChart2COLORS = ["#3e98c7", "#ffe9e9"]; // Green for score, grey for remaining

  return (
    <div className={styles.studentPerformanceReportMain}>
      <div className={styles.AIRholderDiv}>
        <div className={styles.airRankSubDiv}>
          AIR:{" "}
          <b>
            {rank_position}/{totalAttemptedStudents}
          </b>
        </div>
        <div className={styles.timeSpentContainer}>
          <p className={styles.timeProgressPara}>Time Progress</p>
          <div className={styles.timeProgressContainer}>
            
            <div className={styles.timeLeftContainer}>
              <p className={styles.timeLeftData}>
                {formatToHHMMSS(timeSpentSec)}
              </p>
              <p className={styles.timeLeftSpentPara}>
                <span className={styles.timeSpentIcon}></span>
                <span>Time Spent</span>
              </p>
            </div>
            <div className={styles.timeLeftContainer}>
              <p className={styles.timeLeftData}>
                {formatToHHMMSS(timeLeftSec)}
              </p>
              <p className={styles.timeLeftSpentPara}>
                <span className={styles.timeLeftIcon}></span>
                <span>Time Left</span>
              </p>
            </div>
          </div>
          <div
              style={{
                width: "100%",
                backgroundColor: "#ccc",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${timeSpentPercentage}%`,
                  height: "20px",
                  backgroundColor: "rgba(255, 0, 0, 0.5)",
                  transition: "width 1s",
                }}
                title={`Time Spent: ${formatToHHMMSS(timeSpentSec)} mins`}
              />
              <div
                style={{
                  width: `${timeLeftPercentage}%`,
                  height: "20px",
                  backgroundColor: "rgba(0, 0, 255, 0.5)",
                  position: "absolute",
                  top: 0,
                  left: `${timeSpentPercentage}%`,
                  transition: "width 1s",
                }}
                title={`Time Left: ${formatToHHMMSS(timeLeftSec)} mins`}
              />
            </div>
        </div>
      </div>

      <div className={styles.studentReportSubjectWiseConatiner}>
        <h2 className={styles.subjectWiseReportHeading}>Subject Wise Report</h2>
        <div className={styles.subjectwiseTableMainDiv}>
          <table
            className={styles.tableMain}
            border="1"
            cellPadding="10"
            cellSpacing="0"
          >
            <thead>
              <tr className={styles.tableTr}>
                <th className={styles.tableTh}>Subject Name</th>
                <th className={styles.tableTh}>Total Questions</th>
                <th className={styles.tableTh}>Correct</th>
                <th className={styles.tableTh}>Incorrect</th>
                <th className={styles.tableTh}>+ve Marks</th>
                <th className={styles.tableTh}>-ve Marks</th>
                <th className={styles.tableTh}>Total Marks</th>
              </tr>
            </thead>
            <tbody>
           
    {subjectMarks.map((subject) => (
            <tr key={subject.subject_id}  className={styles.tableTr}>
              <td className={styles.tableTd}>{subject.subject_name}</td>
              <td className={styles.tableTd}>{subject.total_questions}</td>
              <td className={styles.tableTd}>{subject.total_correct}</td>
              <td className={styles.tableTd}>{subject.total_incorrect}</td>
              <td className={styles.tableTd}>{subject.positive_marks}</td>
              <td className={styles.tableTd}>{subject.negative_marks}</td>
              <td className={styles.tableTd}>{subject.total_marks}</td>
            </tr>
          ))}
              <tr className={styles.tableTrTotalMarks}>
                <td>
                  <strong>Total</strong>
                </td>
                <td className={styles.tableTd}>
                  {" "}
                  {subjectMarks.reduce(
                    (sum, item) => sum + item.total_questions,
                    0
                  )}
                </td>
                <td className={styles.tableTd}>
                  {" "}
                  {subjectMarks.reduce(
                    (sum, item) => sum + Number(item.total_correct),
                    0
                  )}
                </td>
                <td className={styles.tableTd}>
                  {subjectMarks.reduce(
                    (sum, item) => sum + Number(item.total_incorrect),
                    0
                  )}
                </td>
                <td className={styles.tableTd}>
                  {subjectMarks.reduce(
                    (sum, item) => sum + item.positive_marks,
                    0
                  )}
                </td>
                <td className={styles.tableTd}>
                  {" "}
                  {subjectMarks.reduce(
                    (sum, item) => sum + item.negative_marks,
                    0
                  )}
                </td>
                <td className={styles.tableTd}>
                  {" "}
                  {subjectMarks.reduce(
                    (sum, item) => sum + item.total_marks,
                    0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.pieChartsMainDiv}>
        <div style={{ width: "53.125rem" , margin: "0 auto" }}>
          <h3 className={styles.pieChartHeadings}>Answer Evaluation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart style={{ transform: "scale(1.4)", transformOrigin: "center", marginTop: "3rem" }}>
              <Pie
                data={pieChartData1}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData1.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieChart1COLORS[index % pieChart1COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
          <h3 className={styles.pieChartHeadings}>Total Percentage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart style={{ transform: "scale(1.6)", transformOrigin: "center", marginTop: "2rem" }}>
              <Pie
                data={pieChartData2}
                cx="50%"
                cy="50%"
                innerRadius={60} // to create a ring shape
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData2.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieChart2COLORS[index % pieChart2COLORS.length]}
                  />
                ))}
                <Label
                  value={`${percentage}%`}
                  position="center"
                  fontSize={24}
                  fontWeight="bold"
                  fill="#333"
                />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
