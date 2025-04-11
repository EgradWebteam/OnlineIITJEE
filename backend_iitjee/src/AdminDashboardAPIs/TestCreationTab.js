const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const cors = require('cors');
router.use(cors());



router.get('/TestCreationFormData', async (req, res) => {
    try {
      const [courses] = await db.query('SELECT course_creation_id, course_name FROM iit_course_creation_table');
      const [testTypes] = await db.query('SELECT type_of_test_id, type_of_test_name FROM iit_type_of_test');
      const [instructions] = await db.query('SELECT instruction_id, instruction_heading FROM iit_instructions');
      const [optionPatterns] = await db.query('SELECT options_pattern_id, options_pattern_name FROM iit_options_pattern');
  
      res.json({
        courses,
        testTypes,
        instructions,
        optionPatterns
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // API route to get subject names by course_creation_id

  router.get("/CourseSubjects/:course_creation_id", async (req, res) => {
    const { course_creation_id } = req.params;
    console.log("Course Creation ID:", course_creation_id); // Log course_creation_id
    
    try {
      const [subjects] = await db.query(
        `
        SELECT iits.subject_name,iits.subject_id
        FROM iit_subjects iits
        JOIN iit_course_subjects iitcs
          ON iits.subject_id = iitcs.subject_id
        WHERE iitcs.course_creation_id = ?
        `,
        [course_creation_id]
      );
      
      console.log("Subjects:", subjects); // Log the result
      
      if (subjects.length === 0) {
        return res.status(404).json({ message: "No subjects found for this course" });
      }
  
      res.json({ subjects });
    } catch (err) {
      console.error("Error fetching subjects:", err);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });
  

  router.post("/CreateTest", async (req, res) => {
    const {
      testName,
      selectedCourse,
      selectedTypeOfTest,
      selectedInstruction,
      startDate,
      endDate,
      startTime,
      endTime,
      selectedOptionPattern,
      duration,
      totalQuestions,
      totalMarks,
      sections, // Expecting sections to be an array of { sectionName, noOfQuestions, subjectId }
    } = req.body;
  
    const insertTestQuery = `
      INSERT INTO iit_test_creation_table 
        (test_name, course_creation_id, course_type_of_test_id, instruction_id, 
        test_start_date, test_end_date, test_start_time, test_end_time, 
        duration, total_questions, total_marks, status, options_pattern_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    const insertSectionQuery = `
      INSERT INTO iit_sections 
        (test_creation_table_id, section_name, no_of_questions, subject_id) 
      VALUES (?, ?, ?, ?);
    `;
  
    try {
      // Insert the test and get the inserted ID
      const [testResult] = await db.query(insertTestQuery, [
        testName,
        selectedCourse,
        selectedTypeOfTest,
        selectedInstruction,
        startDate,
        endDate,
        startTime,
        endTime,
        duration,
        totalQuestions,
        totalMarks,
        "active",
        selectedOptionPattern
      ]);
  
      const testCreationTableId = testResult.insertId;
  console.log("sections",sections)
      // Insert each section with the retrieved test ID
      for (const section of sections) {
        const { sectionName, numOfQuestions, subjectId } = section;
  
        await db.query(insertSectionQuery, [
          testCreationTableId,
          sectionName,
          numOfQuestions,
          subjectId
        ]);
      }

      res.status(201).json({ message: "Test and sections created successfully!" });
    } catch (error) {
      console.error("Error creating test and sections:", error);
      res.status(500).json({ message: "There was an error creating the test and sections." });
    }
  });
  

  router.get('/FetchTestDataFortable', async (req, res) => {
    const sql = `
        SELECT 
            tct.test_creation_table_id,
            tct.test_name,
            cct.course_name,
            tct.test_start_date,
            tct.test_end_date,
            tct.test_start_time,
            tct.test_end_time,
            tct.total_questions AS number_of_questions,
            COUNT(q.question_id) AS uploaded_questions,
            tct.status AS test_activation
        FROM iit_test_creation_table tct
        JOIN iit_course_creation_table cct ON tct.course_creation_id = cct.course_creation_id
        LEFT JOIN iit_questions q ON tct.test_creation_table_id = q.test_creation_table_id
        GROUP BY 
            tct.test_creation_table_id, 
            tct.test_name, 
            cct.course_name, 
            tct.test_start_date, 
            tct.test_end_date, 
            tct.test_start_time, 
            tct.test_end_time, 
            tct.total_questions, 
            tct.status;
    `;

    try {
        const [rows] = await db.query(sql);  // db is a promise-based pool
        res.json(rows);
    } catch (err) {
        console.error('Error fetching test details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  

  module.exports = router;