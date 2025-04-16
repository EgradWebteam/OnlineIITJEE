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
  

  module.exports = router;