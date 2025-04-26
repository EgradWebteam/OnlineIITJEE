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
    // console.log(`✅ Uploaded ${blobName} successfully`);
    // Return only the blob name (you could return the URL if preferred)
    return path.basename(blobName);
  } catch (error) {
    console.error("❌ Error uploading to Azure:", error);
    throw error;
  }
}
async function deleteFromAzure(blobNameOrPrefix) {
  try {
    const blobsToDelete = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix: blobNameOrPrefix })) {
      blobsToDelete.push(blob.name);
    }

    if (blobsToDelete.length === 0) {
      // console.log(`⚠️ No blobs found under: ${blobNameOrPrefix}`);
      return;
    }

    for (const blobName of blobsToDelete) {
      const blobClient = containerClient.getBlockBlobClient(blobName);
      await blobClient.deleteIfExists();
      // console.log(`🗑️ Deleted: ${blobName}`);
    }

    // console.log(`✅ Deleted ${blobsToDelete.length} blob(s) from Azure`);
  } catch (err) {
    console.error("❌ Error deleting blobs:", err.message);
    throw err;
  }
}

async function uploadPDFToBlob(buffer, blobName) {
  try {
    const blobPath = `exam-resources-orvl/orvl-topic-pdfs/${blobName}`; // <- correct virtual path
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    await blockBlobClient.upload(buffer, buffer.length);
    // console.log(`✅ Uploaded PDF ${blobPath} successfully`);
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
// router.post(
//   "/addTopic",
//   upload.fields([
//     { name: "topic_doc", maxCount: 1 },
//     { name: "topic_pdf", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const connection = await db.getConnection();
//     await connection.beginTransaction();

//     try {
//       const documentFile = req.files["topic_doc"]?.[0];
//       if (!documentFile) {
//         return res.status(400).send("No topic_doc file uploaded.");
//       }

//       const { buffer, originalname } = documentFile;
//       const blobFolder = path.basename(
//         originalname,
//         path.extname(originalname)
//       );
//       const baseFolder = `exam-resources-orvl/${blobFolder}`;
//       const questionFolder = `${baseFolder}/exercisequestions`;
//       const optionFolder = `${baseFolder}/exerciseoptions`;
//       const solutionFolder = `${baseFolder}/exercisesolutions`;
//       const documentBlobName = `${baseFolder}/${Date.now()}_${originalname}`;

//       const blobUrl = await uploadToAzure(buffer, documentBlobName);

//       let pdfFileName = null;
//       if (req.files["topic_pdf"]) {
//         const pdfFile = req.files["topic_pdf"][0];
//         if (pdfFile.mimetype === "application/pdf") {
//           pdfFileName = `${Date.now()}_${pdfFile.originalname}`;
//           await uploadPDFToBlob(pdfFile.buffer, pdfFileName);
//         }
//       }

//       const topicData = [
//         {
//           orvl_topic_name: req.body.topic_name,
//           exam_id: req.body.exam_id ? parseInt(req.body.exam_id) : null,
//           subject_id: req.body.subject_id
//             ? parseInt(req.body.subject_id)
//             : null,
//           orvl_topic_pdf: pdfFileName || null,
//         },
//       ];
//       const topicIds = await storeRecordsInBulk(
//         connection,
//         "iit_orvl_topic_creation",
//         topicData
//       );
//       const topicId = topicIds[0];

//       const docData = [
//         {
//           orvl_document_name: blobFolder,
//           orvl_topic_id: topicId,
//         },
//       ];
//       const docIds = await storeRecordsInBulk(
//         connection,
//         "iit_orvl_documents",
//         docData
//       );
//       const documentId = docIds[0];

//       const result = await mammoth.convertToHtml({ buffer });
//       const rawText = (await mammoth.extractRawText({ buffer })).value;
//       const textSections = rawText.split("\n\n");
//       const images = extractImagesFromHTML(result.value);

//       let lectureId, exerciseId, questionId;
//       let questionIndex = 1;
//       let imageIndex = 0;
//       let questionType = {};
//       let lectures = []; // Ensure this is an array
//       let solutions = []; // Ensure this is an array
//       let solutionMap = {}; // move this outside your section loop

//       for (let section of textSections) {
//         section = section.trim();

//         if (section.startsWith("[LN]")) {
//           const lectureName = section.replace("[LN]", "").trim();
//           if (!lectureName) {
//             console.error("Lecture name is empty, skipping...");
//             continue;
//           }

//           lectures.push({
//             orvl_lecture_name: lectureName,
//             orvl_topic_id: topicId,
//             lecture_video_link: "",
//           });
//         } else if (section.startsWith("[LVL]")) {
//           const lectureVideoLink = section.replace("[LVL]", "").trim();
//           if (lectures.length > 0) {
//             const lastLecture = lectures[lectures.length - 1];
//             lastLecture.lecture_video_link = lectureVideoLink;
//             // Store the lecture record after setting the video link
//             [lectureId] = await storeRecordsInBulk(
//               connection,
//               "iit_orvl_lecture_names",
//               [lastLecture]
//             );
//           }
//         } else if (section.startsWith("[EN]")) {
//           [exerciseId] = await storeRecordsInBulk(
//             connection,
//             "iit_orvl_exercise_names",
//             [
//               {
//                 exercise_name: section.replace("[EN]", "").trim(),
//                 orvl_lecture_name_id: lectureId,
//               },
//             ]
//           );
//         } else if (section.startsWith("[EQ]") && imageIndex < images.length) {
//           const imgUrl = await uploadToAzure(
//             images[imageIndex++],
//             `${questionFolder}/question_${questionIndex}.png`
//           );
//           [questionId] = await insertBulk(
//             connection,
//             "iit_orvl_exercise_questions",
//             [
//               {
//                 exercise_question_img: imgUrl,
//                 exercise_name_id: exerciseId,
//               },
//             ]
//           );
//           questionIndex++;
//         } else if (/^\(a\)/i.test(section) && imageIndex < images.length) {
//           const img = await uploadToAzure(
//             images[imageIndex++],
//             `${optionFolder}/opt_a_${questionIndex - 1}.png`
//           );
//           await insertBulk(connection, "iit_orvl_exercise_options", [
//             {
//               exercise_option_img: img,
//               exercise_option_index: "a",
//               exercise_question_id: questionId,
//             },
//           ]);
//         } else if (/^\(b\)/i.test(section) && imageIndex < images.length) {
//           const img = await uploadToAzure(
//             images[imageIndex++],
//             `${optionFolder}/opt_b_${questionIndex - 1}.png`
//           );
//           await insertBulk(connection, "iit_orvl_exercise_options", [
//             {
//               exercise_option_img: img,
//               exercise_option_index: "b",
//               exercise_question_id: questionId,
//             },
//           ]);
//         } else if (/^\(c\)/i.test(section) && imageIndex < images.length) {
//           const img = await uploadToAzure(
//             images[imageIndex++],
//             `${optionFolder}/opt_c_${questionIndex - 1}.png`
//           );
//           await insertBulk(connection, "iit_orvl_exercise_options", [
//             {
//               exercise_option_img: img,
//               exercise_option_index: "c",
//               exercise_question_id: questionId,
//             },
//           ]);
//         } else if (/^\(d\)/i.test(section) && imageIndex < images.length) {
//           const img = await uploadToAzure(
//             images[imageIndex++],
//             `${optionFolder}/opt_d_${questionIndex - 1}.png`
//           );
//           await insertBulk(connection, "iit_orvl_exercise_options", [
//             {
//               exercise_option_img: img,
//               exercise_option_index: "d",
//               exercise_question_id: questionId,
//             },
//           ]);
//         } else if (section.startsWith("[EQT]")) {
//           questionType = {
//             exercise_question_type: section.replace("[EQT]", "").trim(),
//           };
//           await updateBulk(
//             connection,
//             "iit_orvl_exercise_questions",
//             [
//               {
//                 ...questionType,
//                 exercise_question_id: questionId,
//               },
//             ],
//             "exercise_question_id"
//           );
//         } else if (section.startsWith("[EANS]")) {
//           const answerRaw = section.replace("[EANS]", "").trim();
//           let answer = "",
//             unit = "";

//           if (
//             ["NAT", "NATD", "NATI"].includes(
//               questionType.exercise_question_type
//             )
//           ) {
//             [answer, unit] = answerRaw.split(",").map((a) => a.trim());
//           } else {
//             answer = answerRaw;
//           }

//           await updateBulk(
//             connection,
//             "iit_orvl_exercise_questions",
//             [
//               {
//                 exercise_answer: answer,
//                 exercise_answer_unit: unit,
//                 exercise_question_id: questionId,
//               },
//             ],
//             "exercise_question_id"
//           );
//         } else if (
//           section.startsWith("[ESOL]") ||
//           section.startsWith("[ESOLN]")
//         ) {

//           // Initialize video link and image with current questionId
//           if (!solutionMap[questionId]) {
//             solutionMap[questionId] = {
//               exercise_solution_video_link: null,
//               exercise_solution_img: null,
//               exercise_question_id: questionId,
//             };
//           }

//           // Handle video link
//           if (section.startsWith("[ESOL]")) {
//             const videoLink = section.replace("[ESOL]", "").trim();
//             solutionMap[questionId].exercise_solution_video_link = videoLink;
//           }

//           // Handle image upload
//           if (section.startsWith("[ESOLN]") && imageIndex < images.length) {
//             const solutionImgUrl = await uploadToAzure(
//               images[imageIndex++],
//               `${solutionFolder}/solution_${questionIndex - 1}.png`
//             );
//             solutionMap[questionId].exercise_solution_img = solutionImgUrl;
//           }

      
//         } else if (section.startsWith("[EQSID]")) {
//           await updateBulk(
//             connection,
//             "iit_orvl_exercise_questions",
//             [
//               {
//                 exercise_question_sort_id: section
//                   .replace("[EQSID]", "")
//                   .trim(),
//                 exercise_question_id: questionId,
//               },
//             ],
//             "exercise_question_id"
//           );
//         }
//         for (const solution of Object.values(solutionMap)) {
//           await insertBulk(connection, "iit_orvl_exercise_solutions", [solution]);
//         }
        
//       }

//       await connection.commit();
//       res.status(200).send("Topic and exercises inserted successfully.");
//     } catch (err) {
//       console.error("Error inserting records:", err);
//       await connection.rollback();
//       res.status(500).send("Error inserting or updating records.");
//     }
//   }
// );

//INSERTIN BOTH IMAGE AND LINK IN 1 ROW
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
          pdfFileName = `${uuidv4()}_${pdfFile.originalname}`;
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
      const [topicId] = await storeRecordsInBulk(connection, "iit_orvl_topic_creation", topicData);

      const docData = [
        {
          orvl_document_name: blobFolder,
          orvl_topic_id: topicId,
        },
      ];
      const [documentId] = await storeRecordsInBulk(connection, "iit_orvl_documents", docData);

      const result = await mammoth.convertToHtml({ buffer });
      const rawText = (await mammoth.extractRawText({ buffer })).value;
      const textSections = rawText.split("\n\n");
      const images = extractImagesFromHTML(result.value);

      let lectureId = null;
      let exerciseId = null;
      let questionId = null;
      let questionIndex = 1;
      let imageIndex = 0;
      let questionType = {};
      const lectures = [];
      const solutionMap = {};

      for (let section of textSections) {
        section = section.trim();

        if (section.startsWith("[LN]")) {
          const lectureName = section.replace("[LN]", "").trim();
          if (!lectureName) continue;
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
          const imgUrl = await uploadToAzure(images[imageIndex++], `${questionFolder}/${uuidv4()}_question.png`);
          [questionId] = await insertBulk(connection, "iit_orvl_exercise_questions", [
            {
              exercise_question_img: imgUrl,
              exercise_name_id: exerciseId,
            },
          ]);
          questionIndex++;
        } else if (/^\(a\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/${uuidv4()}_opt_a.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "a",
              exercise_question_id: questionId,
            },
          ]);
        } else if (/^\(b\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/${uuidv4()}_opt_b.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "b",
              exercise_question_id: questionId,
            },
          ]);
        } else if (/^\(c\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/${uuidv4()}_opt_c.png`);
          await insertBulk(connection, "iit_orvl_exercise_options", [
            {
              exercise_option_img: img,
              exercise_option_index: "c",
              exercise_question_id: questionId,
            },
          ]);
        } else if (/^\(d\)/i.test(section) && imageIndex < images.length) {
          const img = await uploadToAzure(images[imageIndex++], `${optionFolder}/${uuidv4()}_opt_d.png`);
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
          await updateBulk(
            connection,
            "iit_orvl_exercise_questions",
            [
              {
                ...questionType,
                exercise_question_id: questionId,
              },
            ],
            "exercise_question_id"
          );
        } else if (section.startsWith("[EANS]")) {
          const answerRaw = section.replace("[EANS]", "").trim();
          let answer = "", unit = "";

          if (["NAT", "NATD", "NATI"].includes(questionType.exercise_question_type)) {
            [answer, unit] = answerRaw.split(",").map((a) => a.trim());
          } else {
            answer = answerRaw;
          }

          await updateBulk(
            connection,
            "iit_orvl_exercise_questions",
            [
              {
                exercise_answer: answer,
                exercise_answer_unit: unit,
                exercise_question_id: questionId,
              },
            ],
            "exercise_question_id"
          );
        } else if (section.startsWith("[ESOL]") || section.startsWith("[ESOLN]")) {
          if (!solutionMap[questionId]) {
            solutionMap[questionId] = {
              exercise_question_id: questionId,
              exercise_solution_video_link: null,
              exercise_solution_img: null,
            };
          }

          if (section.startsWith("[ESOL]")) {
            solutionMap[questionId].exercise_solution_video_link = section.replace("[ESOL]", "").trim();
          }

          if (section.startsWith("[ESOLN]") && imageIndex < images.length) {
            const solutionImgUrl = await uploadToAzure(
              images[imageIndex++],
              `${solutionFolder}/${uuidv4()}_solution.png`
            );
            solutionMap[questionId].exercise_solution_img = solutionImgUrl;
          }
        } else if (section.startsWith("[EQSID]")) {
          await updateBulk(
            connection,
            "iit_orvl_exercise_questions",
            [
              {
                exercise_question_sort_id: section.replace("[EQSID]", "").trim(),
                exercise_question_id: questionId,
              },
            ],
            "exercise_question_id"
          );
        }
      }

      // Move this OUTSIDE the loop - FINAL INSERT for solutions
      if (Object.keys(solutionMap).length > 0) {
        await insertBulk(
          connection,
          "iit_orvl_exercise_solutions",
          Object.values(solutionMap)
        );
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
      .map((key) => `\`${key}\` = ?`)
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
router.put("/updateTopic/:topicId", upload.fields([
  { name: "topic_doc", maxCount: 1 },
  { name: "topic_pdf", maxCount: 1 }
]), async (req, res) => {
  const topicId = parseInt(req.params.topicId);
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Step 1: Fetch existing topic and document data
    const [[topic]] = await connection.query(
      "SELECT t.orvl_topic_pdf, d.orvl_document_name " +
      "FROM iit_orvl_topic_creation t " +
      "LEFT JOIN iit_orvl_documents d ON t.orvl_topic_id = d.orvl_topic_id " +
      "WHERE t.orvl_topic_id = ?",
      [topicId]
    );

    if (!topic) {
      return res.status(404).send("Topic not found.");
    }

    // Step 2: Prepare data for updating the topic
    const topicData = {
      orvl_topic_name: req.body.topic_name,
      exam_id: req.body.exam_id ? parseInt(req.body.exam_id) : null,
      subject_id: req.body.subject_id ? parseInt(req.body.subject_id) : null
    };

    if (req.files["topic_pdf"]) {
      // Step 3: Handle PDF update (delete old PDF from Azure and upload new one)
      if (topic.orvl_topic_pdf) {
        const pdfBlobPath = `exam-resources-orvl/orvl-topic-pdfs/${topic.orvl_topic_pdf}`;
        await deleteFromAzure(pdfBlobPath); // Delete old PDF from Azure
        // console.log(`✅ PDF Deleted: ${pdfBlobPath}`);
      }

      // Upload the new PDF file
      const pdfFile = req.files["topic_pdf"][0];
      if (pdfFile.mimetype === "application/pdf") {
        const pdfFileName = `${Date.now()}_${pdfFile.originalname}`;
        await uploadPDFToBlob(pdfFile.buffer, pdfFileName);
        topicData.orvl_topic_pdf = pdfFileName; // Update PDF filename in database
      }
    }

    // Step 4: Update the topic record in the `iit_orvl_topic_creation` table
    const updateTopicQuery = `
      UPDATE iit_orvl_topic_creation 
      SET 
        orvl_topic_name = ?, 
        exam_id = ?, 
        subject_id = ?, 
        orvl_topic_pdf = ? 
      WHERE orvl_topic_id = ?;
    `;
    await connection.execute(updateTopicQuery, [
      topicData.orvl_topic_name,
      topicData.exam_id,
      topicData.subject_id,
      topicData.orvl_topic_pdf || topic.orvl_topic_pdf, // Preserve old PDF if new one is not uploaded
      topicId
    ]);

    // Step 5: Handle document file update (topic_doc)
    if (req.files["topic_doc"]) {
      const documentFile = req.files["topic_doc"][0];
      const { buffer, originalname } = documentFile;
      const blobFolder = path.basename(originalname, path.extname(originalname));
      const baseFolder = `exam-resources-orvl/${blobFolder}`;
      const documentBlobName = `${baseFolder}/${Date.now()}_${originalname}`;

      // Step 6: Delete old document from Azure if it exists
      if (topic.orvl_document_name) {
        const oldDocPath = `exam-resources-orvl/${topic.orvl_document_name}/`;
        await deleteFromAzure(oldDocPath); // Delete old document folder from Azure
        // console.log(`✅ Document Deleted: ${oldDocPath}`);
      }

      // Step 7: Upload new document to Azure Blob Storage
      const blobUrl = await uploadToAzure(buffer, documentBlobName);

      // Step 8: Update document name in the `iit_orvl_documents` table
      const updateDocumentQuery = `
        UPDATE iit_orvl_documents 
        SET 
          orvl_document_name = ? 
        WHERE orvl_topic_id = ?;
      `;
      await connection.execute(updateDocumentQuery, [blobFolder, topicId]);
    }

    // Step 9: Commit the transaction to apply the updates
    await connection.commit();
    res.status(200).send("✅ Topic and resources updated successfully.");
  } catch (err) {
    console.error("❌ Error updating topic:", err);
    await connection.rollback();
    res.status(500).send("❌ Error updating topic and resources.");
  } finally {
    connection.release();
  }
});


