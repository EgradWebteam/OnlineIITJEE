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
        tsd.student_registration_id = ? AND tsd.test_attempt_status = 'completed';`
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
        bookMark_Qid:row.bookMark_Qid,
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
        optionImgName: getImageUrl(row.document_name, 'options', row.option_img_name),
        user_answer:row.user_answer,
      });
    }
  }

  return result;
};

//WITHOUT BOOKMARK
// // Route to get question paper
// router.get('/StudentReportQuestionPaper/:test_creation_table_id/:studentId', async (req, res) => {
//   try {
//     const { test_creation_table_id,studentId } = req.params;
//     const [rows] = await db.query(
//       `
//       SELECT 
//         t.test_name AS TestName,
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
//         sol.video_solution_link,
//         ur.user_answer
//       FROM iit_questions q
//       INNER JOIN iit_ots_document d ON q.document_Id = d.document_Id
//       INNER JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
//       INNER JOIN iit_subjects s ON d.subject_id = s.subject_id
//       LEFT JOIN iit_sections sec ON d.section_id = sec.section_id
//       LEFT JOIN iit_options o ON q.question_id = o.question_id
//       LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
//       LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id    
//       LEFT JOIN iit_user_responses ur ON q.question_id = ur.question_id AND ur.student_registration_id = ?
//       WHERE d.test_creation_table_id = ?
//       ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index
//       `,
//       [studentId, test_creation_table_id] // ✅ correct order
//     );


//     const structured = transformTestData(rows);
//     res.json(structured);
//   } catch (error) {
//     console.error('Error fetching question paper:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


//WITH BOOKMARK
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
        ur.user_answer,
        bq.question_id As bookMark_Qid
      FROM iit_questions q
      INNER JOIN iit_ots_document d ON q.document_Id = d.document_Id
      INNER JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
      INNER JOIN iit_subjects s ON d.subject_id = s.subject_id
      LEFT JOIN iit_sections sec ON d.section_id = sec.section_id
      LEFT JOIN iit_options o ON q.question_id = o.question_id
      LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
      LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id    
      LEFT JOIN iit_user_responses ur ON q.question_id = ur.question_id AND ur.student_registration_id = ?
        LEFT JOIN iit_bookmark_questions bq ON q.question_id = bq.question_id AND bq.student_registration_id = ?
      WHERE d.test_creation_table_id = ?
      ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index
      `,
      [studentId,studentId, test_creation_table_id] // ✅ correct order
    );


    const structured = transformTestData(rows);
    res.json(structured);
  } catch (error) {
    console.error('Error fetching question paper:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.get('/StudentRankSummary/:studentId/:testId', async (req, res) => {
//   const { studentId, testId } = req.params;

//   if (!studentId || !testId) {
//     return res.status(400).json({ error: 'Missing studentId or testId' });
//   }

//   try {
//     const [rows] = await db.execute(`
//       SELECT 
//         rankedData.student_registration_id,
//         rankedData.test_creation_table_id,
//         rankedData.test_total_marks,
//         rankedData.total_marks,
//         rankedData.rank_position,
//         tct.duration,
//         totalAttemptedStudents.total_students AS totalAttemptedStudents,
//         rankedData.positive_marks,
//         rankedData.negative_marks,
//         rankedData.test_total_Questions,

//         (
//           SELECT time_spent 
//           FROM iit_student_exam_summary 
//           WHERE student_registration_id = ? 
//             AND test_creation_table_id = ?
//         ) AS TimeLeft,

//         stats.totalCorrect,
//         stats.totalWrong,
//         stats.totalQuestions,
//         stats.sumStatus1 AS sumStatus1,
//         stats.sumStatus0 AS sumStatus0

//       FROM (
//         SELECT 
//           sm.student_registration_id, 
//           sm.test_creation_table_id, 
//           tct.total_marks AS test_total_marks, 
//           tct.total_questions AS test_total_Questions,
//           SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) AS total_marks,
//           DENSE_RANK() OVER (
//             PARTITION BY sm.test_creation_table_id 
//             ORDER BY SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) DESC
//           ) AS rank_position,
//           SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS positive_marks,
//           SUM(CASE WHEN sm.status != 1 THEN sm.student_marks ELSE 0 END) AS negative_marks
//         FROM iit_student_marks sm
//         JOIN iit_test_creation_table tct 
//           ON sm.test_creation_table_id = tct.test_creation_table_id
//         WHERE sm.test_creation_table_id = ?
//         GROUP BY sm.student_registration_id, sm.test_creation_table_id, tct.total_marks, tct.total_questions
//       ) AS rankedData

