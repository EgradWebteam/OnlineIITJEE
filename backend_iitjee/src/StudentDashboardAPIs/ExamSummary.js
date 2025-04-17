const express = require("express");
const router = express.Router();
const db = require("../config/database.js");


router.post("/SaveExamSummary", async (req, res) => {
    let connection;
    try {
      const {
        studentId,
        test_creation_table_id,
        totalQuestions,
        totalAnsweredQuestions,
        totalAnsweredMarkForReviewQuestions,
        totalMarkForReviewQuestions,
        totalNotAnsweredQuestions,
        totalVisitedQuestionQuestions,
        totalNotVisitedQuestions,
        totalAttemptedQuestions,
        totalNotAttemptedQuestions,
        TimeSpent,
      } = req.body;
  console.log("Received exam summary data from frontend:",req.body)
      const studentIdNumber = parseInt(studentId, 10);
      const test_creation_table_idNumber = parseInt(test_creation_table_id, 10);
  
      connection = await db.getConnection();
  
      const [existingEntry] = await connection.query(
        "SELECT student_registration_id,test_creation_table_id FROM iit_student_exam_summary WHERE student_registration_id = ? AND test_creation_table_id = ?",
        [studentIdNumber, test_creation_table_idNumber]
      );
  
      if (existingEntry.length > 0) {
        // Update existing entry
        const updateQuery = `
          UPDATE iit_student_exam_summary 
          SET 
            total_questions = ?, 
            answered_questions = ?, 
            answered_and_marked_for_review_questions = ?, 
            marked_for_review_questions =?,
            not_answered_questions = ?, 
            visited_questions = ?, 
            not_visited_questions = ?, 
            total_attempted_questions = ?, 
            total_not_attempted_questions = ?, 
            time_spent = ?
          WHERE 
            student_registration_id = ? AND test_creation_table_id = ?
        `;
  
        await connection.query(updateQuery, [
          totalQuestions,
          totalAnsweredQuestions,
          totalAnsweredMarkForReviewQuestions,
          totalMarkForReviewQuestions,
          totalNotAnsweredQuestions,
          totalVisitedQuestionQuestions,
          totalNotVisitedQuestions,
          totalAttemptedQuestions,
          totalNotAttemptedQuestions,
          TimeSpent,
          studentIdNumber,
          test_creation_table_idNumber,
        ]);
        console.log("Exam summary updated successfully")
        res.status(200).json({ success: true, message: "Exam summary updated successfully" });
      } else {
        // Insert new entry
        const insertQuery = `
          INSERT INTO iit_student_exam_summary 
          (
            student_registration_id,
            test_creation_table_id,
            total_questions,
            answered_questions,
            answered_and_marked_for_review_questions,
            marked_for_review_questions,
            not_answered_questions,
            visited_questions,
            not_visited_questions,
            total_attempted_questions,
            total_not_attempted_questions,
            time_spent
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;
  
        await connection.query(insertQuery, [
            studentIdNumber,
          test_creation_table_idNumber,
          totalQuestions,
          totalAnsweredQuestions,
          totalAnsweredMarkForReviewQuestions,
          totalMarkForReviewQuestions,
          totalNotAnsweredQuestions,
          totalVisitedQuestionQuestions,
          totalNotVisitedQuestions,
          totalAttemptedQuestions,
          totalNotAttemptedQuestions,
          TimeSpent,
        ]);
  console.log("Exam summary saved successfully")
        res.status(201).json({ success: true, message: "Exam summary saved successfully" });
      }
    } catch (error) {
      console.error("Error saving exam summary:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
      if (connection) connection.release();
    }
  });
  
  router.get("/OTSTestData/:testCreationTableId", async (req, res) => {
    const { testCreationTableId } = req.params;
    let connection;
  
    try {
      if (!testCreationTableId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
  
      connection = await db.getConnection();
  
      const [rows] = await connection.query(
        `SELECT 
          tct.test_name, 
          course.course_creation_id
        FROM iit_db.iit_test_creation_table AS tct
        JOIN iit_db.iit_course_creation_table AS course 
          ON tct.course_creation_id = course.course_creation_id
        JOIN iit_db.iit_exams AS exam 
          ON course.exam_id = exam.exam_id
        WHERE tct.test_creation_table_id = ?`,
        [testCreationTableId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "No test details found." });
      }
  
      res.status(200).json(rows[0]); // Send the result as a single object
    } catch (error) {
      console.error("Error fetching test details:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });
  
//   router.post('/UpdateTestAttemptStatus', async (req, res) => {
//     try {
//       // Extracting data from the request body
//       const { studentId, courseCreationId, test_creation_table_id, test_status, connection_status } = req.body;
  
//       if (!studentId || !courseCreationId || !test_creation_table_id || !test_status || !connection_status) {
//         return res.status(400).json({ message: "Missing required parameters" });
//       }
  
//       // Get the current date and time for test start and end (if needed)
//       const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
//       // Prepare the SQL query to update the status in `iit_test_status_details`
//       const updateQuery = `
//         UPDATE iit_test_status_details
//         SET
//           test_attempt_status = ?,
//           test_connection_status = ?,
//           student_test_end_date_time = ?
//         WHERE 
//           student_registration_id = ? AND
//           course_creation_id = ? AND
//           test_creation_table_id = ?
//       `;
  
//       // Execute the query
//       const result = await db.query(updateQuery, [
//         test_status,
//         connection_status,
//         currentDateTime, // You can adjust this if you want to set a different value for end date time
//         studentId,
//         courseCreationId,
//         test_creation_table_id
//       ]);
  
//       // Check if any rows were affected
//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "No matching test status found to update" });
//       }
  
//       // Respond with success
//       res.status(200).json({ message: "Test status updated successfully" });
//     } catch (error) {
//       console.error("Error updating test status:", error);
//       res.status(500).json({ message: "Internal server error", error: error.message });
//     }
//   });

//   router.get("/FetchExamSummaryCounts/:testCreationTableId/:user_Id", async (req, res) => {
//     let connection;
//     const { testCreationTableId, user_Id } = req.params;
//     console.log("examSummary req.params", req.params);

//     if (!testCreationTableId || !user_Id) {
//         return res.status(400).json({ message: "Missing required parameters" });
//     }

//     try {
//         connection = await db.getConnection();

//         const [
//             [incorrectResults],
//             [correctResults],
//             [questionCountResults],
//             [attemptResults]
//         ] = await Promise.all([
//             connection.query(
//                 `SELECT COUNT(*) AS total_incorrect_answers
//                 FROM user_responses ur
//                 JOIN questions q ON ur.question_id = q.question_id
//                 WHERE TRIM(ur.user_answer) != TRIM(q.answer_text)
//                 AND ur.studentregistrationId = ? AND ur.testCreationTableId = ?`,
//                 [user_Id, testCreationTableId]
//             ),
//             connection.query(
//                 `SELECT COUNT(*) AS total_correct_answers
//                 FROM user_responses ur
//                 JOIN questions q ON ur.question_id = q.question_id
//                 WHERE TRIM(ur.user_answer) = TRIM(q.answer_text)
//                 AND ur.studentregistrationId = ? AND ur.testCreationTableId = ?`,
//                 [user_Id, testCreationTableId]
//             ),
//             connection.query(
//                 `SELECT COUNT(q.question_id) AS total_question_count
//                 FROM test_creation_table t
//                 LEFT JOIN questions q ON t.testCreationTableId = q.testCreationTableId
//                 WHERE t.testCreationTableId = ?`,
//                 [testCreationTableId]
//             ),
//             connection.query(
//                 `SELECT COUNT(*) AS total_attempted_questions
//                 FROM user_responses
//                 WHERE studentregistrationId = ? AND testCreationTableId = ?`,
//                 [user_Id, testCreationTableId]
//             )
//         ]);

//         const totalIncorrect = incorrectResults[0]?.total_incorrect_answers || 0;
//         const totalCorrect = correctResults[0]?.total_correct_answers || 0;
//         const totalQuestions = questionCountResults[0]?.total_question_count || 0;
//         const totalAttempted = attemptResults[0]?.total_attempted_questions || 0;

//         // Update student_exam_summary
//         await connection.query(
//             `UPDATE student_exam_summary 
//              SET Total_AttemptedQuestions = ? 
//              WHERE studentregistrationId = ? AND testCreationTableId = ?`,
//             [totalAttempted, user_Id, testCreationTableId]
//         );

//         const responseObj = {
//             totalIncorrect,
//             totalCorrect,
//             totalQuestions,
//             totalAttempted,
//         };

//         console.log("examSummary response", responseObj);
//         res.status(200).json(responseObj);

//     } catch (error) {
//         console.error("Error fetching exam summary:", error);
//         res.status(500).json({ message: "Internal server error" });
//     } finally {
//         if (connection) connection.release();
//     }
// });


// router.post("/FetchStudentMarks", async (req, res) => {
//   let connection;
//   try {
//       connection = await db.getConnection();
      
//       const { student_registration_id, test_creation_table_id } = req.body;
      
//       // Fetch the user responses and question details from the database
//       const [responses] = await connection.query(`
//           SELECT
//               ur.student_registration_id,
//               ur.test_creation_table_id,
//               ur.subject_id,
//               ur.section_id,
//               ur.question_id,
//               ur.user_answer,
//               q.answer_text,
//               q.qtype_text,
//               q.marks_text,
//               q.nmarks_text
//           FROM
//               iit_user_responses ur
//           JOIN
//               iit_questions q ON ur.question_id = q.question_id
//           WHERE
//               ur.test_creation_table_id = ?
//               AND ur.student_registration_id = ?
//               AND ur.question_status IN (1, 2)
//       `, [test_creation_table_id, student_registration_id]);

//       // Loop through responses and insert marks into the iit_student_marks table
//       for (const response of responses) {
//           const {
//               student_registration_id,
//               test_creation_table_id,
//               subject_id,
//               section_id,
//               question_id,
//               user_answer,
//               answer_text,
//               marks_text,
//               nmarks_text
//           } = response;

//           // Check if the student's answer is correct
//           const correct = user_answer?.trim().toLowerCase() === answer_text?.trim().toLowerCase();

//           // Calculate the student's marks (full marks if correct, else negative marks)
//           const student_marks = correct ? parseFloat(marks_text) : parseFloat(nmarks_text || 0);
//           const status = correct ? 1 : 0;

//           // Insert student marks into the database
//           await connection.query(`
//               INSERT INTO iit_student_marks (
//                   student_registration_id, 
//                   test_creation_table_id, 
//                   subject_id, 
//                   section_id, 
//                   question_id, 
//                   student_marks, 
//                   status
//               ) VALUES (?, ?, ?, ?, ?, ?, ?)
//           `, [
//               student_registration_id,
//               test_creation_table_id,
//               subject_id,
//               section_id,
//               question_id,
//               student_marks,
//               status
//           ]);
//       }

//       // Respond with a success message
//       res.status(200).json({ message: "Student marks calculated and stored successfully." });

//   } catch (error) {
//       console.error("Error in FetchStudentMarks:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//       if (connection) connection.release();
//   }
// });



// router.get("/FetchStudentMarks/:testCreationTableId/:studentregistrationId", async (req, res) => {
//   let connection;
//   try {
//     // Get a connection from the pool (it's similar to your previous code's db.getConnection())
//     connection = await pool.getConnection();  // Acquire a connection from the pool

//     const { testCreationTableId, user_Id } = req.query;  // Assuming you get these from query params

//     // Perform the query (similar to your original SQL)
//     const [userResponseRows] = await connection.query(
//       `SELECT
//           ur.studentregistrationId,
//           ur.testCreationTableId,
//           ur.subjectId,
//           ur.sectionId,
//           ur.question_id,
//           ur.user_answer,
//           q.answer_text,
//           q.qtype_text,
//           q.marks_text,
//           q.nmarks_text
//       FROM user_responses ur
//       JOIN questions q ON ur.question_id = q.question_id
//       WHERE ur.testCreationTableId = ? AND ur.studentregistrationId = ? 
//         AND ur.question_status IN (1, 2)`,
//       [testCreationTableId, user_Id]
//     );

//     // Process the result as needed (marks calculation)
//     const marks = userResponseRows.map(row => {
//       const userAnswer = row.user_answer.trim().toLowerCase();
//       const correctAnswer = row.answer_text.trim().toLowerCase();
//       let marksAwarded = 0;

//       if (userAnswer === correctAnswer) {
//         marksAwarded = parseFloat(row.marks_text) || 0;
//       } else {
//         marksAwarded = parseFloat(row.nmarks_text) || 0;
//       }

//       return {
//         studentregistrationId: row.studentregistrationId,
//         testCreationTableId: row.testCreationTableId,
//         subjectId: row.subjectId,
//         sectionId: row.sectionId,
//         question_id: row.question_id,
//         marksAwarded
//       };
//     });

//     // Insert calculated marks into the student_marks table
//     const insertQueries = marks.map(mark => {
//       return connection.query(
//         `INSERT INTO student_marks 
//           (studentregistrationId, testCreationTableId, subjectId, sectionId, question_id, std_marks) 
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [mark.studentregistrationId, mark.testCreationTableId, mark.subjectId, mark.sectionId, mark.question_id, mark.marksAwarded]
//       );
//     });

//     // Wait for all insertions to finish
//     await Promise.all(insertQueries);

//     // Send the response with the calculated marks
//     res.json(marks);

//   } catch (error) {
//     console.error("Error in fetching student marks:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     // Always release the connection back to the pool
//     if (connection) connection.release();  // Release the connection back to the pool
//   }
// });


// router.get("/FetchStudentMarks/:testCreationTableId/:studentregistrationId", async (req, res) => {
//   let connection;
//   try {
//     connection = await pool.getConnection();  // Acquire a connection from the pool

//     const { testCreationTableId, user_Id } = req.query;  // Assuming you get these from query params

//     // Query to join the tables and fetch the exam_id for the specific test
//     const [testInfoRows] = await connection.query(
//       `SELECT
//           t.test_creation_table_id,
//           t.test_name,
//           c.exam_id
//       FROM iit_test_creation_table t
//       JOIN iit_course_creation_table c ON t.course_creation_id = c.course_creation_id
//       WHERE t.test_creation_table_id = ?`, 
//       [testCreationTableId]
//     );

//     if (!testInfoRows || testInfoRows.length === 0) {
//       return res.status(404).json({ error: "Test not found or invalid test ID" });
//     }

//     const examId = testInfoRows[0].exam_id;  // Exam ID linked to the test

//     // Fetch the student responses for the specified test
//     const [userResponseRows] = await connection.query(
//       `SELECT
//           ur.studentregistrationId,
//           ur.testCreationTableId,
//           ur.subjectId,
//           ur.sectionId,
//           ur.question_id,
//           ur.user_answer,
//           q.answer_text,
//           q.qtype_text,
//           q.marks_text,
//           q.nmarks_text
//       FROM user_responses ur
//       JOIN questions q ON ur.question_id = q.question_id
//       WHERE ur.testCreationTableId = ? AND ur.studentregistrationId = ? 
//         AND ur.question_status IN (1, 2)`, 
//       [testCreationTableId, user_Id]
//     );

//     // Process the result as needed (marks calculation)
//     const marks = userResponseRows.map(row => {
//       const userAnswer = row.user_answer.trim().toLowerCase();
//       const correctAnswer = row.answer_text.trim().toLowerCase();
//       let marksAwarded = 0;
//       let status = 0;  // Default status is 0 (incorrect)

//       // Score calculation based on exam_id (JEE Main or JEE Advanced)
//       if (examId === 1) { // JEE Main
//         if (row.qtype_text === 'MCQ') {
//           if (userAnswer === "" || userAnswer === null) {
//             marksAwarded = 0;     // Unanswered
//             status = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = 4;     // Correct MCQ
//             status = 1;
//           } else {
//             marksAwarded = -1;    // Incorrect MCQ
//             status = 0;
//           }
//         } else if (row.qtype_text === 'NVQ') {
//           if (userAnswer === "" || userAnswer === null) {
//             marksAwarded = 0;     // Unanswered
//             status = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = 4;     // Correct NVQ
//             status = 1;
//           } else {
//             marksAwarded = 0;     // Incorrect NVQ (no negative marking)
//             status = 0;
//           }
//         }
//       }
//       else if (examId === 2) { // JEE Advanced
//         if (row.qtype_text === 'MCQ4') {
//           if (userAnswer === "" || userAnswer === null) {
//             marksAwarded = 0;   // Unanswered
//             status = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = parseFloat(row.marks_text) || 0;  // Full marks for correct MCQ
//             status = 1;
//           } else {
//             marksAwarded = 0;   // Incorrect MCQ (no negative marking for now)
//             status = 0;
//           }
//         } else if (row.qtype_text === 'NATI') {
//           if (userAnswer === "" || userAnswer === null) {
//             marksAwarded = 0;   // Unanswered
//             status = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = parseFloat(row.marks_text) || 0;  // Full marks for correct NATI
//             status = 1;
//           } else {
//             marksAwarded = 0;   // Incorrect NATI (no negative marking)
//             status = 0;
//           }
//         }
//       }
      

//       return {
//         studentregistrationId: row.studentregistrationId,
//         testCreationTableId: row.testCreationTableId,
//         subjectId: row.subjectId,
//         sectionId: row.sectionId,
//         question_id: row.question_id,
//         marksAwarded,
//         status,  // Add status (1 for correct, 0 for incorrect)
//       };
//     });

//     // Insert calculated marks and status into the student_marks table
//     const insertQueries = marks.map(mark => {
//       return connection.query(
//         `INSERT INTO student_marks 
//           (studentregistrationId, testCreationTableId, subjectId, sectionId, question_id, std_marks, status) 
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [mark.studentregistrationId, mark.testCreationTableId, mark.subjectId, mark.sectionId, mark.question_id, mark.marksAwarded, mark.status]
//       );
//     });

//     // Wait for all insertions to finish
//     await Promise.all(insertQueries);

//     // Send the response with the calculated marks
//     res.json(marks);

//   } catch (error) {
//     console.error("Error in fetching student marks:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     // Always release the connection back to the pool
//     if (connection) connection.release();  // Release the connection back to the pool
//   }
// });






router.post("/UpdateTestAttemptStatus", async (req, res) => {
  try {
    const {
      studentId,
      courseCreationId,
      test_creation_table_id,
      test_status,
      connection_status,
    } = req.body;

    const missingParams = [];
    if (!studentId) missingParams.push("studentId");
    if (!courseCreationId) missingParams.push("courseCreationId");
    if (!test_creation_table_id) missingParams.push("test_creation_table_id");
    if (!test_status) missingParams.push("test_status");
    if (!connection_status) missingParams.push("connection_status");

    if (missingParams.length > 0) {
      return res.status(400).json({
        message: "Missing required parameters",
        missingParams,
      });
    }

    const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    const updateQuery = 
     ` UPDATE iit_test_status_details
      SET
        test_attempt_status = ?,
        test_connection_status = ?,
        student_test_end_date_time = ?
      WHERE 
        student_registration_id = ? AND
        course_creation_id = ? AND
        test_creation_table_id = ?
    ;`

    const [result] = await db.query(updateQuery, [
      test_status,
      connection_status,
      currentDateTime,
      studentId,
      courseCreationId,
      test_creation_table_id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No matching test status found to update" });
    }

    res.status(200).json({ message: "Test status updated successfully" });
  } catch (error) {
    console.error("Error updating test status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/FetchExamSummaryCounts/:testCreationTableId/:user_Id", async (req, res) => {
  let connection;
  const { testCreationTableId, user_Id } = req.params;
  console.log("examSummary req.params", req.params);

  if (!testCreationTableId || !user_Id) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    connection = await db.getConnection();

    const [
      [incorrectResults],
      [correctResults],
      [questionCountResults],
      [attemptResults]
    ] = await Promise.all([
      connection.query(
      `  SELECT COUNT(*) AS total_incorrect_answers
                FROM iit_user_responses ur
                JOIN iit_questions q ON ur.question_id = q.question_id
                WHERE TRIM(ur.user_answer) != TRIM(q.answer_text)
                AND ur.student_registration_id = ? AND ur.test_creation_table_id = ?,`
        [user_Id, testCreationTableId]
      ),
      connection.query(
      `  SELECT COUNT(*) AS total_correct_answers
                FROM iit_user_responses ur
                JOIN iit_questions q ON ur.question_id = q.question_id
                WHERE TRIM(ur.user_answer) = TRIM(q.answer_text)
                AND ur.student_registration_id = ? AND ur.test_creation_table_id = ?,`
        [user_Id, testCreationTableId]
      ),
      connection.query(
     `   SELECT COUNT(q.question_id) AS total_question_count
                FROM iit_test_creation_table t
                LEFT JOIN iit_questions q ON t.test_creation_table_id = q.test_creation_table_id
                WHERE t.test_creation_table_id = ?,`
        [testCreationTableId]
      ),
      connection.query(
       ` SELECT COUNT(*) AS total_attempted_questions
                FROM iit_user_responses
                WHERE student_registration_id = ? AND test_creation_table_id = ?,`
        [user_Id, testCreationTableId]
      )
    ]);

    const totalIncorrect = incorrectResults[0]?.total_incorrect_answers || 0;
    const totalCorrect = correctResults[0]?.total_correct_answers || 0;
    const totalQuestions = questionCountResults[0]?.total_question_count || 0;
    const totalAttempted = attemptResults[0]?.total_attempted_questions || 0;



    const responseObj = {
      totalIncorrect,
      totalCorrect,
      totalQuestions,
      totalAttempted,
    };

    console.log("examSummary response", responseObj);
    res.status(200).json(responseObj);

  } catch (error) {
    console.error("Error fetching exam summary:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});



router.get("/FetchStudentMarks/:testCreationTableId/:studentregistrationId", async (req, res) => {
  let connection;

  try {
    connection = await db.getConnection();

    const { testCreationTableId, studentregistrationId } = req.params;
    console.log("⏳ Request Params:", { testCreationTableId, studentregistrationId });

    // Step 1: Fetch exam_id using testCreationTableId
    const [testInfoRows] = await connection.query(
     ` SELECT
          t.test_creation_table_id,
          t.test_name,
          c.exam_id
        FROM iit_test_creation_table t
        JOIN iit_course_creation_table c ON t.course_creation_id = c.course_creation_id
        WHERE t.test_creation_table_id = ?,`
      [testCreationTableId]
    );
    console.log("📄 testInfoRows:", testInfoRows);

    if (!testInfoRows || testInfoRows.length === 0) {
      console.warn("⚠️ Test not found for ID:", testCreationTableId);
      return res.status(404).json({ error: "Test not found or invalid test ID" });
    }

    const examId = testInfoRows[0].exam_id;
    console.log("🎯 examId:", examId);

    // Step 2: Fetch user responses
    const [userResponseRows] = await connection.query(
      `SELECT
          ur.student_registration_id,
          ur.test_creation_table_id,
          ur.subject_id,
          ur.section_id,
          ur.question_id,
          ur.user_answer,
          ur.question_type_id,
          q.answer_text,
          q.marks_text,
          q.nmarks_text
        FROM iit_user_responses ur
        JOIN iit_questions q ON ur.question_id = q.question_id
        WHERE ur.test_creation_table_id = ? 
          AND ur.student_registration_id = ?
          AND ur.question_status IN (1, 2),`
      [testCreationTableId, studentregistrationId]
    );
    console.log("📦 userResponseRows:", userResponseRows);

    const marks = userResponseRows.map(row => {
      const userAnswer = (row.user_answer || "").trim().toLowerCase();
      const correctAnswer = (row.answer_text || "").trim().toLowerCase();
      let marksAwarded = 0;
      let status = 0;
      console.log("userAnswer", userAnswer);
      console.log("correctAnswer", correctAnswer);
      console.log("examId", examId);
      console.log("examId === 1", examId === 1)
      if (examId === 1) { // JEE Main
        console.log("examId", examId)
        console.log("row.qtype_text", row.question_type_id)
        if (row.question_type_id === 1) {
          console.log("MCQ4")
          console.log("!userAnswer", !userAnswer);
          console.log("userAnswer === correctAnswer", userAnswer === correctAnswer);

          if (!userAnswer) {
            marksAwarded = 0;
          } else if (userAnswer === correctAnswer) {
            marksAwarded = 4;
            status = 1;
          } else {
            marksAwarded = -1;
          }
        } else if (row.question_type_id === 5) {
          if (!userAnswer) {
            marksAwarded = 0;
          } else if (userAnswer === correctAnswer) {
            marksAwarded = 4;
            status = 1;
          }
        }
      } else if (examId === 2) { // JEE Advanced
        if (row.question_type_id === 1 || row.question_type_id === 5) {
          if (!userAnswer) {
            marksAwarded = 0;
          } else if (userAnswer === correctAnswer) {
            marksAwarded = parseFloat(row.marks_text) || 0;
            status = 1;
          }
        }
      }

      const result = {
        studentregistrationId: row.student_registration_id,
        testCreationTableId: row.test_creation_table_id,
        subjectId: row.subject_id,
        sectionId: row.section_id,
        question_id: row.question_id,
        marksAwarded,
        status,
      };
      console.log("📊 Calculated Result:", result);
      return result;
    });

    console.log("marks", marks);

    // Step 3: Insert into student_marks table
    const insertQueries = marks.map(mark => {
      console.log("📥 Inserting into student_marks:", mark);
      return connection.query(
        `INSERT INTO iit_student_marks 
          (student_registration_id, test_creation_table_id, subject_id, section_id, question_id, student_marks, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mark.studentregistrationId,
          mark.testCreationTableId,
          mark.subjectId,
          mark.sectionId,
          mark.question_id,
          mark.marksAwarded,
          mark.status
        ]
      );
    });

    console.log("insertQueries", insertQueries);
    await Promise.all(insertQueries);
    console.log("✅ All marks inserted successfully");

    res.json(marks);

  } catch (error) {
    console.error("❌ Error in fetching student marks:", error);
    res.status(500).json({ error: "Internal Server Error" });

  } finally {
    if (connection) connection.release();
  }
});




router.delete("/DeleteStudentDataWindowClose/:studentId/:testCreationTableId", async (req, res) => {
  try {
    const { studentId, testCreationTableId } = req.params; // Correcting to extract parameters from req.params

    if (!studentId || !testCreationTableId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const testStatus = await db.query(
      `SELECT test_attempt_status FROM iit_test_status_details WHERE student_registration_id = ? AND test_creation_table_id = ?`,
      [studentId, testCreationTableId]
    );

    console.log("Test Status:", testStatus);

    if (!testStatus || testStatus.length === 0) {
      console.log("No test record found, skipping deletion.");
      return res.status(404).json({ message: "No test record found." });
    }

    // Flatten the testStatus array and check if any status is 'completed'
    const isCompleted = testStatus.flat().some(status => status.testAttemptStatus && status.testAttemptStatus.toLowerCase() === "completed");

    if (isCompleted) {
      console.log("Test was completed. Data not deleted.");
      return res.status(200).json({ message: "Test completed, data not deleted." });
    }

    // Proceed with deletion if testAttemptStatus is not "completed"
    const deleteQueries = [
      { query: `DELETE FROM iit_user_responses WHERE student_registration_id = ? AND test_creation_table_id = ?`, values: [studentId, testCreationTableId] },
      { query: `DELETE FROM iit_student_exam_summary WHERE student_registration_id = ? AND test_creation_table_id = ?`, values: [studentId, testCreationTableId] },
      { query: `DELETE FROM iit_test_status_details WHERE student_registration_id = ? AND test_creation_table_id = ?`, values: [studentId, testCreationTableId] },
      { query: `DELETE FROM iit_student_marks WHERE student_registration_id = ? AND test_creation_table_id = ?`, values: [studentId, testCreationTableId] },
    ];

    for (const { query, values } of deleteQueries) {
      await db.query(query, values);
    }

    console.log(`Test data deleted for student ${studentId} (Test ID: ${testCreationTableId})`);
    return res.status(200).json({ message: "Test data deleted successfully." });

  } catch (error) {
    console.error("Error deleting user data:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


  module.exports = router;