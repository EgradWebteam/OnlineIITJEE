const express = require("express");
const router = express.Router();
const db = require("../config/database.js");


router.get('/FetchResultTestdata/:studentId', async (req, res) => {
    const { studentId } = req.params;
  
    const query = `
      SELECT 
      tc.test_creation_table_id,
          cc.exam_id, 
          e.exam_name,
          tc.test_name,
          tsd.test_attempt_status
      FROM 
          iit_db.iit_test_status_details tsd
      JOIN 
          iit_db.iit_test_creation_table tc 
          ON tsd.test_creation_table_id = tc.test_creation_table_id
      JOIN 
          iit_db.iit_course_creation_table cc 
          ON tc.course_creation_id = cc.course_creation_id
      JOIN 
          iit_db.iit_exams e 
          ON cc.exam_id = e.exam_id
      WHERE 
          tsd.student_registration_id = ?;
    `;
  
    try {
      const [rows] = await db.query(query, [studentId]);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching test status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });



  module.exports = router;