//       JOIN iit_test_creation_table tct 
//         ON rankedData.test_creation_table_id = tct.test_creation_table_id

//       JOIN (
//         SELECT COUNT(DISTINCT student_registration_id) AS total_students
//         FROM iit_student_marks 
//         WHERE test_creation_table_id = ?
//       ) AS totalAttemptedStudents ON 1 = 1

//       JOIN (
//         SELECT
//           sm.student_registration_id,
//           sm.test_creation_table_id,
//           COUNT(CASE WHEN sm.status = 1 THEN 1 ELSE NULL END) AS totalCorrect,
//           COUNT(CASE WHEN sm.status = 0 THEN 1 ELSE NULL END) AS totalWrong,
//           (
//             SELECT COUNT(*) 
//             FROM iit_questions q
//             WHERE q.test_creation_table_id = sm.test_creation_table_id
//           ) AS totalQuestions,
//           SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS sumStatus1,
//           SUM(CASE WHEN sm.status = 0 THEN sm.student_marks ELSE 0 END) AS sumStatus0
//         FROM iit_student_marks sm
//         WHERE sm.student_registration_id = ?
//           AND sm.test_creation_table_id = ?
//         GROUP BY sm.student_registration_id, sm.test_creation_table_id
//       ) AS stats 
//         ON rankedData.student_registration_id = stats.student_registration_id
//         AND rankedData.test_creation_table_id = stats.test_creation_table_id

