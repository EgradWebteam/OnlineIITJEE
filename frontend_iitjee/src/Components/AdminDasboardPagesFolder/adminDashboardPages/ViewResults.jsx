// import React, { useState, useEffect } from "react";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import DynamicTable from './DynamicTable';
// import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const TABS = {
//   SCORE: "score",
//   QUESTION: "question",
//   PARTICIPANTS: "participants",
//   SUBJECT: "subjectwise",
// };

// const ViewResults = ({ testCreationTableId, onClose }) => {
//   const [activeTab, setActiveTab] = useState(TABS.SCORE);
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const res = await fetch(`http://localhost:5000/OTS/ViewQuestions/${testCreationTableId}`);
//         const result = await res.json();
//         if (res.ok) setData(result);
//         else throw new Error("Failed to load data.");
//       } catch (err) {
//         setError("Error fetching data.");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchResults();
//   }, [testCreationTableId]);

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   const { maxPercentageUser, userStats = [], questionStats = [], subjectwiseStatus = [] } = data;

//   // Generate unique subject-section pairs
//   const uniqueSubjects = Array.from(
//     subjectwiseStatus
//       .filter(s => s.studentregistrationId !== null && s.section_type === "Normal")
//       .reduce((map, item) => {
//         map.set(`${item.subject_id}-${item.section_type}`, item);
//         return map;
//       }, new Map())
//       .values()
//   );

//   // Action handlers
//   const noop = (row) => console.log("Action clicked on row:", row);

//   return (
//     <div className={styles.popup_viewquestion}>
//       <div className={styles.popup_viewquestioncontent}>
//         <div className={styles.gototest_Reports_btncontiner}>
//           <div className={styles.flexbtns}>
//             <button onClick={() => setActiveTab(TABS.SCORE)} className={activeTab === TABS.SCORE ? styles.activeintest_adim : ""}>Score Overview</button>
//             <button onClick={() => setActiveTab(TABS.QUESTION)} className={activeTab === TABS.QUESTION ? styles.activeintest_adim : ""}>Question wise</button>
//             <button onClick={() => setActiveTab(TABS.PARTICIPANTS)} className={activeTab === TABS.PARTICIPANTS ? styles.activeintest_adim : ""}>Participants</button>
//             <button onClick={() => setActiveTab(TABS.SUBJECT)} className={activeTab === TABS.SUBJECT ? styles.activeintest_adim : ""}>Subjectwise Results</button>
//           </div>
//           <button onClick={() => onClose(true)} className={styles.closebtnviewresults}>Close</button>
//         </div>

//         {/* Tabs */}
//         {activeTab === TABS.SCORE && (
//           <div className={styles.overall_scores}>
//             <ul className={styles.overallscores_list}>
//               <li>Test Name: <b>{maxPercentageUser.TestName}</b></li>
//               <li>Total Marks: <b>{maxPercentageUser.totalMarks}</b></li>
//               <li>Course Name: <b>{maxPercentageUser.courseName}</b></li>
//               <li>Topper: <b>{maxPercentageUser.candidateName}</b></li>
//               <li>Topper Marks: <b>{maxPercentageUser.total_marks}</b></li>
//               <li>Topper Percentage: <b>{data.percentage}%</b></li>
//               <li>Attempted Users Count: <b>{data.attemptedUsersCount}</b></li>
//             </ul>

//             <div className={styles.score_Overview_lineChart}>
//               <Line
//                 data={{
//                   labels: userStats.map(u => u.candidateName),
//                   datasets: [{
//                     label: "Test Results",
//                     data: userStats.map(u => Math.abs(u.total_marks)),
//                     fill: false,
//                     borderColor: "rgb(75, 192, 192)",
//                     tension: 0.1,
//                   }]
//                 }}
//                 options={{
//                   plugins: {
//                     tooltip: {
//                       callbacks: {
//                         label: (tooltipItem) => `Candidate: ${tooltipItem.label}, Marks: ${tooltipItem.raw}`,
//                       }
//                     }
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         )}

//         {activeTab === TABS.QUESTION && (
//           <DynamicTable
//             columns={[
//               { header: "Question Id", accessor: "Q.No" },
//               { header: "Total Participants", accessor: "TotalParticipants" },
//               { header: "Corrected By", accessor: "CorrectedBy" },
//               { header: "In-corrected By", accessor: "In-correctedBy" },
//               { header: "Un-attempted By", accessor: "Un-attemptedBy" },
//             ]}
//             data={questionStats}
//             onEdit={noop}
//             onAssign={noop}
//             onDelete={noop}
//             onDownload={noop}
//             onToggle={noop}
//             showEdit={false}
//             showToggle={false}
//             type="questionOverview"
//           />
//         )}

//         {activeTab === TABS.PARTICIPANTS && (
//           <DynamicTable
//             columns={[
//               { header: "Rank", accessor: "rank" },
//               { header: "Participants", accessor: "candidateName" },
//               { header: "Correct", accessor: "correct_count" },
//               { header: "Incorrect", accessor: "incorrect_count" },
//               { header: "Max Score", accessor: "totalMarks" },
//               { header: "Student Score", accessor: "total_marks" },
//               { header: "Percentage", accessor: "percentage" },
//               { header: "Time Taken", accessor: "TimeSpent" },
//             ]}
//             data={userStats}
//             onEdit={noop}
//             onAssign={noop}
//             onDelete={noop}
//             onDownload={noop}
//             onToggle={noop}
//             showEdit={true}
//             showToggle={true}
//             type="testCreation"
//           />
//         )}

//         {activeTab === TABS.SUBJECT && (
//           <DynamicTable
//             columns={[
//               { header: "Student Name", accessor: "candidateName" },
//               ...uniqueSubjects.map(({ subject_id, section_type }) => ({
//                 header: `${subject_id}-${section_type}`,
//                 accessor: `${subject_id}-${section_type}`,
//               }))
//             ]}
//             data={userStats}
//             onEdit={noop}
//             onAssign={noop}
//             onDelete={noop}
//             onDownload={noop}
//             onToggle={noop}
//             showEdit={false}
//             showToggle={false}
//             type="subjectWise"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewResults;
import React from 'react'

const ViewResults = () => {
  return (
    <div>
      ViewResults
    </div>
  )
}

export default ViewResults

