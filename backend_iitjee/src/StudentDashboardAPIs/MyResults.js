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
        tc.total_marks,
        tc.duration,
        tsd.test_attempt_status
    FROM 
        iit_test_status_details tsd
    JOIN 
        iit_test_creation_table tc 
        ON tsd.test_creation_table_id = tc.test_creation_table_id
    JOIN 
        iit_course_creation_table cc 
        ON tc.course_creation_id = cc.course_creation_id
    JOIN 
        iit_exams e 
        ON cc.exam_id = e.exam_id
    WHERE 
        tsd.student_registration_id = ?;`
  ;

  try {
    const [rows] = await db.query(query, [studentId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching test status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
        questionImgName: getImageUrl(row.document_name, 'questions', row.questionImgName),
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
          solutionImgName: getImageUrl(row.document_name, 'solution', row.solution_img_name),
          video_solution_link: row.video_solution_link,
        },
        userAnswer:{
          user_answer:row.user_answer,
        }
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
        optionImgName: getImageUrl(row.document_name, 'options', row.option_img_name),
        user_answer:row.user_answer,
      });
    }
  }

  return result;
};

// Route to get question paper
router.get('/StudentReportQuestionPaper/:test_creation_table_id/:studentId', async (req, res) => {
  try {
    const { test_creation_table_id,studentId } = req.params;
    const [rows] = await db.query(
      `
      SELECT 
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
        sol.video_solution_link,
        ur.user_answer
      FROM iit_db.iit_questions q
      INNER JOIN iit_db.iit_ots_document d ON q.document_Id = d.document_Id
      INNER JOIN iit_db.iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
      INNER JOIN iit_db.iit_subjects s ON d.subject_id = s.subject_id
      LEFT JOIN iit_db.iit_sections sec ON d.section_id = sec.section_id
      LEFT JOIN iit_db.iit_options o ON q.question_id = o.question_id
      LEFT JOIN iit_db.iit_question_type qts ON q.question_type_id = qts.question_type_id
      LEFT JOIN iit_db.iit_solutions sol ON q.question_id = sol.question_id    
      LEFT JOIN iit_db.iit_user_responses ur ON q.question_id = ur.question_id AND ur.student_registration_id = ?
      WHERE d.test_creation_table_id = ?
      ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index
      `,
      [studentId, test_creation_table_id] // ✅ correct order
    );


    const structured = transformTestData(rows);
    res.json(structured);
  } catch (error) {
    console.error('Error fetching question paper:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  module.exports = router;