//       WHERE rankedData.student_registration_id = ?
//     `, [
//       studentId, // For TimeLeft (1)
//       testId,    // For TimeLeft (2)
//       testId,    // For rankedData (3)
//       testId,    // For totalAttemptedStudents (4)
//       studentId, // For stats (5)
//       testId,    // For stats (6)
//       studentId  // For WHERE clause (7)
//     ]);

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
        ? AS student_registration_id,
        tct.test_creation_table_id,
        tct.total_marks AS test_total_marks,
        tct.total_questions AS test_total_Questions,
        rankedData.total_marks,
        rankedData.rank_position,
        tct.duration,
        totalAttemptedStudents.total_students AS totalAttemptedStudents,
        rankedData.positive_marks,
        rankedData.negative_marks,

        (
          SELECT time_spent 
          FROM iit_student_exam_summary 
          WHERE student_registration_id = ?
            AND test_creation_table_id = ?
        ) AS TimeLeft,

        stats.totalCorrect,
        stats.totalWrong,
        stats.totalQuestions,
        stats.sumStatus1,
        stats.sumStatus0

      FROM iit_test_creation_table tct

      LEFT JOIN (
        SELECT 
          sm.student_registration_id, 
          sm.test_creation_table_id, 
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) AS total_marks,
          DENSE_RANK() OVER (
            PARTITION BY sm.test_creation_table_id 
            ORDER BY SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE -sm.student_marks END) DESC
          ) AS rank_position,
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS positive_marks,
          SUM(CASE WHEN sm.status != 1 THEN sm.student_marks ELSE 0 END) AS negative_marks
        FROM iit_student_marks sm
        WHERE sm.test_creation_table_id = ?
        GROUP BY sm.student_registration_id, sm.test_creation_table_id
      ) AS rankedData
        ON rankedData.test_creation_table_id = tct.test_creation_table_id
        AND rankedData.student_registration_id = ?

      LEFT JOIN (
        SELECT
          sm.student_registration_id,
          sm.test_creation_table_id,
          COUNT(CASE WHEN sm.status = 1 THEN 1 ELSE NULL END) AS totalCorrect,
          COUNT(CASE WHEN sm.status = 0 THEN 1 ELSE NULL END) AS totalWrong,
          (
            SELECT COUNT(*) 
            FROM iit_questions q
            WHERE q.test_creation_table_id = sm.test_creation_table_id
          ) AS totalQuestions,
          SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS sumStatus1,
          SUM(CASE WHEN sm.status = 0 THEN sm.student_marks ELSE 0 END) AS sumStatus0
        FROM iit_student_marks sm
        WHERE sm.student_registration_id = ?
          AND sm.test_creation_table_id = ?
        GROUP BY sm.student_registration_id, sm.test_creation_table_id
      ) AS stats 
        ON stats.test_creation_table_id = tct.test_creation_table_id

      LEFT JOIN (
        SELECT COUNT(DISTINCT student_registration_id) AS total_students
        FROM iit_student_marks 
        WHERE test_creation_table_id = ?
      ) AS totalAttemptedStudents ON 1 = 1

      WHERE tct.test_creation_table_id = ?
    `, [
      studentId, // 1: SELECT student_registration_id
      studentId, // 2: Subquery TimeLeft
      testId,    // 3: Subquery TimeLeft
      testId,    // 4: rankedData subquery filter
      studentId, // 5: rankedData JOIN
      studentId, // 6: stats subquery
      testId,    // 7: stats subquery
      testId,    // 8: totalAttemptedStudents
      testId     // 9: WHERE clause for main query
    ]);

    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching student rank summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/TestSubjectWiseStudentMarks/:studentId/:testId', async (req, res) => {
  const { studentId, testId } = req.params;
  let connection;

  try {
    // console.log("Fetching data for studentId:", studentId, "testId:", testId);

    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT 
        sub.subject_id,
        sub.subject_name,
        COUNT(DISTINCT q.question_id) AS total_questions,
        SUM(CASE WHEN sm.status = 1 THEN 1 ELSE 0 END) AS total_correct,
        SUM(CASE WHEN sm.status = 0 THEN 1 ELSE 0 END) AS total_incorrect,
        SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) AS positive_marks,
        SUM(CASE WHEN sm.status = 0 THEN sm.student_marks ELSE 0 END) AS negative_marks,
        SUM(CASE WHEN sm.status = 1 THEN sm.student_marks ELSE 0 END) - 
        SUM(CASE WHEN sm.status = 0 THEN sm.student_marks ELSE 0 END) AS total_marks
      FROM iit_subjects AS sub
      LEFT JOIN iit_questions AS q ON q.subject_id = sub.subject_id
      LEFT JOIN iit_student_marks AS sm 
        ON sm.question_id = q.question_id 
        AND sm.student_registration_id = ?
      WHERE q.test_creation_table_id = ?
      GROUP BY sub.subject_id, sub.subject_name
      ORDER BY sub.subject_id`,
      [studentId, testId]
    );

    // console.log("Rows fetched:", rows);  // Log the fetched data

    if (!rows.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const result = {
      student_registration_id: studentId,
      test_creation_table_id: testId,
      subjects: rows.map(row => ({
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        total_questions: row.total_questions,
        total_correct: row.total_correct,
        total_incorrect: row.total_incorrect,
        positive_marks: row.positive_marks,
        negative_marks: row.negative_marks,
        total_marks: row.total_marks
      }))
    };

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching subject performance data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});

// POST: Toggle Bookmark
router.post('/bookmark/:question_id/:test_creation_table_id/:student_registration_id', async (req, res) => {
  const { question_id, test_creation_table_id, student_registration_id } = req.body;

  try {
    // Check if it already exists
    const [existing] = await db.query(
      'SELECT * FROM iit_bookmark_questions WHERE question_id = ? AND test_creation_table_id = ? AND student_registration_id = ?',
      [question_id, test_creation_table_id, student_registration_id]
    );

    if (existing.length > 0) {
      // If exists, remove (unbookmark)
      await db.query(
        'DELETE FROM iit_bookmark_questions WHERE question_id = ? AND test_creation_table_id = ? AND student_registration_id = ?',
        [question_id, test_creation_table_id, student_registration_id]
      );
      // console.log("Bookmark removed")
      return res.status(200).json({ message: 'Bookmark removed' });
    } else {
      // If not, insert (bookmark)
      await db.query(
        'INSERT INTO iit_bookmark_questions (question_id, test_creation_table_id, student_registration_id) VALUES (?, ?, ?)',
        [question_id, test_creation_table_id, student_registration_id]
      );
      // console.log("Bookmarked successfully")
      return res.status(201).json({ message: 'Bookmarked successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});


module.exports = router;