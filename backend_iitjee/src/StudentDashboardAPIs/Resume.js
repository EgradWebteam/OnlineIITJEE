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
module.exports = router;