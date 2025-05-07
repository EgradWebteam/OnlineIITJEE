const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const cors = require("cors");
router.use(cors());

router.get("/TestCreationFormData", async (req, res) => {
  try {
    const [courses] = await db.query(
      "SELECT course_creation_id, course_name FROM iit_course_creation_table"
    );
    const [testTypes] = await db.query(
      "SELECT type_of_test_id, type_of_test_name FROM iit_type_of_test"
    );
    const [instructions] = await db.query(
      "SELECT instruction_id, instruction_heading FROM iit_instructions"
    );
    const [optionPatterns] = await db.query(
      "SELECT options_pattern_id, options_pattern_name FROM iit_options_pattern"
    );

    res.json({
      courses,
      testTypes,
      instructions,
      optionPatterns,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API route to get subject names by course_creation_id

router.get("/CourseSubjects/:course_creation_id", async (req, res) => {
  const { course_creation_id } = req.params;
  // console.log("Course Creation ID:", course_creation_id); // Log course_creation_id

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

    // console.log("Subjects:", subjects); // Log the result

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this course" });
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
      "inactive",
      selectedOptionPattern,
    ]);

    const testCreationTableId = testResult.insertId;
    // console.log("sections", sections);
    // Insert each section with the retrieved test ID
    for (const section of sections) {
      const { sectionName, numOfQuestions, subjectId } = section;

      await db.query(insertSectionQuery, [
        testCreationTableId,
        sectionName,
        numOfQuestions,
        subjectId,
      ]);
    }

    res
      .status(201)
      .json({ message: "Test and sections created successfully!" });
  } catch (error) {
    console.error("Error creating test and sections:", error);
    res
      .status(500)
      .json({ message: "There was an error creating the test and sections." });
  }
});
router.put("/UpdateTest/:testId", async (req, res) => {
  const { testId } = req.params;
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
    sections, // Array of { sectionName, numOfQuestions, subjectId }
  } = req.body;

  const updateTestQuery = `
      UPDATE iit_test_creation_table 
      SET 
        test_name = ?, 
        course_creation_id = ?, 
        course_type_of_test_id = ?, 
        instruction_id = ?, 
        test_start_date = ?, 
        test_end_date = ?, 
        test_start_time = ?, 
        test_end_time = ?, 
        duration = ?, 
        total_questions = ?, 
        total_marks = ?, 
        options_pattern_id = ?
      WHERE test_creation_table_id = ?;
    `;

  const deleteOldSectionsQuery = `
      DELETE FROM iit_sections WHERE test_creation_table_id = ?;
    `;

  const insertSectionQuery = `
      INSERT INTO iit_sections 
        (test_creation_table_id, section_name, no_of_questions, subject_id) 
      VALUES (?, ?, ?, ?);
    `;

  try {
    // Update test main info
    await db.query(updateTestQuery, [
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
      selectedOptionPattern,
      testId,
    ]);

    // Delete old sections
    await db.query(deleteOldSectionsQuery, [testId]);

    // Insert new sections if any
    if (Array.isArray(sections) && sections.length > 0) {
      for (const section of sections) {
        const { sectionName, numOfQuestions, subjectId } = section;
        await db.query(insertSectionQuery, [
          testId,
          sectionName,
          numOfQuestions,
          subjectId,
        ]);
      }
    }

    res
      .status(200)
      .json({ message: "Test and sections updated successfully." });
  } catch (error) {
    console.error("Error updating test and sections:", error);
    res.status(500).json({ message: "Failed to update test and sections." });
  }
});
router.delete("/DeleteTest/:testId", async (req, res) => {
  const { testId } = req.params;

  const deleteSectionsQuery = `
      DELETE FROM iit_sections 
      WHERE test_creation_table_id = ?;
    `;

  const deleteTestQuery = `
      DELETE FROM iit_test_creation_table 
      WHERE test_creation_table_id = ?;
    `;

  try {
    // First delete associated sections
    await db.query(deleteSectionsQuery, [testId]);

    // Then delete the test itself
    const [result] = await db.query(deleteTestQuery, [testId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Test not found." });
    }

    res.status(200).json({ message: "Test deleted successfully." });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ message: "Failed to delete the test." });
  }
});
router.post("/toggleTestStatus", async (req, res) => {
  const { testCreationTableId, newStatus } = req.body;

  try {
    await db.query(
      "UPDATE iit_test_creation_table SET status = ? WHERE test_creation_table_id = ?",
      [newStatus, testCreationTableId]
    );

    res.status(200).json({ message: `Test status updated to ${newStatus}` });
  } catch (error) {
    console.error("Error updating test status:", error);
    res.status(500).json({ message: "Failed to update test status" });
  }
});
router.get("/FetchTestDataFortable", async (req, res) => {
  try {
    const [tests] = await db.query(`
      SELECT 
        tct.test_creation_table_id,
        tct.test_name,
        cct.course_name,
        cct.course_creation_id,
        tct.test_start_date,
        tct.test_end_date,
        tct.test_start_time,
        tct.test_end_time,
        tct.total_questions AS number_of_questions,
        COUNT(DISTINCT q.question_id) AS uploaded_questions,
        tct.status AS test_activation,
        tct.total_marks,
        tct.duration,
        tt.type_of_test_id,
        tt.type_of_test_name,
        op.options_pattern_id,
        op.options_pattern_name,
        i.instruction_id,
        i.exam_id,
        i.instruction_heading,
        i.document_name,
        i.instruction_img
      FROM iit_test_creation_table tct
      LEFT JOIN iit_course_creation_table cct ON tct.course_creation_id = cct.course_creation_id
      LEFT JOIN iit_questions q ON tct.test_creation_table_id = q.test_creation_table_id
      LEFT JOIN iit_type_of_test tt ON tt.type_of_test_id = tct.course_type_of_test_id
      LEFT JOIN iit_options_pattern op ON tct.options_pattern_id = op.options_pattern_id
      LEFT JOIN iit_instructions i ON tct.instruction_id = i.instruction_id
      GROUP BY 
        tct.test_creation_table_id, cct.course_name, cct.course_creation_id, tt.type_of_test_id,
        tt.type_of_test_name, op.options_pattern_id, op.options_pattern_name,
        i.instruction_id, i.exam_id, i.instruction_heading, i.document_name, i.instruction_img
    `);

    const [sections] = await db.query(`
      SELECT 
        section_id,
        test_creation_table_id,
        section_name,
        no_of_questions,
        subject_id
      FROM iit_sections
    `);

    const testDataWithSections = tests.map(test => ({
      ...test,
      sections: sections 
    }));

    res.json(testDataWithSections);
  } catch (err) {
    console.error("Error fetching test data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_UPLOADS;
const containerName = process.env.AZURE_CONTAINER_NAME;
const testDocumentFolderName = process.env.AZURE_DOCUMENT_FOLDER;
const BackendBASE_URL = process.env.BASE_URL;
// Helper to get image URL

const getImageUrl = (documentName, folder, fileName) => {
  if (!fileName || !documentName) return null;
  return `${BackendBASE_URL}/DocumentUpload/QOSImages/${documentName}/${folder}/${fileName}`;
};

// ✅ Route to serve the actual course card image securely (proxy)
router.get("/QOSImages/:documentName/:folder/:fileName", async (req, res) => {
  const { documentName, folder, fileName } = req.params;

  if (!fileName) return res.status(400).send("File name is required");

  const imageUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${testDocumentFolderName}/${documentName}/${folder}/${fileName}?${sasToken}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res
        .status(response.status)
        .send("Failed to fetch image from Azure");
    }

    res.setHeader("Content-Type", response.headers.get("Content-Type"));
    response.body.pipe(res); // Stream the image directly
  } catch (error) {
    console.error("Error fetching image from Azure Blob:", error);
    res.status(500).send("Error fetching image");
  }
});

// Transform SQL flat rows into structured question paper format
const transformTestData = (rows) => {
  if (!rows || rows.length === 0) return {};

  const result = {
    TestName: rows[0].TestName,
    examId: rows[0].examId,
    courseTypeOfTestId: rows[0].courseTypeOfTestId,
    TestDuration: rows[0].TestDuration,
    opt_pattern_id: rows[0].opt_pattern_id,
    subjects: [],
  };

  const subjectMap = {};

  for (const row of rows) {
    // if (!row.subjectId || !row.section_id || !row.question_id) continue;
    if (!row.subjectId || !row.question_id) continue;
    // Subjects
    if (!subjectMap[row.subjectId]) {
      subjectMap[row.subjectId] = {
        subjectId: row.subjectId,
        SubjectName: row.SubjectName,
        sections: [],
      };
      result.subjects.push(subjectMap[row.subjectId]);
    }

    const currentSubject = subjectMap[row.subjectId];

    // Sections
    let section = currentSubject.sections.find(
      (sec) => sec.sectionId === row.section_id
    );

    if (!section) {
      section = {
        sectionId: row.section_id,
        SectionName: row.SectionName,
        questions: [],
      };
      currentSubject.sections.push(section);
    }

    // Questions
    let question = section.questions.find(
      (q) => q.question_id === row.question_id
    );

    if (!question) {
      question = {
        question_id: row.question_id,
        questionImgName: getImageUrl(
          row.document_name,
          "questions",
          row.questionImgName
        ),
        document_name: row.document_name,
        options: [],
        answer: row.answer,
        marks_text: row.marks_text,
        nmarks_text: row.nmarks_text,
        questionType: {
          quesionTypeId: row.questionTypeId,
          qtype_text: row.qtype_text,
          typeofQuestion: row.qtype_text,
        },
        solution: {
          solution_id: row.solution_id,
          solutionImgName: getImageUrl(
            row.document_name,
            "solution",
            row.solution_img_name
          ),
          video_solution_link: row.video_solution_link,
        },
      };
      section.questions.push(question);
    }

    // Options
    if (
      row.option_id &&
      !question.options.some((opt) => opt.option_id === row.option_id)
    ) {
      question.options.push({
        option_id: row.option_id,
        option_index: row.option_index,
        optionImgName: getImageUrl(
          row.document_name,
          "options",
          row.option_img_name
        ),
      });
    }
  }

  return result;
};

// Route to get question paper
router.get("/ViewTestPaper/:test_creation_table_id", async (req, res) => {
  try {
    const { test_creation_table_id } = req.params;

    const [rows] = await db.query(
      `
    SELECT 
    t.test_name AS TestName,
    t.test_creation_table_id AS examId,
    t.course_type_of_test_id AS courseTypeOfTestId,
    t.duration AS TestDuration,
    t.options_pattern_id AS opt_pattern_id,
    s.subject_id AS subjectId,
    s.subject_name AS SubjectName,
    sec.section_id,
    sec.section_name AS SectionName,
    q.question_id,
    q.question_img_name AS questionImgName,
    d.document_name,
    o.option_id,
    o.option_index,
    o.option_img_name,
    q.answer_text AS answer,
    q.marks_text,
    q.nmarks_text,
    q.question_type_id AS questionTypeId,
    q.qtype_text,
    sol.solution_id,
    sol.solution_img_name,
    sol.video_solution_link
FROM iit_questions q
INNER JOIN iit_ots_document d ON q.document_Id = d.document_Id
INNER JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
INNER JOIN iit_subjects s ON d.subject_id = s.subject_id
LEFT JOIN iit_sections sec ON d.section_id = sec.section_id 
LEFT JOIN iit_options o ON q.question_id = o.question_id
LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id 
WHERE d.test_creation_table_id = ?
ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index;

      `,
      [test_creation_table_id]
    );

    const structured = transformTestData(rows);
    res.json(structured);
  } catch (error) {
    console.error("Error fetching question paper:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/getNotAssignedCourses/:testCreationTableId", async (req, res) => {
  const { testCreationTableId } = req.params;

  try {
    // ✅ Assigned Courses (from course_reference table)
    const sqlAssigned = `
        SELECT 
        crt.referenceId,
        crt.course_creation_id,
        crt.test_creation_table_id,
        crt.testName,
        cct.course_name
      FROM iit_course_reference_for_test crt
      INNER JOIN iit_course_creation_table cct
        ON cct.course_creation_id = crt.course_creation_id
      WHERE crt.test_creation_table_id = ?;
      
    `;
    const [rowsAssigned] = await db.query(sqlAssigned, [testCreationTableId]);

    // ✅ Not Assigned Courses
    const sqlNotAssigned = `
      SELECT 
        cct.course_creation_id, cct.course_name, cct.course_year, cct.exam_id,
        cct.course_start_date, cct.course_end_date, cct.cost, cct.discount,
        cct.total_price, cct.portal_id, cct.active_course, cct.card_image
      FROM iit_course_creation_table cct
      WHERE cct.course_creation_id NOT IN (
        SELECT course_creation_id
        FROM iit_course_reference_for_test
        WHERE test_creation_table_id = ?
      )
      AND cct.course_creation_id NOT IN (
        SELECT course_creation_id
        FROM iit_test_creation_table
        WHERE test_creation_table_id = ?
      )
      AND cct.portal_id = 1;
    `;
    const [rowsNotAssigned] = await db.query(sqlNotAssigned, [testCreationTableId, testCreationTableId]);

    res.status(200).json({
      rowsAssigned,
      rowsNotAssigned
    });

  } catch (error) {
    console.error("Error fetching course assignment data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





router.post("/assignToTest/:testCreationTableId", async (req, res) => {
  const { coursesToBeAssigned } = req.body;
  const { testCreationTableId } = req.params;

  try {
    // Step 1: Get the original test details
    const [testRows] = await db.query(
      `SELECT * FROM iit_test_creation_table WHERE test_creation_table_id = ?`,
      [testCreationTableId]
    );

    if (testRows.length === 0) {
      return res.status(404).json({ message: "Original test not found" });
    }

    const originalTest = testRows[0];
    const testName = originalTest.test_name;

    // Step 2: Prepare queries
    const insertRefSQL = `
      INSERT INTO iit_course_reference_for_test
      (course_creation_id, test_creation_table_id, testName)
      VALUES (?, ?, ?)
    `;

    const insertTestSQL = `
      INSERT INTO iit_test_creation_table 
      (test_name, course_creation_id, course_type_of_test_id, test_start_date, test_end_date, 
       test_start_time, test_end_time, duration, total_questions, total_marks, status, 
       instruction_id, options_pattern_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Step 3: Assign each course
    for (const course of coursesToBeAssigned) {
      const { course_creation_id } = course;

      // Insert into test_creation_table with new course ID
      const [insertTestResult] = await db.query(insertTestSQL, [
        originalTest.test_name,
        course_creation_id,
        originalTest.course_type_of_test_id,
        originalTest.test_start_date,
        originalTest.test_end_date,
        originalTest.test_start_time,
        originalTest.test_end_time,
        originalTest.duration,
        originalTest.total_questions,
        originalTest.total_marks,
        originalTest.status,
        originalTest.instruction_id,
        originalTest.options_pattern_id,
      ]);

      const newTestCreationTableId = insertTestResult.insertId;

      // Insert into reference table
      await db.query(insertRefSQL, [
        course_creation_id,
        newTestCreationTableId,
        testName
      ]);
    }

    res.status(200).json({ message: "Courses assigned and test cloned successfully." });

  } catch (error) {
    console.error("Error while assigning courses to test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete(
  "/assignedTestDel/:courseCreationId/:testCreationTableId",
  async (req, res) => {
    const { courseCreationId, testCreationTableId } = req.params;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction(); 

      // ✅ Delete from iit_course_reference_for_test
      const sqlReferenceDel = `
        DELETE FROM iit_course_reference_for_test
        WHERE course_creation_id = ? AND test_creation_table_id = ?
      `;
      const [referenceResult] = await connection.query(sqlReferenceDel, [
        courseCreationId,
        testCreationTableId,
      ]);

      if (referenceResult.affectedRows === 0) {
        // If no record was deleted, return a message
        return res.status(404).json({
          message: "No matching record found to delete in course_reference_for_test.",
        });
      }

      // ✅ Delete from iit_test_creation_table (unlink the course from the test)
      const sqlTestDel = `
        DELETE FROM iit_test_creation_table
        WHERE course_creation_id = ? AND test_creation_table_id = ?
      `;
      const [testResult] = await connection.query(sqlTestDel, [
        courseCreationId,
        testCreationTableId,
      ]);

      if (testResult.affectedRows === 0) {
        // If no record was deleted from the test creation table, handle the error
        return res.status(404).json({
          message: "No matching record found to delete in test_creation_table.",
        });
      }

      // ✅ Commit transaction if both deletions were successful
      await connection.commit();

      // Send success response
      res.status(200).json({ message: "Course unassigned and test deleted successfully." });

    } catch (error) {
      // In case of any error, rollback the transaction
      await connection.rollback();

      console.error("Error while unassigning course and deleting test:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  }
);




module.exports = router;