// 🔥 DELETE Topic API
router.delete("/deleteTopic/:topicId", async (req, res) => {
  const topicId = parseInt(req.params.topicId);
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Get PDF filename and Document folder name
    const [[topic]] = await connection.query(
      "SELECT orvl_topic_pdf FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?",
      [topicId]
    );

    const [[doc]] = await connection.query(
      "SELECT orvl_document_name FROM iit_orvl_documents WHERE orvl_topic_id = ?",
      [topicId]
    );

    // 2. Delete PDF from Azure if it exists
    if (topic?.orvl_topic_pdf) {
      const pdfBlobPath = `exam-resources-orvl/orvl-topic-pdfs/${topic.orvl_topic_pdf}`;
      await deleteFromAzure(pdfBlobPath); // Delete PDF from Azure
      // console.log(`✅ PDF Deleted: ${pdfBlobPath}`);
    }

    // 3. Delete all related DB records (lectures, exercises, questions, etc.)
    const [lectures] = await connection.query(
      "SELECT orvl_lecture_name_id FROM iit_orvl_lecture_names WHERE orvl_topic_id = ?",
      [topicId]
    );

    for (const lecture of lectures) {
      const [exercises] = await connection.query(
        "SELECT exercise_name_id FROM iit_orvl_exercise_names WHERE orvl_lecture_name_id = ?",
        [lecture.orvl_lecture_name_id]
      );

      for (const exercise of exercises) {
        const [questions] = await connection.query(
          "SELECT exercise_question_id FROM iit_orvl_exercise_questions WHERE exercise_name_id = ?",
          [exercise.exercise_name_id]
        );

        for (const q of questions) {
          await connection.query(
            "DELETE FROM iit_orvl_exercise_solutions WHERE exercise_question_id = ?",
            [q.exercise_question_id]
          );
          await connection.query(
            "DELETE FROM iit_orvl_exercise_options WHERE exercise_question_id = ?",
            [q.exercise_question_id]
          );
        }

        await connection.query(
          "DELETE FROM iit_orvl_exercise_questions WHERE exercise_name_id = ?",
          [exercise.exercise_name_id]
        );
      }

      await connection.query(
        "DELETE FROM iit_orvl_exercise_names WHERE orvl_lecture_name_id = ?",
        [lecture.orvl_lecture_name_id]
      );
    }

    await connection.query("DELETE FROM iit_orvl_lecture_names WHERE orvl_topic_id = ?", [topicId]);
    await connection.query("DELETE FROM iit_orvl_documents WHERE orvl_topic_id = ?", [topicId]);
    await connection.query("DELETE FROM iit_orvl_topic_creation WHERE orvl_topic_id = ?", [topicId]);

    // 4. Delete the document folder from Azure (if any)
    const documentFolder = `exam-resources-orvl/${doc?.orvl_document_name}/`;
    await deleteFromAzure(documentFolder); // Delete document folder from Azure

    await connection.commit();
    res.status(200).send("✅ Topic, PDF, and related data deleted successfully.");
  } catch (err) {
    await connection.rollback();
    console.error("❌ Deletion error:", err.message);
    res.status(500).send("❌ Failed to delete topic.");
  } finally {
    connection.release();
  }
});




module.exports = router;
