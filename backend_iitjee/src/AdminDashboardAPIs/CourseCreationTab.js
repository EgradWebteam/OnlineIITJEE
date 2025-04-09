const express = require("express");
const router = express.Router(); // ✅ MUST include this!
const db = require("../config/database.js"); // Adjust path if needed
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const axios = require("axios");
const path = require('path');



router.get("/CourseCreationFormData", async (req, res) => {
  try {
    const [exams] = await db.query("SELECT exam_id, exam_name FROM iit_exams");
    const [types] = await db.query(
      "SELECT type_of_test_id, type_of_test_name FROM iit_type_of_test"
    );

    res.json({ exams, types });
  } catch (err) {
    console.error("Error fetching IIT data:", err);
    res.status(500).json({ error: "Failed to fetch IIT data" });
  }
});

// GET subjects by exam_id
router.get("/ExamSubjects/:examId", async (req, res) => {
  const { examId } = req.params;

  try {
    const [subjects] = await db.query(
      `
        SELECT s.subject_id, s.subject_name 
        FROM iit_subjects s
        JOIN iit_exam_subjects_table es ON s.subject_id = es.subject_id
        WHERE es.exam_id = ?
        `,
      [examId]
    );

    res.json({ subjects });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// ENV VARIABLES (can also use dotenv)
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;
const STUDENT_PHOTO_FOLDER = "cards"; // no slash here


async function uploadToAzureWithSAS(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sasToken}`
    );
  
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${STUDENT_PHOTO_FOLDER}/${Date.now()}-${path.basename(imageUrl)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    const uploadBlobResponse = await blockBlobClient.uploadData(response.data, {
      blobHTTPHeaders: { blobContentType: "image/png" }, // or detect dynamically
    });
  console.log("uploadBlobResponse",uploadBlobResponse)
    console.log("✅ Uploaded to Azure:", blockBlobClient.url);
    return blockBlobClient.url;
  }

// POST route with file upload and data insert
router.post(
  "/CreateCourse",
  upload.single("courseImageFile"),
  async (req, res) => {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const {
        courseName,
        selectedYear,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
        selectedExamId,
        selectedSubjects = [],
        selectedTypes = [],
        courseImageFile,
      } = req.body;

      console.log("📥 Received Form Data:", {
        courseName,
        selectedYear,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
        selectedExamId,
        selectedSubjects,
        selectedTypes,
        courseImageFile,
      });

      const frontendBaseURL = "http://localhost:5173"; // or your actual domain
    //   let imageUrl;
    const imageUrl = `${frontendBaseURL}/OtsCourseCardImages/${courseImageFile}`;
      
      console.log("imageUrl", imageUrl,courseImageFile, req.file);
      if (courseImageFile) {
        const azureUrl = await uploadToAzureWithSAS(imageUrl);
        console.log("azureUrl",azureUrl)
      }

    




      

      const portal_id = 1;
      const activeCourseStatus = "inactive";

      const insertCourseQuery = `
        INSERT INTO iit_course_creation_table 
        (course_name, course_year, exam_id, course_start_date, course_end_date, cost, discount, total_price, portal_id, active_course, card_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const courseValues = [
        courseName,
        selectedYear,
        selectedExamId,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
        portal_id,
        activeCourseStatus,
        courseImageFile,
      ];

      const [courseResult] = await conn.query(insertCourseQuery, courseValues);
      const courseCreationId = courseResult.insertId;

      console.log("✅ Course inserted with ID:", courseCreationId);

      // Insert into iit_course_subjects
      if (Array.isArray(selectedSubjects)) {
        for (const subjectId of selectedSubjects) {
          await conn.query(
            `INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)`,
            [courseCreationId, subjectId]
          );
          console.log(
            `📘 Inserted subject ID ${subjectId} for course ID ${courseCreationId}`
          );
        }
      }

      // Insert into iit_course_type_of_tests
      if (Array.isArray(selectedTypes)) {
        for (const typeId of selectedTypes) {
          await conn.query(
            `INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)`,
            [courseCreationId, typeId]
          );
          console.log(
            `🧪 Inserted test type ID ${typeId} for course ID ${courseCreationId}`
          );
        }
      }

      await conn.commit();

      console.log("🎉 Course created successfully with all related data!");
      res
        .status(200)
        .json({ success: true, message: "Course Created Successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("❌ Error in submitForm:", err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      conn.release();
    }
  }
);




// const AZURE_BASE_URL = `https://${accountName}.blob.core.windows.net/${containerName}/`; // Set these vars

// router.get("/iit-courses", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT card_image FROM iit_course_creation_table");

//     const resultWithFullImageURL = rows.map((row) => {
//       let azureImageName = row.card_image?.split("/").pop(); // get filename from path
//       return {
//         ...row,
//         fullImageUrl: azureImageName
//           ? `${AZURE_BASE_URL}${azureImageName}`
//           : null,
//       };
//     });

//     res.json({ success: true, data: resultWithFullImageURL });
//   } catch (err) {
//     console.error("Error fetching courses:", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
module.exports = router;
