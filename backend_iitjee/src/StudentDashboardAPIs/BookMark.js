const express = require("express");
const router = express.Router();
const db = require("../config/database.js");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_FOR_FETCHING;
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
        bookMark_Qid: row.bookMark_Qid,
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
        user_answer: row.user_answer,
      });
    }
  }

  return result;
};

router.get("/BookMarkQuestionOptions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(
//       `
//    SELECT 
//   bq.question_id AS bookMark_Qid,
//    t.test_name AS TestName,
//         t.test_creation_table_id AS testId,
//         s.subject_id AS subjectId,
//         s.subject_name AS SubjectName,
//         sec.section_id,
//         sec.section_name AS SectionName,
//         q.question_id,
//         q.question_img_name AS questionImgName,
//         d.document_name,
//         o.option_id,
//         o.option_index,
//         o.option_img_name,
//         q.answer_text AS answer,
//         q.marks_text,
//         q.nmarks_text,
//         q.question_type_id AS questionTypeId,
//         q.qtype_text,
//         sol.solution_id,
//         sol.solution_img_name,
//         sol.video_solution_link
// FROM iit_bookmark_questions bq
// INNER JOIN iit_questions q ON q.question_id = bq.question_id
// INNER JOIN iit_ots_document d ON q.document_Id = d.document_Id
//  INNER JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
//       INNER JOIN iit_subjects s ON d.subject_id = s.subject_id
//       LEFT JOIN iit_sections sec ON d.section_id = sec.section_id
//       LEFT JOIN iit_options o ON q.question_id = o.question_id
//       LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
//       LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id  
// WHERE bq.student_registration_id = ?


//         `,
`SELECT 
    bq.question_id AS bookMark_Qid,
    t.test_name AS TestName,
    t.test_creation_table_id AS testId,
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
FROM 
    iit_bookmark_questions bq
INNER JOIN 
    iit_questions q ON q.question_id = bq.question_id
INNER JOIN 
    iit_ots_document d ON q.document_Id = d.document_Id
INNER JOIN 
    iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
INNER JOIN 
    iit_subjects s ON d.subject_id = s.subject_id
LEFT JOIN 
    iit_sections sec ON d.section_id = sec.section_id
LEFT JOIN 
    iit_options o ON q.question_id = o.question_id
LEFT JOIN 
    iit_question_type qts ON q.question_type_id = qts.question_type_id
LEFT JOIN 
    iit_solutions sol ON q.question_id = sol.question_id  
WHERE 
    bq.student_registration_id = ?
    AND EXISTS (
        SELECT 1
        FROM iit_student_registration sr
        WHERE sr.student_registration_id = bq.student_registration_id
        AND sr.student_activation = 1
    );
` ,
      [studentId] // ✅ correct order
    );

    const structured = transformTestData(rows);
    res.json(structured);
  } catch (error) {
    console.error("Error fetching question paper:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE bookmarked question by question_id
router.delete("/DeleteBookmark/:studentId/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  const studentId = req.params.studentId;
  // console.log("questionId,studentId", questionId, studentId);
  try {
    const sql =
      "DELETE FROM iit_bookmark_questions WHERE student_registration_id = ? AND question_id = ?";
    const [result] = await db.query(sql, [studentId, questionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    // console.log("Bookmark deleted successfully");
    res.status(200).json({ message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
