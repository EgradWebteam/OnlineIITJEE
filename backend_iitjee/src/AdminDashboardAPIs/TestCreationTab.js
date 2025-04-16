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
      "active",
      selectedOptionPattern,
    ]);

    const testCreationTableId = testResult.insertId;
    console.log("sections", sections);
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
router.post('/toggleTestStatus', async (req, res) => {
  const { testCreationTableId, newStatus } = req.body;

  try {
    await db.query(
      'UPDATE iit_test_creation_table SET status = ? WHERE test_creation_table_id = ?',
      [newStatus, testCreationTableId]
    );

    res.status(200).json({ message: `Test status updated to ${newStatus}` });
  } catch (error) {
    console.error('Error updating test status:', error);
    res.status(500).json({ message: 'Failed to update test status' });
  }
});



router.get("/FetchTestDataFortable", async (req, res) => {
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
    COUNT(DISTINCT q.question_id) AS uploaded_questions,
    tct.status AS test_activation,
    tct.total_marks,
    tct.duration
FROM iit_test_creation_table tct
LEFT JOIN iit_course_creation_table cct 
    ON tct.course_creation_id = cct.course_creation_id
LEFT JOIN iit_questions q 
    ON tct.test_creation_table_id = q.test_creation_table_id
GROUP BY 
    tct.test_creation_table_id,
    tct.test_name,
    cct.course_name,
    tct.test_start_date,
    tct.test_end_date,
    tct.test_start_time,
    tct.test_end_time,
    tct.total_questions,
    tct.status,
    tct.total_marks,
    tct.duration;

    `;

  try {
    const [rows] = await db.query(sql); // db is a promise-based pool
    res.json(rows);
  } catch (err) {
    console.error("Error fetching test details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;
const testDocumentFolderName = process.env.AZURE_DOCUMENT_FOLDER;

// Helper to get image URL
const getImageUrl = (documentName, folder, fileName) => {
  if (!fileName || !documentName) return null;
  return `https://${accountName}.blob.core.windows.net/${containerName}/${testDocumentFolderName}/${documentName}/${folder}/${fileName}?${sasToken}`;
};

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

module.exports = router;
