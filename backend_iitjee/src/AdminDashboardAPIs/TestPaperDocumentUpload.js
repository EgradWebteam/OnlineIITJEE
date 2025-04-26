const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mammoth = require("mammoth");
const cheerio = require("cheerio");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ENV VARIABLES
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;
const testDocumentFolderName = process.env.AZURE_DOCUMENT_FOLDER;
const BackendBASE_URL = process.env.BASE_URL;

router.get("/TestNameFormData", async (req, res) => {
  try {
    // Query to fetch the test name
    const [testDetails] = await db.query(
      "SELECT test_creation_table_id, test_name FROM iit_test_creation_table"
    );

    if (testDetails.length === 0) {
      return res.status(404).json({ error: "Test details not found" });
    }

    res.json({ testDetails });
  } catch (err) {
    console.error("Error fetching test details:", err);
    res.status(500).json({ error: "Failed to fetch test details" });
  }
});

router.get("/subject/:test_creation_table_id", async (req, res) => {
  try {
    const { test_creation_table_id } = req.params; // Accessing the test_creation_table_id from the route parameter

    // Query to fetch the subject name
    const [subjectName] = await db.query(
      "SELECT s.subject_name,s.subject_id FROM iit_test_creation_table tc " +
        "JOIN iit_course_subjects cs ON tc.course_creation_id = cs.course_creation_id " +
        "JOIN iit_subjects s ON cs.subject_id = s.subject_id " +
        "WHERE tc.test_creation_table_id = ?",
      [test_creation_table_id]
    );

    res.json({ subjectName });
  } catch (err) {
    console.error("Error fetching subjectName details:", err);
    res.status(500).json({ error: "Failed to fetch subject name" });
  }
});

