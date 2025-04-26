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
    ROUND((sm.total_marks / itct.total_marks) * 100, 2) AS percentage,  -- Percentage calculation
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
    COUNT(DISTINCT tsd.student_registration_id) AS total_participants,
    SUM(CASE 
            WHEN sm.student_marks > 0 THEN 1
            ELSE 0
        END) AS correct_answers,
    SUM(CASE 
            WHEN sm.student_marks = 0 THEN 1
            ELSE 0
        END) AS incorrect_answers,
    SUM(CASE 
            WHEN sm.student_marks IS NULL THEN 1
            ELSE 0
        END) AS unattempted_answers
FROM
    iit_test_status_details tsd
CROSS JOIN
    iit_questions q
LEFT JOIN
    iit_student_marks sm 
        ON sm.student_registration_id = tsd.student_registration_id
        AND sm.question_id = q.question_id
        AND sm.test_creation_table_id = tsd.test_creation_table_id
WHERE
    tsd.test_creation_table_id = ?
GROUP BY
    q.question_id
ORDER BY
    q.question_id;

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
  
  router.get('/participations/:testid', async (req, res) => {
    const testCreationTableId = req.params.testid;  
  
    const query = `
     SELECT 
    sm.student_registration_id,
    sm.test_creation_table_id,
    COUNT(sm.question_id) AS total_attempts,
    SUM(sm.student_marks) AS total_marks_obtained,
    tct.total_marks AS max_marks,
    ROUND((SUM(sm.student_marks) / tct.total_marks) * 100, 2) AS percentage,
  
    ses.time_spent AS time_spent_hhmmss
FROM 
    iit_student_marks sm
JOIN 
    iit_test_creation_table tct 
    ON sm.test_creation_table_id = tct.test_creation_table_id
JOIN 
    iit_test_status_details tst 
    ON sm.test_creation_table_id = tst.test_creation_table_id
    AND sm.student_registration_id = tst.student_registration_id
JOIN 
    iit_student_exam_summary ses
    ON sm.test_creation_table_id = ses.test_creation_table_id
    AND sm.student_registration_id = ses.student_registration_id
WHERE 
    sm.test_creation_table_id = 15  -- Replace with specific test_creation_table_id
GROUP BY 
    sm.student_registration_id, sm.test_creation_table_id, tst.student_test_start_date_time, tst.student_test_end_date_time, ses.time_spent, tct.total_marks;
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
        COUNT(DISTINCT im.question_id) AS total_questions_attempted,  -- Total questions attempted (distinct question_id)
        SUM(CASE WHEN im.student_marks > 0 THEN 1 ELSE 0 END) AS correct_answers, 
        SUM(CASE WHEN im.student_marks = 0 THEN 1 ELSE 0 END) AS incorrect_answers, 
        SUM(im.student_marks) AS total_marks,  -- Total marks obtained by the student in the subject
        im.test_creation_table_id  -- Include test_creation_table_id in the result set to filter for the specific test
    FROM
        iit_student_marks im
    INNER JOIN iit_student_registration sr ON im.student_registration_id = sr.student_registration_id
    INNER JOIN iit_subjects s ON im.subject_id = s.subject_id  -- Linking subject_id from student_marks to subjects table
    WHERE
        im.status = 'completed'  -- Only consider completed tests
        AND im.test_creation_table_id = 15  -- Filter by the specific test ID
    GROUP BY
        im.student_registration_id, sr.candidate_name, s.subject_name, im.test_creation_table_id
)
SELECT
    student_registration_id,
    candidate_name,
    subject_name,
    total_questions_attempted,  -- Total number of questions attempted
    correct_answers,  -- Total number of correct answers
    incorrect_answers,  -- Total number of incorrect answers
    total_marks,  -- Total marks the student obtained in the subject
    ROUND((total_marks / (SELECT total_marks FROM iit_test_creation_table WHERE test_creation_table_id = swr.test_creation_table_id LIMIT 1)) * 100, 2) AS percentage  -- Percentage based on total marks of the test
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
