const express = require("express");
const router = express.Router();
const db = require("../config/database.js"); 
const cors = require("cors");

router.use(cors());
router.use(express.json());

router.get('/score-overview/:testid', async (req, res) => {
    const testCreationTableId = req.params.testid;  
    const query = `
WITH StudentMarks AS (
    SELECT
        sm.student_registration_id,
        sm.test_creation_table_id,
        SUM(sm.student_marks) AS total_marks
    FROM
        iit_student_marks sm
    WHERE
        sm.test_creation_table_id = ?
    GROUP BY
        sm.student_registration_id, sm.test_creation_table_id
)
SELECT
    sm.student_registration_id,
    sr.candidate_name,  -- Student name
    cct.course_name,  -- Course name from the iit_course_creation_table
    itct.test_creation_table_id,
    itct.test_name,
    itct.course_creation_id,  -- Course creation ID
    itct.course_type_of_test_id,  -- Type of test
    itct.test_start_date,
    itct.test_end_date,
    itct.test_start_time,
    itct.test_end_time,
itct.total_marks AS testtotalmarks,
    itct.total_questions,
    itct.total_marks,
    sm.total_marks,
    -- Calculate percentage for the student
    ROUND((sm.total_marks / itct.total_marks) * 100, 2) AS percentage, 
    CASE
        WHEN sm.total_marks = (SELECT MAX(total_marks) FROM StudentMarks) THEN 'Topper'
        ELSE 'Other'
    END AS student_status
FROM
    StudentMarks sm
JOIN
    iit_test_creation_table itct ON sm.test_creation_table_id = itct.test_creation_table_id
JOIN
    iit_student_registration sr ON sm.student_registration_id = sr.student_registration_id
JOIN
    iit_course_creation_table cct ON itct.course_creation_id = cct.course_creation_id  -- Join to get course name from course_creation_id
ORDER BY
    sm.total_marks DESC;

    `;
  
    try {

        const [results, fields] = await db.query(query, [testCreationTableId]);
  

      res.status(200).json(results);
    } catch (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Error fetching score overview' });
    }
  });
router.get('/questionwise/:testid', async (req, res) => {
  const testCreationTableId = req.params.testid;
  const query = `
  SELECT
    q.question_id,
    
    COUNT(DISTINCT sm.student_registration_id) AS total_participants_attempted,
    
    SUM(CASE WHEN sm.student_marks > 0 THEN 1 ELSE 0 END) AS correct_attempts,
    
    SUM(CASE WHEN sm.student_marks = 0 THEN 1 ELSE 0 END) AS incorrect_attempts,
    
   
    SUM(CASE WHEN sm.student_marks IS NULL THEN 1 ELSE 0 END) AS unattempted_answers

FROM
    iit_questions q
LEFT JOIN 
    iit_student_marks sm 
    ON sm.question_id = q.question_id
    AND sm.test_creation_table_id = q.test_creation_table_id
WHERE
    q.test_creation_table_id = ?
GROUP BY
    q.question_id
ORDER BY
    q.question_id;

  `;

  try {
    const [results, fields] = await db.query(query, [testCreationTableId]);

  
    res.status(200).json(results);
  } catch (err) {
    console.error('Database query failed:', err);
    return res.status(500).json({ error: 'Error fetching questionwise results' });
  }
});

  
  router.get('/participations/:testid', async (req, res) => {
    const testCreationTableId = req.params.testid;  
  
    const query = `
  SELECT 
    sm.student_registration_id,
    sr.candidate_name,
    COUNT(sm.question_id) AS total_attempts,
    SUM(sm.student_marks) AS total_marks_obtained,
    tct.total_marks AS max_marks,
    ROUND((SUM(sm.student_marks) / tct.total_marks) * 100, 2) AS percentage,
    ses.time_spent AS time_spent_hhmmss
FROM 
    iit_student_marks sm
JOIN 
    iit_student_registration sr 
    ON sm.student_registration_id = sr.student_registration_id
JOIN 
    iit_test_creation_table tct 
    ON sm.test_creation_table_id = tct.test_creation_table_id
JOIN 
    iit_student_exam_summary ses
    ON sm.student_registration_id = ses.student_registration_id 
    AND sm.test_creation_table_id = ses.test_creation_table_id
WHERE 
    sm.test_creation_table_id = ?
GROUP BY 
    sm.student_registration_id, sr.candidate_name, tct.total_marks, ses.time_spent
ORDER BY 
    sr.candidate_name;


    `;
    
    try {
      // Execute the query with the testCreationTableId
      const [results, fields] = await db.query(query, [testCreationTableId]);
  
      // Send the results as a response
      res.status(200).json(results);
    } catch (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Error fetching questionwise results' });
    }
  });
  router.get('/subjectwise/:testid', async (req, res) => {
    const testCreationTableId = req.params.testid;  
  
    const query = `
  WITH SubjectWiseResults AS (
    SELECT
        im.student_registration_id,
        sr.candidate_name,
        s.subject_name,
        COUNT(DISTINCT im.question_id) AS total_questions_attempted,
        SUM(CASE WHEN im.student_marks > 0 THEN 1 ELSE 0 END) AS correct_answers,
        SUM(CASE WHEN im.student_marks = 0 THEN 1 ELSE 0 END) AS incorrect_answers,
        SUM(im.student_marks) AS total_marks,
        im.test_creation_table_id
    FROM
        iit_student_marks im
    INNER JOIN iit_student_registration sr ON im.student_registration_id = sr.student_registration_id
    INNER JOIN iit_subjects s ON im.subject_id = s.subject_id
    WHERE
        im.status = 'completed'
        AND im.test_creation_table_id = ? 
    GROUP BY
        im.student_registration_id, sr.candidate_name, s.subject_name, im.test_creation_table_id
)
SELECT
    student_registration_id,
    candidate_name,
    subject_name,
    total_questions_attempted,
    correct_answers,
    incorrect_answers,
    total_marks,
    ROUND(
        (total_marks / (
            SELECT total_marks
            FROM iit_test_creation_table
            WHERE test_creation_table_id = swr.test_creation_table_id
            LIMIT 1
        )) * 100, 
        2
    ) AS percentage
FROM
    SubjectWiseResults swr
ORDER BY
    candidate_name, subject_name;

    `;
    
    try {
      // Execute the query with the testCreationTableId
      const [results, fields] = await db.query(query, [testCreationTableId]);
  
      // Send the results as a response
      res.status(200).json(results);
    } catch (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Error fetching questionwise results' });
    }
  });
module.exports = router;
