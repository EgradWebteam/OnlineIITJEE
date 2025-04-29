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
    // console.log("Received exam summary data from frontend:", req.body);
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
      // console.log("Exam summary updated successfully");
      res
        .status(200)
        .json({ success: true, message: "Exam summary updated successfully" });
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
      // console.log("Exam summary saved successfully");
      res
        .status(201)
        .json({ success: true, message: "Exam summary saved successfully" });
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



router.post("/UpdateTestAttemptStatus", async (req, res) => {
  const {
    studentId,
    courseCreationId,
    test_creation_table_id,
    test_status,
    connection_status,
  } = req.body;

  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const sql = `
    UPDATE iit_test_status_details
    SET
      test_attempt_status = ?,
      test_connection_status = ?,
      student_test_end_date_time = ?
    WHERE
      student_registration_id = ? AND
      course_creation_id = ? AND
      test_creation_table_id = ?
  `;

  try {
    const [result] = await db.query(sql, [
      test_status,
      connection_status,
      currentDateTime,
      studentId,
      courseCreationId,
      test_creation_table_id,
    ]);

    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// router.post("/UpdateTestAttemptStatus", async (req, res) => {
//   try {
//     const {
//       studentId,
//       courseCreationId,
//       test_creation_table_id,
//       test_status,
//       connection_status,
//     } = req.body;
// console.log("req.body",req.body)
//     const missingParams = [];
//     if (!studentId) missingParams.push("studentId");
//     if (!courseCreationId) missingParams.push("courseCreationId");
//     if (!test_creation_table_id) missingParams.push("test_creation_table_id");
//     if (!test_status) missingParams.push("test_status");
//     if (!connection_status) missingParams.push("connection_status");

//     if (missingParams.length > 0) {
//       return res.status(400).json({
//         message: "Missing required parameters",
//         missingParams,
//       });
//     }

//     const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

//     const updateQuery =
//      ` UPDATE iit_test_status_details
//       SET
//         test_attempt_status = ?,
//         test_connection_status = ?,
//         student_test_end_date_time = ?
//       WHERE
//         student_registration_id = ? AND
//         course_creation_id = ? AND
//         test_creation_table_id = ?
//     ;`

//     const [result] = await db.query(updateQuery, [
//       test_status,
//       connection_status,
//       currentDateTime,
//       studentId,
//       courseCreationId,
//       test_creation_table_id,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "No matching test status found to update" });
//     }

//     res.status(200).json({ message: "Test status updated successfully" });
//   } catch (error) {
//     console.error("Error updating test status:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// });

router.get(
  "/FetchExamSummaryCounts/:testCreationTableId/:user_Id",
  async (req, res) => {
    let connection;
    const { testCreationTableId, user_Id } = req.params;
    // console.log("examSummary req.params", req.params);

    if (!testCreationTableId || !user_Id) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
      connection = await db.getConnection();

      const [
        [incorrectResults],
        [correctResults],
        [questionCountResults],
        [attemptResults],
      ] = await Promise.all([
        connection.query(
          `SELECT COUNT(*) AS total_incorrect_answers
         FROM iit_user_responses ur
         JOIN iit_questions q ON ur.question_id = q.question_id
         WHERE TRIM(ur.user_answer) != TRIM(q.answer_text)
         AND ur.student_registration_id = ? AND ur.test_creation_table_id = ?`,
          [user_Id, testCreationTableId]
        ),
        connection.query(
          `SELECT COUNT(*) AS total_correct_answers
         FROM iit_user_responses ur
         JOIN iit_questions q ON ur.question_id = q.question_id
         WHERE TRIM(ur.user_answer) = TRIM(q.answer_text)
         AND ur.student_registration_id = ? AND ur.test_creation_table_id = ?`,
          [user_Id, testCreationTableId]
        ),
        connection.query(
          `SELECT COUNT(q.question_id) AS total_question_count
         FROM iit_test_creation_table t
         LEFT JOIN iit_questions q ON t.test_creation_table_id = q.test_creation_table_id
         WHERE t.test_creation_table_id = ?`,
          [testCreationTableId]
        ),
        connection.query(
          `SELECT COUNT(*) AS total_attempted_questions
         FROM iit_user_responses
         WHERE student_registration_id = ? AND test_creation_table_id = ?`,
          [user_Id, testCreationTableId]
        ),
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

      // console.log("examSummary response", responseObj);
      res.status(200).json(responseObj);
    } catch (error) {
      console.error("Error fetching exam summary:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  }
);


//main previous
// router.get("/FetchStudentMarks/:testCreationTableId/:studentregistrationId", async (req, res) => {
//   let connection;

//   try {
//     connection = await db.getConnection();

//     const { testCreationTableId, studentregistrationId } = req.params;
//     console.log("⏳ Request Params:", { testCreationTableId, studentregistrationId });

//     // Step 1: Fetch exam_id using testCreationTableId
//     const [testInfoRows] = await connection.query(
//       `SELECT
//         t.test_creation_table_id,
//         t.test_name,
//         c.exam_id
//       FROM iit_test_creation_table t
//       JOIN iit_course_creation_table c ON t.course_creation_id = c.course_creation_id
//       WHERE t.test_creation_table_id = ?`,
//       [testCreationTableId] // ✅ Removed trailing comma
//     );
//     console.log("📄 testInfoRows:", testInfoRows);

//     if (!testInfoRows || testInfoRows.length === 0) {
//       console.warn("⚠️ Test not found for ID:", testCreationTableId);
//       return res.status(404).json({ error: "Test not found or invalid test ID" });
//     }

//     const examId = testInfoRows[0].exam_id;
//     console.log("🎯 examId:", examId);

//     // Step 2: Fetch user responses
//     const [userResponseRows] = await connection.query(
//       `SELECT
//         ur.student_registration_id,
//         ur.test_creation_table_id,
//         ur.subject_id,
//         ur.section_id,
//         ur.question_id,
//         ur.user_answer,
//         ur.question_type_id,
//         q.answer_text,
//         q.marks_text,
//         q.nmarks_text
//       FROM iit_user_responses ur
//       JOIN iit_questions q ON ur.question_id = q.question_id
//       WHERE ur.test_creation_table_id = ?
//         AND ur.student_registration_id = ?
//         AND ur.question_status IN (1, 2)`, // ✅ Removed trailing comma
//       [testCreationTableId, studentregistrationId]
//     );
//     console.log("📦 userResponseRows:", userResponseRows);

//     const marks = userResponseRows.map(row => {
//       const userAnswer = (row.user_answer || "").trim().toLowerCase();
//       const correctAnswer = (row.answer_text || "").trim().toLowerCase();
//       let marksAwarded = 0;
//       let status = 0;

//       if (examId === 1) { // JEE Main
//         if (row.question_type_id === 1 || row.question_type_id === 2 || row.question_type_id === 5) {
//           if (!userAnswer) {
//             marksAwarded = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = 4;
//             status = 1;
//           } else {
//             if (row.question_type_id === 1) {
//               marksAwarded = -1;
//             }
//           }
//         }
//       } else if (examId === 2) { // JEE Advanced
//         if (row.question_type_id === 1 || row.question_type_id === 2 || row.question_type_id === 5) {
//           if (!userAnswer) {
//             marksAwarded = 0;
//           } else if (userAnswer === correctAnswer) {
//             marksAwarded = parseFloat(row.marks_text) || 0;
//             status = 1;
//           }
//         }
//       }

//       return {
//         studentregistrationId: row.student_registration_id,
//         testCreationTableId: row.test_creation_table_id,
//         subjectId: row.subject_id,
//         sectionId: row.section_id,
//         question_id: row.question_id,
//         marksAwarded,
//         status,
//       };
//     });

//     // Step 3: Insert into student_marks table
//     const insertQueries = marks.map(mark => {
//       return connection.query(
//         `INSERT INTO iit_student_marks
//           (student_registration_id, test_creation_table_id, subject_id, section_id, question_id, student_marks, status)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           mark.studentregistrationId,
//           mark.testCreationTableId,
//           mark.subjectId,
//           mark.sectionId,
//           mark.question_id,
//           mark.marksAwarded,
//           mark.status
//         ]
//       );
//     });

//     await Promise.all(insertQueries);
//     console.log("✅ All marks inserted successfully");

//     res.json(marks);

//   } catch (error) {
//     console.error("❌ Error in fetching student marks:", error);
//     res.status(500).json({ error: "Internal Server Error" });

//   } finally {
//     if (connection) connection.release();
//   }
// });

//MAIN WORKING CODE
router.get(
  "/FetchStudentMarks/:testCreationTableId/:studentregistrationId",
  async (req, res) => {
    let connection;

    try {
      connection = await db.getConnection();

      const { testCreationTableId, studentregistrationId } = req.params;
      // console.log("⏳ Request Params:", {
      //   testCreationTableId,
      //   studentregistrationId,
      // });

      // Step 1: Fetch exam_id using testCreationTableId
      const [testInfoRows] = await connection.query(
        `SELECT
        t.test_creation_table_id,
        t.test_name,
        c.exam_id
      FROM iit_test_creation_table t
      JOIN iit_course_creation_table c ON t.course_creation_id = c.course_creation_id
      WHERE t.test_creation_table_id = ?`,
        [testCreationTableId] // ✅ Removed trailing comma
      );
      // console.log("📄 testInfoRows:", testInfoRows);

      if (!testInfoRows || testInfoRows.length === 0) {
        console.warn("⚠️ Test not found for ID:", testCreationTableId);
        return res
          .status(404)
          .json({ error: "Test not found or invalid test ID" });
      }

      const examId = testInfoRows[0].exam_id;
      // console.log("🎯 examId:", examId);

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
        AND ur.question_status IN (1, 2)`, // ✅ Removed trailing comma
        [testCreationTableId, studentregistrationId]
      );
      // console.log("📦 userResponseRows:", userResponseRows);

      const marks = userResponseRows.map((row) => {
        const userAnswer = (row.user_answer || "").trim().toLowerCase();
        const correctAnswer = (row.answer_text || "").trim().toLowerCase();
        let marksAwarded = 0;
        let status = 0;

     

        if (examId === 1) {
          // JEE Main
          if ([1, 2, 3, 4].includes(row.question_type_id)) {
            // MCQ or MSQ
            if (!userAnswer) {
              marksAwarded = 0;
            } else if (userAnswer === correctAnswer) {
              marksAwarded = parseFloat(row.marks_text) || 4;
              status = 1;
            } else {
              marksAwarded = parseFloat(row.nmarks_text) || -1;
              status = 0;
            }
          } else if ([5, 6].includes(row.question_type_id)) {
            // NVQs
            if (!userAnswer) {
              marksAwarded = 0;
            } else if (userAnswer === correctAnswer) {
              marksAwarded = parseFloat(row.marks_text) || 4;
              status = 1;
            } else {
              marksAwarded = parseFloat(row.nmarks_text) || 0;
              status = 0;
            }
          }
        } else if (examId === 2) {
          // JEE Advanced
          if (row.question_type_id === 1 || row.question_type_id === 2) {
            // MCQ - Single correct
            if (!userAnswer) {
              marksAwarded = 0;
            } else if (userAnswer === correctAnswer) {
              marksAwarded = parseFloat(row.marks_text) || 3;
              status = 1;
            } else {
              marksAwarded = parseFloat(row.nmarks_text) || -1;
            }
          } else if (row.question_type_id === 3 || row.question_type_id === 4) {
            // MSQ - Multiple correct with special marking
            const correctOptions = correctAnswer.split(",").map(opt => opt.trim().toLowerCase());
            const userOptions = userAnswer.split(",").map(opt => opt.trim().toLowerCase());
      
            const correctSelected = userOptions.filter(opt => correctOptions.includes(opt));
            const incorrectSelected = userOptions.filter(opt => !correctOptions.includes(opt));
      
            if (userOptions.length === 0) {
              marksAwarded = 0;
              status = 0;
            } else if (incorrectSelected.length > 0) {
              marksAwarded = parseFloat(row.nmarks_text) || -2;
              status = 0;
            } else {
              const correctCount = correctOptions.length;
              const selectedCount = correctSelected.length;
      
              if (selectedCount === correctCount) {
                marksAwarded = parseFloat(row.marks_text); // full marks
                status = 1;
              } else if (selectedCount === correctCount - 1) {
                marksAwarded = parseFloat(row.marks_text) - 1; // +3 marks
                status = 1;
              } else if (selectedCount === correctCount - 2) {
                marksAwarded = parseFloat(row.marks_text) - 2; // +2 marks
                status = 1;
              } else if (selectedCount === correctCount - 3) {
                marksAwarded = parseFloat(row.marks_text) -3 ; // +1 mark
                status = 1;
              } else {
                marksAwarded = parseFloat(row.nmarks_text) || -2; //-2 marks
                status = 0;
              }
            }
          } else if (row.question_type_id === 5 || row.question_type_id === 6) {
            // NAT - Numeric Answer
            if (!userAnswer) {
              marksAwarded = 0;
            } else if (userAnswer === correctAnswer) {
              marksAwarded = parseFloat(row.marks_text) || 4;
              status = 1;
            } else {
              marksAwarded = parseFloat(row.nmarks_text) ||0;
              status = 0;
            }
          }
        }

        return {
          studentregistrationId: row.student_registration_id,
          testCreationTableId: row.test_creation_table_id,
          subjectId: row.subject_id,
          sectionId: row.section_id,
          question_id: row.question_id,
          marksAwarded,
          status,
        };
      });

      // Step 3: Insert into student_marks table
      const insertQueries = marks.map((mark) => {
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
            mark.status,
          ]
        );
      });

      await Promise.all(insertQueries);
      // console.log("✅ All marks inserted successfully");

      res.json(marks);
    } catch (error) {
      console.error("❌ Error in fetching student marks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      if (connection) connection.release();
    }
  }
);

router.post("/DeleteStudentDataWindowClose/:studentId/:testCreationTableId", async (req, res) => {
  try {
    const { studentId, testCreationTableId } = req.params; // Correcting to extract parameters from req.params

    if (!studentId || !testCreationTableId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const testStatus = await db.query(
      `SELECT test_attempt_status FROM iit_test_status_details WHERE student_registration_id = ? AND test_creation_table_id = ?`,
      [studentId, testCreationTableId]
    );

    // console.log("Test Status:", testStatus);

    if (!testStatus || testStatus.length === 0) {
      // console.log("No test record found, skipping deletion.");
      return res.status(404).json({ message: "No test record found." });
    }

    // Flatten the testStatus array and check if any status is 'completed'
    const isCompleted = testStatus.flat().some(status => status.testAttemptStatus && status.testAttemptStatus.toLowerCase() === "completed");

    if (isCompleted) {
      // console.log("Test was completed. Data not deleted.");
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

    // console.log(`Test data deleted for student ${studentId} (Test ID: ${testCreationTableId})`);
    return res.status(200).json({ message: "Test data deleted successfully." });

  } catch (error) {
    console.error("Error deleting user data:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
