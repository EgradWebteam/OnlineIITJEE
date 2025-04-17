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

// router.get('/StudentRankSummary/:studentId/:testId', async (req, res) => {
//   const { studentId, testId } = req.params; // FIXED: changed from req.query to req.params

//   if (!studentId || !testId) {
//     return res.status(400).json({ error: 'Missing studentId or testId' });
//   }

//   try {
//     const [rows] = await db.execute(`
//       SELECT 
//           rankedData.student_registration_id, 
//           rankedData.test_creation_table_id, 
//           rankedData.test_total_marks, 
//           rankedData.total_marks, 
//           rankedData.rank_position, 
//           tct.duration,
//           totalAttemptedStudents.total_students AS totalAttemptedStudents,
//           rankedData.positive_marks,
//           rankedData.negative_marks,
//           rankedData.test_total_Questions,
//           (
//               SELECT time_spent 
//               FROM iit_db.iit_student_exam_summary 
//               WHERE student_registration_id = ? AND test_creation_table_id = ?
//           ) AS TimeLeft
//       FROM (
//           SELECT 
//               sm.student_registration_id, 
//               sm.test_creation_table_id, 
//               tct.total_marks AS test_total_marks, 
//               tct.total_questions AS test_total_Questions,
//               SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) AS total_marks,
//               DENSE_RANK() OVER (
//                   PARTITION BY sm.test_creation_table_id 
//                   ORDER BY SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) DESC
//               ) AS rank_position,
//               SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS positive_marks,
//               SUM(CASE WHEN sm.status != 1 THEN sm.student_marks ELSE 0 END) AS negative_marks
//           FROM iit_db.iit_student_marks sm
//           JOIN iit_db.iit_test_creation_table tct ON sm.test_creation_table_id = tct.test_creation_table_id
//           WHERE sm.test_creation_table_id = ?
//           GROUP BY sm.student_registration_id, sm.test_creation_table_id, tct.total_marks
//       ) AS rankedData
//       JOIN iit_db.iit_test_creation_table tct 
//           ON rankedData.test_creation_table_id = tct.test_creation_table_id
//       JOIN (
//           SELECT COUNT(DISTINCT student_registration_id) AS total_students
//           FROM iit_db.iit_student_marks 
//           WHERE test_creation_table_id = ?
//       ) AS totalAttemptedStudents ON 1 = 1
//       WHERE rankedData.student_registration_id = ?;
//     `, [studentId, testId, testId, testId, studentId]);

//     res.json(rows[0] || {});
//   } catch (error) {
//     console.error('Error fetching student rank summary:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


