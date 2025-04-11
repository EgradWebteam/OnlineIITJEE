const express = require("express");
const router = express.Router();
const db = require("../config/database.js");


function transformTestData(rows) {
  if (rows.length === 0) return {};

  const result = {
    TestName: rows[0].TestName,
    examId: rows[0].examId,
    courseTypeOfTestId: rows[0].courseTypeOfTestId,
    TestDuration: rows[0].TestDuration,
    opt_pattern_id: rows[0].opt_pattern_id,
    subjects: [],
  };

  const subjectMap = {};

  rows.forEach((row) => {
    if (!subjectMap[row.subjectId]) {
      subjectMap[row.subjectId] = {
        subjectId: row.subjectId,
        SubjectName: row.SubjectName,
        sections: [],
      };
      result.subjects.push(subjectMap[row.subjectId]);
    }

    const currentSubject = subjectMap[row.subjectId];

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

    let question = section.questions.find(
      (q) => q.question_id === row.question_id
    );
    if (!question && row.question_id) {
      question = {
        question_id: row.question_id,
        questionImgName: row.questionImgName,
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
          solutionImgName: row.solution_img_name,
          video_solution_link: row.video_solution_link,
        },
      };
      section.questions.push(question);
    }

    if (
      row.option_id &&
      !question.options.some((opt) => opt.option_id === row.option_id)
    ) {
      question.options.push({
        option_id: row.option_id,
        option_index: row.option_index,
        optionImgName: row.option_img_name,
      });
    }
  });

  return result;
}

router.get("/QuestionPaper/:test_creation_table_id", async (req, res) => {
  try {
    const { test_creation_table_id } = req.params;

    const [testPaperData] = await db.query(
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
        LEFT JOIN iit_options o ON q.question_id = o.question_id
        LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
        LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id 
        LEFT JOIN iit_ots_document d ON q.document_Id = d.document_Id
        LEFT JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
        LEFT JOIN iit_options_pattern op ON t.options_pattern_id = op.options_pattern_id
        LEFT JOIN iit_subjects s ON d.subject_id = s.subject_id
        LEFT JOIN iit_sections sec ON d.section_id = sec.section_id
        WHERE d.test_creation_table_id = ?
        `,
      [test_creation_table_id]
    );
    const structuredData = transformTestData(testPaperData);
    res.json(structuredData);
  } catch (err) {
    console.error("Error fetching subjectName details:", err);
    res.status(500).json({ error: "Failed to fetch question paper data" });
  }
});

module.exports = router;