router.get(
  "/SectionNames/:test_creation_table_id/:subject_id",
  async (req, res) => {
    try {
      const { test_creation_table_id, subject_id } = req.params; // Accessing the subject_id from the route parameter

      // Query to fetch section names for a given subject
      const [sectionName] = await db.query(
        `SELECT  
                tc.test_creation_table_id,  
  s.subject_id,
  sec.section_id,
              sec.section_name
            FROM 
              iit_subjects s
            LEFT JOIN 
              iit_course_subjects cs ON s.subject_id = cs.subject_id
            LEFT JOIN 
              iit_test_creation_table tc ON cs.course_creation_id = tc.course_creation_id
            LEFT JOIN 
              iit_sections sec ON tc.test_creation_table_id = sec.test_creation_table_id AND sec.subject_id = s.subject_id
            WHERE 
              tc.test_creation_table_id = ? AND s.subject_id = ?`,
        [test_creation_table_id, subject_id]
      );

      // Check if sections are found
      if (sectionName.length === 0) {
        return res
          .status(404)
          .json({ error: "No sections found for this subject" });
      }

      // Return sections in a clean structure
      res.json({ sectionName });
    } catch (err) {
      console.error("Error fetching section details:", err);
      res.status(500).json({ error: "Failed to fetch section details" });
    }
  }
);

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net?${sasToken}`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadToAzure(fileBuffer, blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(fileBuffer, fileBuffer.length);
    // console.log(`✅ Uploaded ${blobName} successfully`);
    return path.basename(blobName);
  } catch (error) {
    console.error("❌ Error uploading to Azure:", error);
    throw error;
  }
}

const storeRecordsInBulk = async (connection, tableName, records) => {
  if (!records || records.length === 0) return [];

  const keys = Object.keys(records[0]);
  const values = records.map((record) => keys.map((key) => record[key]));
  const placeholders = values
    .map(() => `(${keys.map(() => "?").join(",")})`)
    .join(",");
  const query = `INSERT INTO ${tableName} (${keys.join(
    ","
  )}) VALUES ${placeholders}`;

  try {
    const [result] = await connection.execute(query, values.flat());
    // console.log(
    //   `✅ Inserted into ${tableName}, Rows Affected: ${result.affectedRows}`
    // );
    return result.insertId
      ? Array.from(
          { length: result.affectedRows },
          (_, i) => result.insertId + i
        )
      : [];
  } catch (error) {
    console.error(`❌ Error inserting into ${tableName}:`, error);
    console.error(`SQL Query: ${query}`);
    throw error;
  }
};

async function getImagesFromHTML(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $("img")
    .map((_, el) =>
      Buffer.from(
        $(el)
          .attr("src")
          .replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      )
    )
    .get();
}

router.post(
  "/UploadTestPaperDocument",
  upload.single("document"),
  async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      if (!req.file) return res.status(400).send("No file uploaded.");

      const { buffer, originalname } = req.file;
      const baseFolder = `${path.basename(
        originalname,
        path.extname(originalname)
      )}`;
      const documentBlobName = `exam-resources-ots/${baseFolder}/${uuidv4()}_${Date.now()}_${originalname}`;
      const blobUrl = await uploadToAzure(buffer, documentBlobName);

      const subjectId = parseInt(req.body.subjectId);
      const sectionId = req.body.sectionId
        ? parseInt(req.body.sectionId)
        : null;

      // ✅ Corrected keys to match database column names
      const documentIds = await storeRecordsInBulk(
        connection,
        "iit_ots_document",
        [
          {
            document_name: baseFolder,
            test_creation_table_id: req.body.testCreationTableId,
            subject_id: subjectId,
            section_id: sectionId,
          },
        ]
      );

      if (!documentIds.length) throw new Error("Document insertion failed.");
      const documentId = documentIds[0];

      const result = await mammoth.convertToHtml({ buffer });
      const textSections = (
        await mammoth.extractRawText({ buffer })
      ).value.split("\n\n");
      const images = await getImagesFromHTML(result.value);

      let imageIndex = 0;
      let questionBatch = [],
        optionBatch = [],
        solutionBatch = [];

      let answerText = "",
        qtypeText = "",
        questionTypeId = 0,
        currentQuestionIndex = -1,
        Marks_text = 1,
        nmarks_text = 0,
        sortId = 0;

      const qtypeMappings = {
        MCQ4: 1,
        MCQ5: 2,
        MSQN: 3,
        MSQ: 4,
        NATI: 5,
        NATD: 6,
        TF: 7,
      };

      for (let section of textSections) {
        if (section.includes("[Q]")) {
          currentQuestionIndex++;
          answerText = "";
          qtypeText = "";
          questionTypeId = 0;

          const questionImg = images[imageIndex]
            ? await uploadToAzure(
                images[imageIndex++],
                `exam-resources-ots/${baseFolder}/questions/${uuidv4()}_question.png`
              )
            : "";

          questionBatch.push({
            test_creation_table_id: req.body.testCreationTableId,
            section_id: sectionId,
            question_img_name: questionImg,
            subject_id: subjectId,
            document_id: documentId,
            answer_text: "",
            sort_id_text: "",
            qtype_text: "",
            question_type_id: 0,
            marks_text: "",
            nmarks_text: "",
          });
        }

        if (section.includes("[ans]")) {
          answerText = section.replace("[ans]", "").trim();
        }
        if (section.includes("[Marks]")) {
          const match = section.match(/\[Marks\](\d+),(\d+)/);
          if (match) {
            Marks_text = parseInt(match[1]) || 1;
            nmarks_text = parseInt(match[2]) || 0;
          }
        }
        if (section.includes("[sortid]")) {
          sortId = parseInt(section.replace("[sortid]", "").trim()) || 0;
        }
        if (section.includes("[qtype]")) {
          qtypeText = section.replace("[qtype]", "").trim();
          questionTypeId = qtypeMappings[qtypeText] || 0;
        }
        if (section.includes("[quesType]")) {
          questionTypeId = parseInt(section.replace("[quesType]", "").trim());
        }

        if (currentQuestionIndex >= 0) {
          questionBatch[currentQuestionIndex].answer_text = answerText;
          questionBatch[currentQuestionIndex].qtype_text = qtypeText;
          questionBatch[currentQuestionIndex].question_type_id = questionTypeId;
          questionBatch[currentQuestionIndex].marks_text = Marks_text;
          questionBatch[currentQuestionIndex].nmarks_text = nmarks_text;
          questionBatch[currentQuestionIndex].sort_id_text = sortId;
        }

        if (section.match(/\(a\)|\(b\)|\(c\)|\(d\)|\(e\)/)) {
          const optionImg = images[imageIndex]
            ? await uploadToAzure(
                images[imageIndex++],
                `exam-resources-ots/${baseFolder}/options/${uuidv4()}_option.png`
              )
            : "";
          const optionIndex = section.match(/\((a|b|c|d|e)\)/)?.[1];

          if (currentQuestionIndex >= 0) {
            optionBatch.push({
              question_index: currentQuestionIndex,
              option_img_name: optionImg,
              option_index: optionIndex,
            });
          }
        }

        if (section.includes("[soln]")) {
          const solutionImg = images[imageIndex]
            ? await uploadToAzure(
                images[imageIndex++],
                `exam-resources-ots/${baseFolder}/solution/${uuidv4()}_solution.png`
              )
            : "";

          if (currentQuestionIndex >= 0) {
            solutionBatch.push({
              question_index: currentQuestionIndex,
              solution_img_name: solutionImg,
              video_solution_link: "",
            });
          }
        }
      }

      const insertedQuestionIds = await storeRecordsInBulk(
        connection,
        "iit_questions",
        questionBatch
      );

      const questionIdMap = {};
      insertedQuestionIds.forEach((id, idx) => {
        questionIdMap[idx] = id;
      });

      // ✅ iit_options
      const finalOptions = optionBatch.map((opt) => ({
        question_id: questionIdMap[opt.question_index],
        option_index: opt.option_index,
        option_img_name: opt.option_img_name,
      }));
      await storeRecordsInBulk(connection, "iit_options", finalOptions);

      // ✅ iit_solutions
      const finalSolutions = solutionBatch.map((sol) => ({
        question_id: questionIdMap[sol.question_index],
        solution_img_name: sol.solution_img_name,
        video_solution_link: sol.video_solution_link,
      }));
      await storeRecordsInBulk(connection, "iit_solutions", finalSolutions);

      await connection.commit();
      // console.log(`✅ Document uploaded successfully.`);
      res.status(200).json({ message: "Document uploaded successfully." });
    } catch (err) {
      await connection.rollback();
      console.error("❌ Upload error:", err);
      res.status(500).json({ error: "Upload failed." });
    } finally {
      connection.release();
    }
  }
);

router.get("/getUploadedDocuments", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Retrieve query parameters
    const { testCreationTableId, subjectId } = req.query;

    // Start the query to fetch documents from the iit_ots_document table
    let queryString = `
      SELECT d.document_id, d.*, t.test_name
      FROM iit_ots_document d
      LEFT JOIN iit_test_creation_table t ON d.test_creation_table_id = t.test_creation_table_id
    `;

    const queryParams = [];

    // Apply filters if provided (testCreationTableId and subjectId)
    if (testCreationTableId) {
      queryString += ` WHERE d.iit_test_creation_table_id = ?`;
      queryParams.push(testCreationTableId);
    }

    if (subjectId) {
      queryString += queryParams.length > 0 ? ` AND` : ` WHERE`;
      queryString += ` d.subject_id = ?`;
      queryParams.push(subjectId);
    }

    // Execute the query
    const result = await connection.query(queryString, queryParams);

    if (result.length === 0) {
      return res.status(404).json({ message: "No documents found." });
    }

    await connection.commit();

    // console.log(`✅ Fetched documents successfully.`);
    res.status(200).json({ documents: result });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch documents." });
  } finally {
    connection.release();
  }
});



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
   
    testId: rows[0].testId,
    courseTypeOfTestId: rows[0].courseTypeOfTestId,

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
router.get("/ViewTestDocumentData/:test_creation_table_id/:document_id", async (req, res) => {
  try {
    const { test_creation_table_id,document_id } = req.params;

    const [rows] = await db.query(
      `
    SELECT 
    t.test_creation_table_id AS testId,
    t.course_type_of_test_id AS courseTypeOfTestId,
    t.duration AS TestDuration,
    t.options_pattern_id AS opt_pattern_id,
    
    d.document_id,
    d.document_name,

    s.subject_id AS subjectId,
    s.subject_name AS SubjectName,

    sec.section_id,
    sec.section_name AS SectionName,

    q.question_id,
    q.question_img_name AS questionImgName,
    q.answer_text AS answer,
    q.marks_text,
    q.nmarks_text,
    q.question_type_id AS questionTypeId,
    q.qtype_text,

    o.option_id,
    o.option_index,
    o.option_img_name,

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

WHERE d.test_creation_table_id = ? AND d.document_id = ?

ORDER BY s.subject_id, sec.section_id, q.question_id, o.option_index;


      `,
      [test_creation_table_id,document_id]
    );

    const structured = transformTestData(rows);
    res.json(structured);
  } catch (error) {
    console.error("Error fetching question paper:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
