const express = require("express");
const router = express.Router();
const db = require("../config/database.js");


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
        SELECT iits.subject_name
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
      sections,
    } = req.body;
  
    // Example SQL query to insert into the test table
    const query = `
    INSERT INTO iit_test_creation_table 
  (test_name, 
   course_creation_id, 
   course_type_of_test_id, 
   instruction_id, 
   test_start_date, 
   test_end_date, 
   test_start_time, 
   test_end_time, 
   duration, 
   total_questions, 
   total_marks, 
   status, 
   options_pattern_id)
VALUES 
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?);

    `;
  
    try {
      const result = await db.query(query, [
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
  "active",  // Set the status to 'active' by default
  selectedOptionPattern
      ]);
  
      const testId = result.test_creation_table_id; // Assuming the inserted test gets a unique test ID
  
      // Insert sections if there are any
      if (sections.length > 0) {
        const sectionQuery = `
          INSERT INTO iit_sections (test_creation_table_id, section_name, no_of_questions, subject_id)
          VALUES (?, ?, ?, ?)
        `;
  
        for (const section of sections) {
          await db.query(sectionQuery, [
            testId,
            section.sectionName,
            section.numberOfQuestions,
            section.dropdownValue,
          ]);
        }
      }
  
      // Return success response
      res.status(201).json({ message: "Test created successfully!" });
    } catch (error) {
      console.error("Error inserting test data:", error);
      res.status(500).json({ message: "There was an error creating the test." });
    }
  });
  

  module.exports = router;