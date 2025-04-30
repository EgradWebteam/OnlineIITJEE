const express = require("express");
const router = express.Router();
const db = require("../config/database.js");

router.put("/updateResumeTest/:studentId/:testCreationTableId", async (req, res) => {
    const { studentId, testCreationTableId } = req.params;
  
  
    let  connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
        `UPDATE iit_test_status_details 
             SET test_attempt_status = ?,test_connection_status=?, version =IFNULL(version, 0) + 1 
             WHERE student_registration_id = ? AND test_creation_table_id = ?`,
        ["resumed","disconnected", studentId, testCreationTableId]
        );
    
        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "No record found to update" });
        }
    
        res.status(200).json({ message: "Resume test updated successfully" });
    } catch (error) {
        console.error("Error updating resume test:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    finally {
        if (connection) connection.release();
    }})  
    
    function formatUserResponses(rows) {
        return rows.reduce((acc, { subject_id, section_id, question_id, user_answer, question_status }) => {
            acc[subject_id] = acc[subject_id] || { subject_id, sections: {} };
            acc[subject_id].sections[section_id] = acc[subject_id].sections[section_id] || { section_id, questions: [] };
            acc[subject_id].sections[section_id].questions.push({ question_id, user_answer, question_status });
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
    iur.question_status 
FROM 
    iit_user_responses iur
WHERE 
    iur.student_registration_id = ?
    AND iur.test_creation_table_id = ?
 `,
                [studentId, testCreationTableId]
            );
    
            if (rows.length === 0) {
                return res.status(404).json({ message: "No record found" });
            }
    
            const subjects = formatUserResponses(rows);
            res.status(200).json({ subjects: Object.values(subjects).map(subject => ({
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