const express = require("express");
const router = express.Router(); // ✅ MUST include this!
const db = require("../config/database.js"); // Adjust path if needed
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const axios = require("axios");
const path = require("path");

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

  // Create a unique blob name using the current timestamp and the image file name
  const timestamp = Date.now();
  const blobName = `${STUDENT_PHOTO_FOLDER}/${timestamp}-${path.basename(
    imageUrl
  )}`;

  console.log("File name for Azure storage:", blobName); // Log the file name for Azure

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the image to Azure
  const uploadBlobResponse = await blockBlobClient.uploadData(response.data, {
    blobHTTPHeaders: { blobContentType: "image/png" }, // or dynamically detect based on the image type
  });

  console.log("uploadBlobResponse", uploadBlobResponse);
  console.log("✅ Uploaded to Azure:", blockBlobClient.url);

  // Return the Azure URL of the uploaded image
  return blockBlobClient.url;
}

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
        courseImageFile,
      } = req.body;

      const parseInputArray = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input.map(Number);
        try {
          const parsed = JSON.parse(input);
          return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
        } catch {
          return String(input).split(",").map(Number);
        }
      };

      const selectedSubjects = parseInputArray(req.body.selectedSubjects);
      const selectedTypes = parseInputArray(req.body.selectedTypes);

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
      const imageUrl = `${frontendBaseURL}/OtsCourseCardImages/${courseImageFile}`;

      let azureUrl = "";
      let azureFileName = "";
      if (courseImageFile) {
        azureUrl = await uploadToAzureWithSAS(imageUrl);

        // Extract only the file name from the Azure URL
        azureFileName = azureUrl.split("/").pop().split("?")[0]; // This splits the URL and takes only the file name
        console.log("File name for Azure URL:", azureFileName); // Log the file name stored in Azure
      }

      console.log("azureFileName", azureFileName);

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
        azureFileName, // Save the Azure URL in the database
      ];

      const [courseResult] = await conn.query(insertCourseQuery, courseValues);
      const courseCreationId = courseResult.insertId;

      console.log("✅ Course inserted with ID:", courseCreationId);

      // Insert into iit_course_subjects
      for (const subjectId of selectedSubjects) {
        await conn.query(
          `INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)`,
          [courseCreationId, subjectId]
        );
        console.log(`📘 Added subject ${subjectId}`);
      }

      // Insert into iit_course_type_of_tests
      for (const typeId of selectedTypes) {
        await conn.query(
          `INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)`,
          [courseCreationId, typeId]
        );
        console.log(`🧪 Added test type ${typeId}`);
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








module.exports = router;
