const express = require("express");
const router = express.Router();
const db = require("../config/database.js");

// const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
// const sasToken = process.env.AZURE_SAS_TOKEN;
// const containerName = process.env.AZURE_CONTAINER_NAME;
// const testDocumentFolderName = process.env.AZURE_DOCUMENT_FOLDER;

// // Helper to get image URL
// const getImageUrl = (documentName, folder, fileName) => {
//   if (!fileName || !documentName) return null;
//   return `https://${accountName}.blob.core.windows.net/${containerName}/${testDocumentFolderName}/${documentName}/${folder}/${fileName}?${sasToken}`;
// };

// // Transform SQL flat rows into structured question paper format
// const transformTestData = (rows) => {
//   if (!rows || rows.length === 0) return {};

//   const result = {
//     TestName: rows[0].TestName,
//     examId: rows[0].examId,
//     courseTypeOfTestId: rows[0].courseTypeOfTestId,
//     TestDuration: rows[0].TestDuration,
//     opt_pattern_id: rows[0].opt_pattern_id,
//     subjects: [],
//   };

//   const subjectMap = {};

//   for (const row of rows) {
//     // if (!row.subjectId || !row.section_id || !row.question_id) continue;
//     if (!row.subjectId || !row.question_id) continue;
//     // Subjects
//     if (!subjectMap[row.subjectId]) {
//       subjectMap[row.subjectId] = {
//         subjectId: row.subjectId,
//         SubjectName: row.SubjectName,
//         sections: [],
//       };
//       result.subjects.push(subjectMap[row.subjectId]);
//     }

//     const currentSubject = subjectMap[row.subjectId];

//     // Sections
//     let section = currentSubject.sections.find(
//       (sec) => sec.sectionId === row.section_id
//     );

//     if (!section) {
//       section = {
//         sectionId: row.section_id,
//         SectionName: row.SectionName,
//         questions: [],
//       };
//       currentSubject.sections.push(section);
//     }

//     // Questions
//     let question = section.questions.find(
//       (q) => q.question_id === row.question_id
//     );

//     if (!question) {
//       question = {
//         question_id: row.question_id,
//         questionImgName: getImageUrl(row.document_name, 'questions', row.questionImgName),
//         document_name: row.document_name,
//         options: [],
//         answer: row.answer,
//         marks_text: row.marks_text,
//         nmarks_text: row.nmarks_text,
//         questionType: {
//           quesionTypeId: row.questionTypeId,
//           qtype_text: row.qtype_text,
//           typeofQuestion: row.qtype_text,
//         },
//         solution: {
//           solution_id: row.solution_id,
//           solutionImgName: getImageUrl(row.document_name, 'solution', row.solution_img_name),
//           video_solution_link: row.video_solution_link,
//         },
//       };
//       section.questions.push(question);
//     }

//     // Options
//     if (
//       row.option_id &&
//       !question.options.some((opt) => opt.option_id === row.option_id)
//     ) {
//       question.options.push({
//         option_id: row.option_id,
//         option_index: row.option_index,
//         optionImgName: getImageUrl(row.document_name, 'options', row.option_img_name),
//       });
//     }
//   }

//   return result;
// };

// // Route to get question paper
// router.get('/QuestionPaper/:test_creation_table_id', async (req, res) => {
//   try {
//     const { test_creation_table_id } = req.params;

//     const [rows] = await db.query(
//       `
//       SELECT
//         t.test_name AS TestName,
//         t.test_creation_table_id AS examId,
//         t.course_type_of_test_id AS courseTypeOfTestId,
//         t.duration AS TestDuration,
//         t.options_pattern_id AS opt_pattern_id,
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
//       FROM iit_questions q
//       INNER JOIN iit_ots_document d ON q.document_Id = d.document_Id
//       INNER JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
//       INNER JOIN iit_subjects s ON d.subject_id = s.subject_id
//       LEFT JOIN iit_sections sec ON d.section_id = sec.section_id
//       LEFT JOIN iit_options o ON q.question_id = o.question_id
//       LEFT JOIN iit_question_type qts ON q.question_type_id = qts.question_type_id
//       LEFT JOIN iit_solutions sol ON q.question_id = sol.question_id
//       WHERE d.test_creation_table_id = ?
//       ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index
//       `,
//       [test_creation_table_id]
//     );

