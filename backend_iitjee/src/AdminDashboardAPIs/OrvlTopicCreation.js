const express = require("express");
const router = express.Router();
const path = require("path");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const db = require("../config/database.js"); // Adjust path if needed
// Azure Storage Configuration: ensure your environment variables are set
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net?${sasToken}`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadToAzure(fileBuffer, blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(fileBuffer, fileBuffer.length);
    console.log(`✅ Uploaded ${blobName} successfully`);
    // Return only the blob name (you could return the URL if preferred)
    return path.basename(blobName);
  } catch (error) {
    console.error("❌ Error uploading to Azure:", error);
    throw error;
  }
}
async function deleteFromAzure(blobName) {
  try {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();
    console.log(`🗑️ Deleted blob: ${blobName}`);
  } catch (err) {
    console.error("❌ Error deleting blob:", blobName, err.message);
  }
}

async function uploadPDFToBlob(buffer, blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length);
    console.log(`✅ Uploaded PDF ${blobName} successfully`);
    return path.basename(blobName);
  } catch (error) {
    console.error("❌ Error uploading PDF to Azure:", error);
    throw error;
  }
}

// Bulk insert helper function
const storeRecordsInBulk = async (connection, tableName, records) => {
  if (!records || records.length === 0) return [];
  const keys = Object.keys(records[0]);
  const values = records.map((record) => keys.map((key) => record[key]));
  const placeholders = values.map(() => `(${keys.map(() => "?").join(",")})`).join(",");
  const query = `INSERT INTO ${tableName} (${keys.join(",")}) VALUES ${placeholders}`;
  try {
    const [result] = await connection.execute(query, values.flat());
    console.log(`✅ Inserted into ${tableName}, Rows Affected: ${result.affectedRows}`);
    return result.insertId
      ? Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i)
      : [];
  } catch (error) {
    console.error(`❌ Error inserting into ${tableName}:`, error);
    console.error(`SQL Query: ${query}`);
    throw error;
  }
};

// Setup multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to extract images from HTML using Cheerio.
const extractImagesFromHTML = (html) => {
  const $ = cheerio.load(html);
  const images = [];
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.startsWith("data:image")) {
      const base64Data = src.replace(/^data:image\/\w+;base64,/, "");
      images.push(Buffer.from(base64Data, "base64"));
    }
  });
  return images;
};

/* 
  POST /addTopic 
  This endpoint processes a document upload (and optional PDF),
  converts it with Mammoth, extracts text and images, then builds bulk arrays
  for lectures, exercise names, questions, options and solutions.
  Both solution images ([ESOLN]) and solution links ([ESOL]) are saved in the same table.
*/
router.post(
    "/addTopic",
    upload.fields([
      { name: "topic_doc", maxCount: 1 },
      { name: "topic_pdf", maxCount: 1 },
    ]),
    async (req, res) => {
      const connection = await db.getConnection();
      await connection.beginTransaction();
  
      try {
        const documentFile = req.files["topic_doc"]?.[0];
        if (!documentFile) {
          return res.status(400).send("No topic_doc file uploaded.");
        }
  
        const { buffer, originalname } = documentFile;
        const blobFolder = path.basename(originalname, path.extname(originalname));
        const baseFolder = `exam-resources-orvl/${blobFolder}`;
        const questionFolder = `${baseFolder}/exercisequestions`;
        const optionFolder = `${baseFolder}/exerciseoptions`;
        const solutionFolder = `${baseFolder}/exercisesolutions`;
        const documentBlobName = `${baseFolder}/${Date.now()}_${originalname}`;
  
        const blobUrl = await uploadToAzure(buffer, documentBlobName);
  
        let pdfFileName = null;
        if (req.files["topic_pdf"]) {
          const pdfFile = req.files["topic_pdf"][0];
          if (pdfFile.mimetype === "application/pdf") {
            pdfFileName = `${Date.now()}_${pdfFile.originalname}`;
            await uploadPDFToBlob(pdfFile.buffer, pdfFileName);
          }
        }
  
        const topicData = [
          {
            orvl_topic_name: req.body.topic_name,
            exam_id: req.body.exam_id ? parseInt(req.body.exam_id) : null,
            subject_id: req.body.subject_id ? parseInt(req.body.subject_id) : null,
            orvl_topic_pdf: pdfFileName || null,
          },
        ];
        const topicIds = await storeRecordsInBulk(connection, "iit_orvl_topic_creation", topicData);
        const topicId = topicIds[0];
  
        const docData = [
          {
            orvl_document_name: blobFolder,
            orvl_topic_id: topicId,
          },
        ];
        const docIds = await storeRecordsInBulk(connection, "iit_orvl_documents", docData);
        const documentId = docIds[0];
  
        const result = await mammoth.convertToHtml({ buffer });
        const rawText = (await mammoth.extractRawText({ buffer })).value;
        const textSections = rawText.split("\n\n");
        const images = extractImagesFromHTML(result.value);
  
        let lectureId, exerciseId, questionId;
        let questionIndex = 1;
        let imageIndex = 0;
        let questionType = {};
        let lectures = []; // Ensure this is an array
        let solutions = []; // Ensure this is an array
        for (let section of textSections) {
          section = section.trim();
  
          if (section.startsWith("[LN]")) {
            const lectureName = section.replace("[LN]", "").trim();
            if (!lectureName) {
              console.error("Lecture name is empty, skipping...");
              continue;
            }
  
            lectures.push({
              orvl_lecture_name: lectureName,
              orvl_topic_id: topicId,
              lecture_video_link: "",
            });
          } else if (section.startsWith("[LVL]")) {
            const lectureVideoLink = section.replace("[LVL]", "").trim();
            if (lectures.length > 0) {
              const lastLecture = lectures[lectures.length - 1];
              lastLecture.lecture_video_link = lectureVideoLink;
              // Store the lecture record after setting the video link
              [lectureId] = await storeRecordsInBulk(connection, "iit_orvl_lecture_names", [lastLecture]);
            }
          } else if (section.startsWith("[EN]")) {
            [exerciseId] = await storeRecordsInBulk(connection, "iit_orvl_exercise_names", [
              {
                exercise_name: section.replace("[EN]", "").trim(),
                orvl_lecture_name_id: lectureId,
              },
            ]);
          } else if (section.startsWith("[EQ]") && imageIndex < images.length) {
            const imgUrl = await uploadToAzure(images[imageIndex++], `${questionFolder}/question_${questionIndex}.png`);
            [questionId] = await insertBulk(connection, "iit_orvl_exercise_questions", [
              {
                exercise_question_img: imgUrl,
                exercise_name_id: exerciseId,
              },
            ]);
            questionIndex++;
          } else if (/^\(a\)/i.test(section) && imageIndex < images.length) {
            const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_a_${questionIndex}.png`);
            await insertBulk(connection, "iit_orvl_exercise_options", [
              {
                exercise_option_img: img,
                exercise_option_index: "a",
                exercise_question_id: questionId,
              },
            ]);
          } else if (/^\(b\)/i.test(section) && imageIndex < images.length) {
            const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_b_${questionIndex}.png`);
            await insertBulk(connection, "iit_orvl_exercise_options", [
              {
                exercise_option_img: img,
                exercise_option_index: "b",
                exercise_question_id: questionId,
              },
            ]);
          } else if (/^\(c\)/i.test(section) && imageIndex < images.length) {
            const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_c_${questionIndex}.png`);
            await insertBulk(connection, "iit_orvl_exercise_options", [
              {
                exercise_option_img: img,
                exercise_option_index: "c",
                exercise_question_id: questionId,
              },
            ]);
          } else if (/^\(d\)/i.test(section) && imageIndex < images.length) {
            const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_d_${questionIndex}.png`);
            await insertBulk(connection, "iit_orvl_exercise_options", [
              {
                exercise_option_img: img,
                exercise_option_index: "d",
                exercise_question_id: questionId,
              },
            ]);
          
          } else if (section.startsWith("[EQT]")) {
            questionType = {
              exercise_question_type: section.replace("[EQT]", "").trim(),
            };
            await updateBulk(connection, "iit_orvl_exercise_questions", [
              {
                ...questionType,
                exercise_question_id: questionId,
              },
            ], "exercise_question_id");
          } else if (section.startsWith("[EANS]")) {
            const answerRaw = section.replace("[EANS]", "").trim();
            let answer = "", unit = "";
  
            if (["NAT", "NATD", "NATI"].includes(questionType.exercise_question_type)) {
              [answer, unit] = answerRaw.split(",").map(a => a.trim());
            } else {
              answer = answerRaw;
            }
  
            await updateBulk(connection, "iit_orvl_exercise_questions", [
              {
                exercise_answer: answer,
                exercise_answer_unit: unit,
                exercise_question_id: questionId,
              },
            ], "exercise_question_id");
          } else if (section.startsWith("[ESOL]")) {
         
            // INSERT if not exists
            await insertBulk(connection, "iit_orvl_exercise_solutions", [
              {
                exercise_solution_video_link: section.replace("[ESOL]", "").trim(),
                exercise_question_id: questionId,
              },
            ]);
          
      } else if (section.startsWith("[ESOLN]") && imageIndex < images.length) {
        const solutionImgUrl = await uploadToAzure(images[imageIndex++], `${solutionFolder}/solution_${questionIndex}.png`);
        const LINK= (section.includes("[ESOL]")) ? section.replace("[ESOL]", "").trim():null; 
       
        await insertBulk(connection, "iit_orvl_exercise_solutions", [
          {
            exercise_solution_img: solutionImgUrl,
            exercise_question_id: questionId,
            exercise_solution_video_link: LINK
          },

        ]);
      } else if (section.startsWith("[EQSID]")) {
            await updateBulk(connection, "iit_orvl_exercise_questions", [
              {
                exercise_question_sort_id: section.replace("[EQSID]", "").trim(),
                exercise_question_id: questionId,
              },
            ], "exercise_question_id");
          }
        }
  
        await connection.commit();
        res.status(200).send("Topic and exercises inserted successfully.");
      } catch (err) {
        console.error("Error inserting records:", err);
        await connection.rollback();
        res.status(500).send("Error inserting or updating records.");
      }
    }
  );
  
  
  
  const insertBulk = async (connection, tableName, dataArray) => {
    if (!dataArray.length) return [];
  
    const keys = Object.keys(dataArray[0]);
    const values = dataArray.map(Object.values);
  
    const sql = `INSERT INTO \`${tableName}\` (${keys.join(", ")}) VALUES ?`;
  
    const [result] = await connection.query(sql, [values]);
    const insertId = result.insertId;
  
    return Array.from({ length: result.affectedRows }, (_, i) => insertId + i);
  };
  
  const updateBulk = async (connection, tableName, dataArray, primaryKey) => {
    for (let data of dataArray) {
      const keyVal = data[primaryKey];
      const updates = { ...data };
      delete updates[primaryKey];
  
      const setClause = Object.keys(updates)
        .map(key => `\`${key}\` = ?`)
        .join(", ");
      const values = Object.values(updates);
  
      const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`${primaryKey}\` = ?`;
      await connection.query(sql, [...values, keyVal]);
    }
  };
  
     

