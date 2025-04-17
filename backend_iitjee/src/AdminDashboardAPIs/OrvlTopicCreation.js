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

async function uploadPDFToBlob(buffer, blobName) {
  try {
    // Log which file is being uploaded
    console.log(`📝 Starting upload for PDF: ${blobName}`);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length);

    // Log success message after the upload
    console.log(`✅ Uploaded PDF ${blobName} successfully`);
    
    return path.basename(blobName);
  } catch (error) {
    // Log error message if upload fails
    console.error("❌ Error uploading PDF to Azure:", error);
    throw error;
  }
}
async function deleteBlobFromAzure(blobName) {
  try {
    // Log the start of the deletion process
    console.log(`🗑️ Attempting to delete blob from Azure: ${blobName}`);
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    
    // Log success message after successful deletion
    console.log(`✅ Successfully deleted blob: ${blobName}`);
  } catch (error) {
    // Log error message if deletion fails
    console.error(`❌ Error deleting blob ${blobName}:`, error.message);
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
      console.log(`Inserted into iit_orvl_topic_creation with topicId: ${topicId}`);

      const docData = [
        {
          orvl_document_name: blobFolder,
          orvl_topic_id: topicId,
        },
      ];
      const docIds = await storeRecordsInBulk(connection, "iit_orvl_documents", docData);
      const documentId = docIds[0];
      console.log(`Inserted into iit_orvl_documents with documentId: ${documentId}`);

      const result = await mammoth.convertToHtml({ buffer });
      const rawText = (await mammoth.extractRawText({ buffer })).value;
      const textSections = rawText.split("\n\n");
      const images = extractImagesFromHTML(result.value);

      let lectureId, exerciseId, questionId;
      let questionIndex = 1;
      let imageIndex = 0;
      let questionType = {};

      for (let section of textSections) {
        section = section.trim();

        if (section.startsWith("[LN]")) {
          [lectureId] = await insertBulk(connection, "iit_orvl_lecture_names", [
            {
              orvl_lecture_name: section.replace("[LN]", "").trim(),
              orvl_topic_id: topicId,
            },
          ]);
          console.log(`Inserted into iit_orvl_lecture_names with lectureId: ${lectureId}`);
        } else if (section.startsWith("[LVL]")) {
          await updateBulk(connection, "iit_orvl_lecture_names", [
            {
              lecture_video_link: section.replace("[LVL]", "").trim(),
              orvl_lecture_name_id: lectureId,
            },
          ], "orvl_lecture_name_id");
          console.log(`Updated iit_orvl_lecture_names for lectureId: ${lectureId}`);
        } else if (section.startsWith("[EN]")) {
          [exerciseId] = await insertBulk(connection, "iit_orvl_exercise_names", [
            {
              exercise_name: section.replace("[EN]", "").trim(),
              orvl_lecture_name_id: lectureId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_names with exerciseId: ${exerciseId}`);
        } else if (section.startsWith("[EQ]") && imageIndex < images.length) {
          const imgUrl = await uploadToAzure(images[imageIndex++], `${questionFolder}/question_${questionIndex}.png`);
          [questionId] = await insertBulk(connection, "iit_orvl_exercise_questions", [
            {
              exercise_question_img: imgUrl,
              exercise_name_id: exerciseId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_questions with questionId: ${questionId}`);
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
          console.log(`Inserted into iit_orvl_exercise_options with option 'a' for questionId: ${questionId}`);
        } else if (/^\(b\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_b_${questionIndex}.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "b",
              exercise_question_id: questionId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_options with option 'b' for questionId: ${questionId}`);
        } else if (/^\(c\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_c_${questionIndex}.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "c",
              exercise_question_id: questionId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_options with option 'c' for questionId: ${questionId}`);
        } else if (/^\(d\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/opt_d_${questionIndex}.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "d",
              exercise_question_id: questionId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_options with option 'd' for questionId: ${questionId}`);
        } else if (section.startsWith("[ESOLN]") && imageIndex < images.length) {
          const solutionImgUrl = await uploadToAzure(images[imageIndex++], `${solutionFolder}/solution_${questionIndex}.png`);
          const LINK = section.includes("[ESOL]") ? section.replace("[ESOL]", "").trim() : null;
          
          await insertBulk(connection, "iit_orvl_exercise_solutions", [
            {
              exercise_solution_img: solutionImgUrl,
              exercise_question_id: questionId,
              exercise_solution_video_link: LINK,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_solutions for questionId: ${questionId}`);
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
          console.log(`Updated iit_orvl_exercise_questions with type for questionId: ${questionId}`);
        } else if (section.startsWith("[EANS]")) {
          const answerRaw = section.replace("[EANS]", "").trim();
          let answer = "", unit = "";

          if (["NAT", "NATD", "NATI"].includes(questionType.orvl_question_type)) {
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
          console.log(`Updated iit_orvl_exercise_questions with answer for questionId: ${questionId}`);
        } else if (section.startsWith("[ESOL]")) {
          await insertBulk(connection, "iit_orvl_exercise_solutions", [
            {
              exercise_solution_video_link: section.replace("[ESOL]", "").trim(),
              exercise_question_id: questionId,
            },
          ]);
          console.log(`Inserted into iit_orvl_exercise_solutions with solution link for questionId: ${questionId}`);
        } else if (section.startsWith("[EQSID]")) {
          await updateBulk(connection, "iit_orvl_exercise_questions", [
            {
              exercise_question_sort_id: section.replace("[EQSID]", "").trim(),
              exercise_question_id: questionId,
            },
          ], "exercise_question_id");
          console.log(`Updated iit_orvl_exercise_questions with sortId for questionId: ${questionId}`);
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
router.post("/updateTopic/:id", upload.fields([
  { name: "topic_doc", maxCount: 1 },
  { name: "topic_pdf", maxCount: 1 },
]), async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const topicId = req.params.id; // Topic ID from URL params
    console.log(`📝 Received update request for topic ID: ${topicId}`);

    // Log incoming data from frontend
    console.log("📦 Frontend form data received:");
    console.log(" - topic_name:", req.body.topic_name);
    console.log(" - exam_id:", req.body.exam_id);
    console.log(" - subject_id:", req.body.subject_id);
    console.log(" - Files received:", Object.keys(req.files));

    // Fetch the existing topic details from the database
    const [topic] = await connection.query(
      `SELECT orvl_topic_pdf FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?`, 
      [topicId]
    );

    if (!topic.length) {
      console.log(`❌ Topic with ID ${topicId} not found.`);
      return res.status(404).send("Topic not found");
    }

    const existingPdfName = topic[0].orvl_topic_pdf;
    console.log(`🔍 Existing PDF for topic ID ${topicId}: ${existingPdfName || 'None'}`);

    // Handle the document upload
    const documentFile = req.files["topic_doc"]?.[0];
    if (documentFile) {
      const { buffer, originalname } = documentFile;
      const blobFolder = path.basename(originalname, path.extname(originalname));
      const baseFolder = `exam-resources-orvl/${blobFolder}`;
      const documentBlobName = `${baseFolder}/${Date.now()}_${originalname}`;

      console.log(`📂 Uploading document to Azure with blob name: ${documentBlobName}`);
      const blobUrl = await uploadToAzure(buffer, documentBlobName);
      console.log(`✅ Document uploaded to Azure: ${blobUrl}`);
    }

    // If a new PDF is uploaded, replace the old one
    let pdfFileName = existingPdfName;
    if (req.files["topic_pdf"]) {
      const pdfFile = req.files["topic_pdf"][0];

      console.log(`📂 New PDF file detected from frontend: ${pdfFile.originalname}`);

      if (pdfFile.mimetype === "application/pdf") {
        if (existingPdfName) {
          console.log(`🗑️ Preparing to delete old PDF from Azure: ${existingPdfName}`);
          await deleteBlobFromAzure(existingPdfName);
          console.log(`✅ Deleted old PDF from Azure: ${existingPdfName}`);
        }

        pdfFileName = `${Date.now()}_${pdfFile.originalname}`;
        console.log(`📤 Uploading new PDF to Azure as: ${pdfFileName}`);
        await uploadPDFToBlob(pdfFile.buffer, pdfFileName);
        console.log(`✅ New PDF uploaded to Azure successfully: ${pdfFileName}`);
      } else {
        console.warn(`⚠️ Uploaded file is not a valid PDF: ${pdfFile.mimetype}`);
      }
    } else {
      console.log("📎 No new PDF uploaded. Keeping existing PDF.");
    }

    // Update the topic data in the database
    const updatedTopicData = {
      orvl_topic_name: req.body.topic_name,
      exam_id: req.body.exam_id ? parseInt(req.body.exam_id) : null,
      subject_id: req.body.subject_id ? parseInt(req.body.subject_id) : null,
      orvl_topic_pdf: pdfFileName || existingPdfName,
    };

    console.log(`🛠️ Updating database record for topic ID ${topicId} with:`);
    console.table(updatedTopicData);

    await connection.query(
      `UPDATE iit_orvl_topic_creation SET ? WHERE orvl_topic_id = ?`,
      [updatedTopicData, topicId]
    );

    console.log(`✅ Topic with ID ${topicId} updated in the database.`);

    await connection.commit();
    res.status(200).send("Topic updated successfully.");
  } catch (err) {
    console.error("❌ Error updating topic:", err);
    await connection.rollback();
    res.status(500).send("Error updating topic.");
  } finally {
    if (connection) connection.release();
  }
});
router.delete("/deleteTopic/:id", async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  const topicId = req.params.id;
  console.log(`🧨 DELETE request received for topic ID: ${topicId}`);

  try {
    // 1. Get the topic + document info
    const [topicRows] = await connection.query(
      `SELECT orvl_topic_pdf FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?`,
      [topicId]
    );

    const [docRows] = await connection.query(
      `SELECT orvl_document_name FROM iit_orvl_documents WHERE orvl_topic_id = ?`,
      [topicId]
    );

    if (!topicRows.length) {
      console.log(`❌ No topic found with ID: ${topicId}`);
      return res.status(404).send("Topic not found");
    }

    const topicPdf = topicRows[0].orvl_topic_pdf;
    const topicFolder = docRows[0]?.orvl_document_name;

    // 2. Delete PDF from Azure if exists
    if (topicPdf) {
      console.log(`🗑️ Deleting topic PDF from Azure: ${topicPdf}`);
      await deleteBlobFromAzure(topicPdf);
    }

    // 3. Optionally: Delete all blobs related to the topic folder
    if (topicFolder) {
      const folderPrefix = `exam-resources-orvl/${topicFolder}/`;
      console.log(`🧹 Deleting all blobs from Azure folder: ${folderPrefix}`);
      for await (const blob of containerClient.listBlobsFlat({ prefix: folderPrefix })) {
        console.log(`🗑️ Deleting blob: ${blob.name}`);
        await containerClient.deleteBlob(blob.name);
      }
    }

    // 4. Delete from child tables (based on joins)
    await connection.query(`
      DELETE eo
      FROM iit_orvl_exercise_options eo
      JOIN iit_orvl_exercise_questions eq ON eo.exercise_question_id = eq.exercise_question_id
      JOIN iit_orvl_exercise_names en ON eq.exercise_name_id = en.exercise_name_id
      JOIN iit_orvl_lecture_names ln ON en.orvl_lecture_name_id = ln.orvl_lecture_name_id
      WHERE ln.orvl_topic_id = ?
    `, [topicId]);

    await connection.query(`
      DELETE es
      FROM iit_orvl_exercise_solutions es
      JOIN iit_orvl_exercise_questions eq ON es.exercise_question_id = eq.exercise_question_id
      JOIN iit_orvl_exercise_names en ON eq.exercise_name_id = en.exercise_name_id
      JOIN iit_orvl_lecture_names ln ON en.orvl_lecture_name_id = ln.orvl_lecture_name_id
      WHERE ln.orvl_topic_id = ?
    `, [topicId]);

    await connection.query(`
      DELETE eq
      FROM iit_orvl_exercise_questions eq
      JOIN iit_orvl_exercise_names en ON eq.exercise_name_id = en.exercise_name_id
      JOIN iit_orvl_lecture_names ln ON en.orvl_lecture_name_id = ln.orvl_lecture_name_id
      WHERE ln.orvl_topic_id = ?
    `, [topicId]);

    await connection.query(`
      DELETE FROM iit_orvl_exercise_names 
      WHERE orvl_lecture_name_id IN (
        SELECT orvl_lecture_name_id FROM iit_orvl_lecture_names WHERE orvl_topic_id = ?
      )
    `, [topicId]);

    await connection.query(`DELETE FROM iit_orvl_lecture_names WHERE orvl_topic_id = ?`, [topicId]);
    await connection.query(`DELETE FROM iit_orvl_documents WHERE orvl_topic_id = ?`, [topicId]);
    await connection.query(`DELETE FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?`, [topicId]);

    console.log(`✅ All related data for topic ID ${topicId} deleted.`);

    await connection.commit();
    res.status(200).send(`Topic and related data deleted successfully.`);
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error deleting topic and related data:", error);
    res.status(500).send("Internal Server Error while deleting topic.");
  } finally {
    if (connection) connection.release();
  }
});



module.exports = router;