router.get('/StudentRankSummary/:studentId/:testId', async (req, res) => {
  const { studentId, testId } = req.params;

  if (!studentId || !testId) {
    return res.status(400).json({ error: 'Missing studentId or testId' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT 
        rankedData.student_registration_id,
        rankedData.test_creation_table_id,
        rankedData.test_total_marks,
        rankedData.total_marks,
        rankedData.rank_position,
        tct.duration,
        totalAttemptedStudents.total_students AS totalAttemptedStudents,
        rankedData.positive_marks,
        rankedData.negative_marks,
        rankedData.test_total_Questions,

        (
          SELECT time_spent 
          FROM iit_db.iit_student_exam_summary 
          WHERE student_registration_id = ? 
            AND test_creation_table_id = ?
        ) AS TimeLeft,

        stats.totalCorrect,
        stats.totalWrong,
        stats.totalQuestions,
        stats.sumStatus1 AS sumStatus1,
        stats.sumStatus0 AS sumStatus0

      FROM (
        SELECT 
          sm.student_registration_id, 
          sm.test_creation_table_id, 
          tct.total_marks AS test_total_marks, 
          tct.total_questions AS test_total_Questions,
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) AS total_marks,
          DENSE_RANK() OVER (
            PARTITION BY sm.test_creation_table_id 
            ORDER BY SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) DESC
          ) AS rank_position,
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS positive_marks,
          SUM(CASE WHEN sm.status != 1 THEN sm.student_marks ELSE 0 END) AS negative_marks
        FROM iit_db.iit_student_marks sm
        JOIN iit_db.iit_test_creation_table tct 
          ON sm.test_creation_table_id = tct.test_creation_table_id
        WHERE sm.test_creation_table_id = ?
        GROUP BY sm.student_registration_id, sm.test_creation_table_id, tct.total_marks, tct.total_questions
      ) AS rankedData

      JOIN iit_db.iit_test_creation_table tct 
        ON rankedData.test_creation_table_id = tct.test_creation_table_id

      JOIN (
        SELECT COUNT(DISTINCT student_registration_id) AS total_students
        FROM iit_db.iit_student_marks 
        WHERE test_creation_table_id = ?
      ) AS totalAttemptedStudents ON 1 = 1

      JOIN (
        SELECT
          sm.student_registration_id,
          sm.test_creation_table_id,
          COUNT(CASE WHEN sm.status = 1 THEN 1 ELSE NULL END) AS totalCorrect,
          COUNT(CASE WHEN sm.status = 0 THEN 1 ELSE NULL END) AS totalWrong,
          (
            SELECT COUNT(*) 
            FROM iit_db.iit_questions q
            WHERE q.test_creation_table_id = sm.test_creation_table_id
          ) AS totalQuestions,
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS sumStatus1,
          SUM(CASE WHEN sm.status = 0 THEN sm.student_marks ELSE 0 END) AS sumStatus0
        FROM iit_db.iit_student_marks sm
        WHERE sm.student_registration_id = ?
          AND sm.test_creation_table_id = ?
        GROUP BY sm.student_registration_id, sm.test_creation_table_id
      ) AS stats 
        ON rankedData.student_registration_id = stats.student_registration_id
        AND rankedData.test_creation_table_id = stats.test_creation_table_id

      WHERE rankedData.student_registration_id = ?
    `, [
      studentId, // For TimeLeft (1)
      testId,    // For TimeLeft (2)
      testId,    // For rankedData (3)
      testId,    // For totalAttemptedStudents (4)
      studentId, // For stats (5)
      testId,    // For stats (6)
      studentId  // For WHERE clause (7)
    ]);

    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching student rank summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.get('/TestSubjectWiseStudentMarks/:studentId/:testId', (req, res) => {
//   const { studentId, testId } = req.params;

//   const query = `
//     SELECT 
//         sub.subject_id AS subject_id,
//         sub.subject_name,
//         COUNT(q.question_id) AS total_questions,
//         SUM(CASE WHEN sm.status = 1 THEN 1 ELSE 0 END) AS total_correct,
//         SUM(CASE WHEN sm.status = 0 THEN 1 ELSE 0 END) AS total_incorrect,
//         SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) AS positive_marks,
//         SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS negative_marks,
//         SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) - 
//         SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS total_marks
//     FROM iit_db.iit_course_subjects AS cs
//     INNER JOIN iit_db.iit_subjects AS sub ON cs.subject_id = sub.subject_id
//     INNER JOIN iit_db.iit_test_creation_table AS tc ON cs.course_creation_id = tc.course_creation_id
//     LEFT JOIN iit_db.iit_student_marks AS sm 
//         ON sm.test_creation_table_id = tc.test_creation_table_id
//         AND sm.student_registration_id = ?
//         AND sm.subject_id = sub.subject_id
//     LEFT JOIN iit_db.iit_questions AS q ON q.question_id = sm.question_id
//     WHERE sm.test_creation_table_id = ?
//     GROUP BY sub.subject_id, sub.subject_name
//     ORDER BY sub.subject_id
//   `;

//   db.query(query, [studentId, testId], (err, results) => {
//     if (err) {
//       console.error('Error fetching subject summary:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//     res.json({ studentId, testId, summary: results });
//   });
// });
// router.get('/TestSubjectWiseStudentMarks/:studentId/:testId', (req, res) => {
//   const { studentId, testId } = req.params;

//   const timerLabel = `Query Execution Time - ${studentId}-${testId}`;  // Unique label

//   console.log('Fetching subject summary for student:', studentId, 'and test:', testId);
//   console.time(timerLabel);  // Use the unique label for each request

//   const query = `
//    SELECT 
//     sub.subject_id AS subject_id,
//     sub.subject_name,
//     COUNT(DISTINCT q.question_id) AS total_questions,  -- Total questions in subject
//     SUM(CASE WHEN sm.status = 1 THEN 1 ELSE 0 END) AS total_correct,
//     SUM(CASE WHEN sm.status = 0 THEN 1 ELSE 0 END) AS total_incorrect,
//     SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) AS positive_marks,
//     SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS negative_marks,
//     SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) - 
//     SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS total_marks
// FROM iit_db.iit_course_subjects AS cs
// INNER JOIN iit_db.iit_subjects AS sub ON cs.subject_id = sub.subject_id
// INNER JOIN iit_db.iit_test_creation_table AS tc ON cs.course_creation_id = tc.course_creation_id
// LEFT JOIN iit_db.iit_questions AS q 
//     ON q.subject_id = sub.subject_id
//     AND q.test_creation_table_id = tc.test_creation_table_id
// LEFT JOIN iit_db.iit_student_marks AS sm 
//     ON sm.question_id = q.question_id
//     AND sm.student_registration_id = ?
//     AND sm.subject_id = sub.subject_id
//     AND sm.test_creation_table_id = tc.test_creation_table_id
// WHERE tc.test_creation_table_id = ?
// GROUP BY sub.subject_id, sub.subject_name
// ORDER BY sub.subject_id
// LIMIT 0, 300;

//   `;

//   db.query(query, [studentId, testId], (err, results) => {
//     console.timeEnd(timerLabel);  // Use the unique label here

//     if (err) {
//       console.error('Error fetching subject summary:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     // Log the result data for debugging
//     console.log('Query Results:', results);

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No data found for the given student and test.' });
//     }

//     res.json({ studentId, testId, summary: results });
//   });
// });

router.get('/TestSubjectWiseStudentMarks/:studentId/:testId', (req, res) => {
  const { studentId, testId } = req.params;

  const query = `
    SELECT 
      sub.subject_id AS subject_id,
      sub.subject_name,
      COUNT(DISTINCT q.question_id) AS total_questions,
      SUM(CASE WHEN sm.status = 1 THEN 1 ELSE 0 END) AS total_correct,
      SUM(CASE WHEN sm.status = 0 THEN 1 ELSE 0 END) AS total_incorrect,
      SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) AS positive_marks,
      SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS negative_marks,
      SUM(CASE WHEN sm.status = 1 THEN q.marks_text ELSE 0 END) - 
      SUM(CASE WHEN sm.status = 0 THEN q.nmarks_text ELSE 0 END) AS total_marks
    FROM iit_db.iit_course_subjects AS cs
    INNER JOIN iit_db.iit_subjects AS sub ON cs.subject_id = sub.subject_id
    INNER JOIN iit_db.iit_test_creation_table AS tc ON cs.course_creation_id = tc.course_creation_id
    LEFT JOIN iit_db.iit_questions AS q 
      ON q.subject_id = sub.subject_id
      AND q.test_creation_table_id = tc.test_creation_table_id
    LEFT JOIN iit_db.iit_student_marks AS sm 
      ON sm.question_id = q.question_id
      AND sm.student_registration_id = ?
      AND sm.subject_id = sub.subject_id
      AND sm.test_creation_table_id = tc.test_creation_table_id
    WHERE tc.test_creation_table_id = ?
    GROUP BY sub.subject_id, sub.subject_name
    ORDER BY sub.subject_id
    LIMIT 300;
  `;

  db.query(query, [studentId, testId], (err, results) => {
    if (err) {
      console.error('Error fetching subject summary:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the given student and test.' });
    }

    res.json({ studentId, testId, summary: results });
  });
});


module.exports = router;