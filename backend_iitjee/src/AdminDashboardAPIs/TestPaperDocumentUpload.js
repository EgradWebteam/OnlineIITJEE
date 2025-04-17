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

// ENV VARIABLES
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;

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
              iit_db.iit_subjects s
            LEFT JOIN 
              iit_db.iit_course_subjects cs ON s.subject_id = cs.subject_id
            LEFT JOIN 
              iit_db.iit_test_creation_table tc ON cs.course_creation_id = tc.course_creation_id
            LEFT JOIN 
              iit_db.iit_sections sec ON tc.test_creation_table_id = sec.test_creation_table_id AND sec.subject_id = s.subject_id
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
    console.log(`✅ Uploaded ${blobName} successfully`);
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
    console.log(
      `✅ Inserted into ${tableName}, Rows Affected: ${result.affectedRows}`
    );
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
      console.log(`✅ Document uploaded successfully.`);
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

    console.log(`✅ Fetched documents successfully.`);
    res.status(200).json({ documents: result });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch documents." });
  } finally {
    connection.release();
  }
});




module.exports = router;