//     const structured = transformTestData(rows);
//     res.json(structured);
//   } catch (error) {
//     console.error('Error fetching question paper:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

//MAIN WORKING CODE
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;
const testDocumentFolderName = process.env.AZURE_DOCUMENT_FOLDER;
const BackendBASE_URL = process.env.BASE_URL;

// Helper to get image URL
const getImageUrl = (documentName, folder, fileName) => {
  if (!fileName || !documentName) return null;
  return `${BackendBASE_URL}/OTS/QOSImages/${documentName}/${folder}/${fileName}`;
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
router.get("/QuestionPaper/:test_creation_table_id", async (req, res) => {
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
      ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index
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

router.post("/QusetionsSorting", async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return res
      .status(400)
      .json({ error: "Invalid data format. 'questions' must be an array." });
  }

  try {
    const queries = questions.map(({ question_id, sort_order }) =>
      db.query(
        "UPDATE iit_questions SET sort_id_text = ? WHERE question_id = ?",
        [sort_order.toString(), question_id]
      )
    );

    await Promise.all(queries);

    res.status(200).json({ message: "Sort order updated successfully" });
  } catch (error) {
    console.error("Error updating sort order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // CHECK FUNCTION
// async function checkIfResponseExists(connection, identifiers) {
//   const checkQuery = `
//     SELECT student_registration_id, test_creation_table_id, subject_id, section_id, question_id, question_type_id
//     FROM iit_user_responses
//     WHERE student_registration_id = ? AND test_creation_table_id = ? AND subject_id = ? AND section_id = ?
//       AND question_id = ? AND question_type_id = ?
//   `;

//   const checkValues = [
//     parseInt(identifiers.realStudentId, 10),
//     parseInt(identifiers.realTestId, 10),
//     identifiers.subject_id ? parseInt(identifiers.subject_id, 10) : null,
//     identifiers.section_id ? parseInt(identifiers.section_id, 10) : 0,
//     parseInt(identifiers.question_id, 10),
//     parseInt(identifiers.question_type_id, 10),
//   ];

//   const [result] = await connection.query(checkQuery, checkValues);
//   return result.length > 0;
// }

// // INSERT FUNCTION
// async function insertResponse(connection, data) {
//   const insertQuery = `
//     INSERT INTO iit_user_responses (
//       student_registration_id,
//       test_creation_table_id,
//       subject_id,
//       section_id,
//       question_id,
//       question_type_id,
//       user_answer,
//       option_id,
//       question_status
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   const insertValues = [
//     parseInt(data.realStudentId, 10),
//     parseInt(data.realTestId, 10),
//     data.subject_id ? parseInt(data.subject_id, 10) : null,
//     data.section_id ? parseInt(data.section_id, 10) : 0,
//     parseInt(data.question_id, 10),
//     parseInt(data.question_type_id, 10),
//     data.userAnswer,
//     data.optionIds,
//     data.answered,
//   ];

//   return await connection.query(insertQuery, insertValues);
// }

// // UPDATE FUNCTION
// async function updateResponse(connection, data) {
//   const updateQuery = `
//     UPDATE iit_user_responses
//     SET user_answer = ?, option_id = ?, question_status = ?
//     WHERE student_registration_id = ? AND test_creation_table_id = ? AND subject_id = ? AND section_id = ?
//       AND question_id = ? AND question_type_id = ?
//   `;

//   const updateValues = [
//     data.userAnswer,
//     data.optionIds,
//     data.answered,
//     parseInt(data.realStudentId, 10),
//     parseInt(data.realTestId, 10),
//     data.subject_id ? parseInt(data.subject_id, 10) : null,
//     data.section_id ? parseInt(data.section_id, 10) : 0,
//     parseInt(data.question_id, 10),
//     parseInt(data.question_type_id, 10),
//   ];

//   return await connection.query(updateQuery, updateValues);
// }

// // MASTER ROUTE
// router.post("/SaveResponse", async (req, res) => {
//   let connection;
//   try {
//     const {
//       realStudentId,
//       questionId,
//       questionTypeId,
//       realTestId,
//       subject_id,
//       section_id,
//       optionIndexes1 = "",
//       optionIndexes2 = "",
//       optionIndexes1CharCodes = [],
//       optionIndexes2CharCodes = [],
//       calculatorInputValue = "",
//       answered = "",
//     } = req.body;

//     // console.log("SaveResponse request received:", req.body);

//     connection = await db.getConnection();

//     const commonAnswer =
//       optionIndexes1CharCodes.join(",") + optionIndexes2CharCodes.join(",");
//     const commonOptions =
//       optionIndexes1 + optionIndexes2 + calculatorInputValue;

//     const identifiers = {
//       realStudentId,
//       question_id: questionId,
//       question_type_id: questionTypeId,
//       realTestId,
//       subject_id,
//       section_id,
//     };

//     const data = {
//       ...identifiers,
//       userAnswer: commonOptions,
//       optionIds: commonAnswer,
//       answered,
//     };

//     const exists = await checkIfResponseExists(connection, identifiers);

//     if (exists) {
//       await updateResponse(connection, data);
//       // console.log("Data to be inserted/updated:", data);
//       // console.log("Response updated");
//       return res
//         .status(200)
//         .json({ success: true, message: "Response updated successfully" });
//     } else {
//       await insertResponse(connection, data);
//       // console.log("Data to be inserted/updated:", data);
//       // console.log("Response inserted");
//       return res
//         .status(200)
//         .json({ success: true, message: "Response inserted successfully" });
//     }
//   } catch (error) {
//     console.error("SaveResponse Error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error" });
//   } finally {
//     if (connection) connection.release();
//   }
// });


// OPTIMIZED MASTER ROUTE
router.post("/SaveResponse", async (req, res) => {
  let connection;
  try {
    const {
      realStudentId,
      questionId,
      questionTypeId,
      realTestId,
      subject_id,
      section_id,
      optionIndexes1 = "",
      optionIndexes2 = "",
      optionIndexes1CharCodes = [],
      optionIndexes2CharCodes = [],
      calculatorInputValue = "",
      answered = "",
    } = req.body;

    connection = await db.getConnection();

    const commonAnswer = optionIndexes1CharCodes.join(",") + optionIndexes2CharCodes.join(",");
    const commonOptions = optionIndexes1 + optionIndexes2 + calculatorInputValue;

    const studentId = parseInt(realStudentId, 10);
    const testId = parseInt(realTestId, 10);
    const subjectId = subject_id ? parseInt(subject_id, 10) : null;
    const sectionId = section_id ? parseInt(section_id, 10) : 0;
    const quesId = parseInt(questionId, 10);
    const quesTypeId = parseInt(questionTypeId, 10);

    const upsertQuery = `
      INSERT INTO iit_user_responses (
        student_registration_id,
        test_creation_table_id,
        subject_id,
        section_id,
        question_id,
        question_type_id,
        user_answer,
        option_id,
        question_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        user_answer = VALUES(user_answer),
        option_id = VALUES(option_id),
        question_status = VALUES(question_status)
    `;

    const values = [
      studentId,
      testId,
      subjectId,
      sectionId,
      quesId,
      quesTypeId,
      commonOptions,
      commonAnswer,
      answered
    ];

    await connection.query(upsertQuery, values);

    return res.status(200).json({ success: true, message: "Response saved successfully" });

  } catch (error) {
    console.error("SaveResponse Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

//CLEAR RESPONSE API
router.delete(
  "/ClearResponse/:studentId/:testCreationTableId/:questionId",
  async (req, res) => {
    let connection;
    try {
      const { studentId, testCreationTableId, questionId } = req.params;

      // console.log(Clearing response for studentId: ${studentId}, testCreationTableId: ${testCreationTableId}, questionId: ${questionId});

      connection = await db.getConnection();

      const deleteQuery = `  DELETE FROM iit_user_responses
      WHERE student_registration_id = ? AND test_creation_table_id = ? AND question_id = ?`;
      const deleteValues = [
        parseInt(studentId, 10),
        parseInt(testCreationTableId, 10),
        parseInt(questionId, 10),
      ];

      const [deleteResult] = await connection.query(deleteQuery, deleteValues);

      if (deleteResult.affectedRows === 0) {
        return res
          .status(404)
          .json({
            success: false,
            message: "No matching response found to clear",
          });
      }

      // console.log("Response cleared successfully");
      res
        .status(200)
        .json({ success: true, message: "Response cleared successfully" });
    } catch (error) {
      console.error("ClearResponse Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  }
);

module.exports = router;
