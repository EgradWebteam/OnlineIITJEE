const express = require("express");
const router = express.Router();
const db = require("../config/database.js");

router.put("/updateResumeTest/:studentId/:testCreationTableId", async (req, res) => {
    const { studentId, testCreationTableId } = req.params;
    const { timeleft } = req.body;
  
    let connection;
    try {
      connection = await db.getConnection();
  
      // Build base query and params
      let query = `
        UPDATE iit_test_status_details 
        SET test_attempt_status = ?, test_connection_status = ?, version = IFNULL(version, 0) + 1`;
      const params = ["resumed", "disconnected"];
  
      // Conditionally add time_left if valid
      if (timeleft !== null && timeleft !== undefined && timeleft !== "") {
        query += `, time_left = ?`;
        params.push(timeleft);
      }
  
      // Add WHERE clause
      query += `
        WHERE student_registration_id = ? 
          AND test_creation_table_id = ? 
          AND test_attempt_status != 'completed'`;
      params.push(studentId, testCreationTableId);
  
      const [result] = await connection.query(query, params);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No record found to update or test already completed" });
      }
  
      res.status(200).json({ message: "Resume test updated successfully" });
    } catch (error) {
      console.error("Error updating resume test:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

router.post("/updateResumeTestBeacon", async (req, res) => {
  // Extract the data sent via sendBeacon
  const { studentId, testCreationTableId, timeleft } = req.body;
 
  let connection;
  try {
    connection = await db.getConnection();
 
    // Build base query and params
    let query = `
      UPDATE iit_test_status_details 
      SET test_attempt_status = ?, test_connection_status = ?, version = IFNULL(version, 0) + 1`;
    const params = ["resumed", "disconnected"];
 
    // Conditionally add time_left if valid
    if (timeleft !== null && timeleft !== undefined && timeleft !== "") {
      query += `, time_left = ?`;
      params.push(timeleft);
    }
 
    // Add WHERE clause
    query += `
      WHERE student_registration_id = ? 
        AND test_creation_table_id = ? 
        AND test_attempt_status != 'completed'`;
    params.push(studentId, testCreationTableId);
 
    const [result] = await connection.query(query, params);
 
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update or test already completed" });
    }
 
    res.status(200).json({ message: "Resume test updated successfully" });
  } catch (error) {
    console.error("Error updating resume test:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});
    
    function formatUserResponses(rows) {
        return rows.reduce((acc, { subject_id, section_id, question_id, user_answer, question_status,question_type_id,option_id  }) => {
            acc[subject_id] = acc[subject_id] || { subject_id, sections: {} };
            acc[subject_id].sections[section_id] = acc[subject_id].sections[section_id] || { section_id, questions: [] };
            acc[subject_id].sections[section_id].questions.push({ question_id, user_answer, question_status,question_type_id,option_id });
            return acc;
        }, {});
    }
    
    router.get("/getResumedUserresponses/:studentId/:testCreationTableId", async (req, res) => {
        const { studentId, testCreationTableId } = req.params;
        let connection;
        try {
            connection = await db.getConnection();
            const [rows] = await connection.query(
                `SELECT 
    iur.subject_id,
    iur.section_id,
    iur.question_id,
    iur.user_answer,
    iur.option_id,
    iur.question_type_id,
    tsd.time_left,
    iur.question_status 
FROM 
    iit_user_responses iur
LEFT JOIN 
    iit_test_status_details tsd 
    ON tsd.student_registration_id = iur.student_registration_id
    AND tsd.test_creation_table_id = iur.test_creation_table_id
WHERE 
    iur.student_registration_id = ?
    AND iur.test_creation_table_id = ?
    AND tsd.version > 0;

 `,
                [studentId, testCreationTableId]
            );
    
            if (rows.length === 0) {
                return res.status(404).json({ message: "No record found" });
            }
    
            const subjects = formatUserResponses(rows);
            res.status(200).json({time_left:rows[0].time_left, subjects: Object.values(subjects).map(subject => ({
                subject_id: subject.subject_id,
                sections: Object.values(subject.sections)
            })) });
    
        } catch (error) {
            console.error("Error fetching resumed user responses:", error);
            res.status(500).json({ message: "Internal server error" });
        } finally {
            if (connection) connection.release();
        }
    });
    

module.exports = router;