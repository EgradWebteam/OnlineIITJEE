const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
console.log("hi")
router.get('/OrvlTopicForCourse/:student_registration_id/:course_creation_id', async (req, res) => {
  const { student_registration_id, course_creation_id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT
        cct.course_creation_id,
        cct.course_name,
        otc.orvl_topic_name,
        otc.orvl_topic_id,
        e.exam_id,
        e.exam_name,
        p.portal_id,
        sbc.student_registration_id,
        s.subject_id,
        s.subject_name
      FROM
        iit_course_creation_table AS cct
      LEFT JOIN iit_exams AS e ON e.exam_id = cct.exam_id
      LEFT JOIN iit_portal AS p ON p.portal_id = cct.portal_id
      LEFT JOIN iit_student_buy_courses AS sbc ON sbc.course_creation_id = cct.course_creation_id
      LEFT JOIN iit_course_subjects cs ON cct.course_creation_id = cs.course_creation_id
      LEFT JOIN iit_subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN iit_orvl_topic_creation AS otc ON otc.subject_id = s.subject_id AND otc.exam_id = cct.exam_id
      LEFT JOIN iit_orvl_lecture_names AS orvl ON otc.orvl_topic_id = orvl.orvl_topic_id
      WHERE 
        sbc.student_registration_id = ?
        AND sbc.payment_status = 1
        AND sbc.course_creation_id = ?
        AND cct.portal_id = 3
      ORDER BY s.subject_id`,
      [student_registration_id, course_creation_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    // Prepare nested response
    const result = {
      course_creation_id: rows[0].course_creation_id,
      course_name: rows[0].course_name,
      exam_id: rows[0].exam_id,
      exam_name: rows[0].exam_name,
      portal_id: rows[0].portal_id,
      student_registration_id: rows[0].student_registration_id,
      subjects: []
    };

    const subjectMap = {};

    rows.forEach(row => {
      if (!subjectMap[row.subject_id]) {
        subjectMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          topics: []
        };
        result.subjects.push(subjectMap[row.subject_id]);
      }

      const topicExists = subjectMap[row.subject_id].topics.some(
        topic => topic.orvl_topic_id === row.orvl_topic_id
      );

      if (row.orvl_topic_id && row.orvl_topic_name && !topicExists) {
        subjectMap[row.subject_id].topics.push({
          orvl_topic_id: row.orvl_topic_id,
          orvl_topic_name: row.orvl_topic_name
        });
      }
    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching ORVL topic data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});



      
module.exports = router;