/* GET /getexams - Retrieve exams from the database */
router.get("/getexams", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM iit_exams");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});
router.get("/getTopics", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT orvl_topic_id, orvl_topic_name, exam_id, subject_id, orvl_topic_pdf 
       FROM iit_orvl_topic_creation`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching topics:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});
router.post(
  "/updateTopic/:id",
  upload.fields([
    { name: "topic_doc", maxCount: 1 },
    { name: "topic_pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    const topicId = req.params.id;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const { topic_name, exam_id, subject_id } = req.body;

      // Fetch existing topic
      const [existingRows] = await connection.query(
        "SELECT orvl_topic_pdf FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?",
        [topicId]
      );
      const existingTopic = existingRows[0];

      let pdfFileName = existingTopic?.orvl_topic_pdf || null;
// Check if a new PDF was uploaded
if (req.files["topic_pdf"]) {
  const newPdf = req.files["topic_pdf"][0];
  if (newPdf.mimetype === "application/pdf") {

    // Delete old PDF blob if it exists
    if (pdfFileName) {
      console.log(`🗑️ Deleting old PDF from Azure: ${pdfFileName}`);
      await deleteFromAzure(pdfFileName);
    }

    // Upload new PDF
    pdfFileName = `${Date.now()}_${newPdf.originalname}`;
    console.log(`📤 Uploading new PDF to Azure: ${pdfFileName}`);
    await uploadPDFToBlob(newPdf.buffer, pdfFileName);
  }
}
// Handle DOC upload (optional)
if (req.files["topic_doc"]) {
  const docFile = req.files["topic_doc"][0];
  const docBlobName = `exam-resources-orvl/${Date.now()}_${docFile.originalname}`;
  
  console.log(`📄 New DOC file detected: ${docFile.originalname}`);
  console.log(`📤 Uploading DOC to Azure at path: ${docBlobName}`);
  
  await uploadToAzure(docFile.buffer, docBlobName);
  
  console.log(`✅ Document uploaded to Azure: ${docBlobName}`);
}


      const updateFields = [];
      const values = [];

      if (topic_name) {
        updateFields.push("orvl_topic_name = ?");
        values.push(topic_name);
      }

      if (exam_id) {
        updateFields.push("exam_id = ?");
        values.push(parseInt(exam_id));
      }

      if (subject_id) {
        updateFields.push("subject_id = ?");
        values.push(parseInt(subject_id));
      }

      if (pdfFileName !== existingTopic.orvl_topic_pdf) {
        updateFields.push("orvl_topic_pdf = ?");
        values.push(pdfFileName);
      }

      if (updateFields.length === 0) {
        return res.status(400).send("No data to update.");
      }

      const sql = `UPDATE iit_orvl_topic_creation SET ${updateFields.join(", ")} WHERE orvl_topic_id = ?`;
      values.push(topicId);
      await connection.execute(sql, values);

      await connection.commit();
      res.status(200).send("Topic updated successfully.");
    } catch (err) {
      console.error("❌ Error updating topic:", err.message);
      await connection.rollback();
      res.status(500).send("Failed to update topic.");
    } finally {
      if (connection) connection.release();
    }
  }
);
router.delete("/deleteTopic/:id", async (req, res) => {
  const topicId = req.params.id;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Get PDF and Document info
    const [[topic]] = await connection.query(
      `SELECT orvl_topic_pdf FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?`,
      [topicId]
    );

    const [docs] = await connection.query(
      `SELECT orvl_document_name FROM iit_orvl_documents WHERE orvl_topic_id = ?`,
      [topicId]
    );

    // 2. Delete Azure blobs
    if (topic?.orvl_topic_pdf) await deleteFromAzure(topic.orvl_topic_pdf);

    for (let doc of docs) {
      const blobPrefix = `exam-resources-orvl/${doc.orvl_document_name}`;
      // Delete all folder blobs by listing them (optional, can keep basic delete)
      const blobs = containerClient.listBlobsFlat({ prefix: blobPrefix });
      for await (const blob of blobs) {
        await deleteFromAzure(blob.name);
      }
    }

    // 3. Delete MySQL records
    await connection.query("DELETE FROM iit_orvl_documents WHERE orvl_topic_id = ?", [topicId]);
    await connection.query("DELETE FROM iit_orvl_lecture_names WHERE orvl_topic_id = ?", [topicId]);
    await connection.query("DELETE FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?", [topicId]);

    await connection.commit();
    res.status(200).send("Topic and associated files deleted.");
  } catch (err) {
    console.error("❌ Failed to delete topic:", err.message);
    await connection.rollback();
    res.status(500).send("Error deleting topic and files.");
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
