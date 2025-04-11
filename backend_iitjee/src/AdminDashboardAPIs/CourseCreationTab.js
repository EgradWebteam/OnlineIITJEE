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
async function deleteOldImageFromAzure(oldImageUrl) {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(oldImageUrl);

  try {
    await blockBlobClient.deleteIfExists();
    console.log(`Old image deleted: ${oldImageUrl}`);
  } catch (err) {
    console.error(`Error deleting old image from Azure: ${err.message}`);
  }
}
router.put(
  "/UpdateCourse/:courseId",
  upload.single("courseImageFile"), // Handle image file upload
  async (req, res) => {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const { courseId } = req.params;
      const {
        courseName,
        selectedYear,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
        selectedExamId,
        courseImageFile
      } = req.body;

      console.log(`Received request to update course with ID: ${courseId}`);

      // Function to parse input arrays (subjects and test types)
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

      console.log("Parsed selected subjects:", selectedSubjects);
      console.log("Parsed selected test types:", selectedTypes);

      // Step 1: Fetch the current course details from the database
      console.log("Fetching current course data from the database...");
      const [existingCourse] = await conn.query(
        "SELECT card_image FROM iit_course_creation_table WHERE course_creation_id = ?",
        [courseId]
      );

      if (!existingCourse.length) {
        console.log("Course not found in the database.");
        return res.status(404).json({ success: false, message: "Course not found" });
      }

      console.log("Course found:", existingCourse[0]);
      const currentImageUrl = existingCourse[0].card_image; // Existing image URL in the database

      let azureFileName = currentImageUrl; // Default to current image from DB

      // Step 2: Check if a new image is uploaded
      if (req.file) {
        // If a new image is uploaded from the frontend
        console.log("New image uploaded. Processing upload...");

        const frontendBaseURL = "http://localhost:5173"; // Replace with actual frontend base URL
        const imageUrl = `${frontendBaseURL}/OtsCourseCardImages/${req.file.originalname}`;

        console.log("Uploading new image to Azure:", imageUrl);
        const newAzureUrl = await uploadToAzureWithSAS(imageUrl);
        azureFileName = newAzureUrl.split("/").pop().split("?")[0]; // Get the file name from the URL

        console.log("New Azure file name:", azureFileName);

        // Step 3: Delete the old image from Azure if the new image is different
        if (courseImageFile !== azureFileName) {
          console.log(`Old image detected. Deleting old image from Azure: ${currentImageUrl}`);
          await deleteOldImageFromAzure(currentImageUrl);
        } else {
          console.log("New image is the same as the current image. No need to delete the old image.");
        }
      } else {
        console.log("No new image uploaded. Retaining existing image.");
      }

      // Step 4: Update course data in the database with the new or existing image
      console.log("Updating course data in the database...");
      const updateCourseQuery = `
        UPDATE iit_course_creation_table 
        SET 
          course_name = ?, 
          course_year = ?, 
          exam_id = ?, 
          course_start_date = ?, 
          course_end_date = ?, 
          cost = ?, 
          discount = ?, 
          total_price = ?, 
          card_image = ? 
        WHERE course_creation_id = ?
      `;

      const updateCourseValues = [
        courseName,
        selectedYear,
        selectedExamId,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
        azureFileName, // Updated or retained image file name
        courseId,
      ];

      await conn.query(updateCourseQuery, updateCourseValues);
      console.log("Course updated successfully in the database.");

      // Step 5: Update related subjects and test types
      console.log("Updating related subjects and test types...");
      await conn.query("DELETE FROM iit_course_subjects WHERE course_creation_id = ?", [courseId]);
      await conn.query("DELETE FROM iit_course_type_of_tests WHERE course_creation_id = ?", [courseId]);

      console.log("Deleted old related subjects and test types.");

      // Re-insert selected subjects
      for (const subjectId of selectedSubjects) {
        await conn.query(
          "INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)",
          [courseId, subjectId]
        );
        console.log(`Added subject with ID: ${subjectId}`);
      }

      // Re-insert selected test types
      for (const typeId of selectedTypes) {
        await conn.query(
          "INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)",
          [courseId, typeId]
        );
        console.log(`Added test type with ID: ${typeId}`);
      }

      // Commit the transaction
      console.log("Committing the transaction...");
      await conn.commit();

      console.log("🎉 Course Updated Successfully!");
      res.status(200).json({ success: true, message: "Course Updated Successfully" });
    } catch (err) {
      console.error("Error in course update:", err.message);
      await conn.rollback();
      res.status(500).json({ success: false, error: err.message });
    } finally {
      conn.release();
    }
  }
);


// Function to delete old image from Azure
async function deleteOldImageFromAzure(oldImageUrl) {
  console.log("Preparing to delete old image from Azure:", oldImageUrl);

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = oldImageUrl.split("/").pop().split("?")[0]; // Extract the blob name from URL

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    console.log(`Deleting old image: ${blobName}`);
    await blockBlobClient.delete();
    console.log(`Old image deleted successfully: ${blobName}`);
  } catch (err) {
    console.error("Error deleting old image from Azure:", err.message);
  }
}


async function deleteOldImageFromAzure(oldImageUrl) {
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = oldImageUrl.split("/").pop().split("?")[0]; // Extract the blob name from URL

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.delete();
    console.log(`Deleted old image: ${blobName}`);
  } catch (err) {
    console.error("Error deleting old image from Azure:", err.message);
  }
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
router.get("/GetAllCourses", async (req, res) => {
  const conn = await db.getConnection();
  
  try {
    // Start a database transaction (if necessary, but can be skipped for a read-only query)
    await conn.beginTransaction();

    // Query to get all courses with related subjects and test types
    const query = `
    SELECT 
    c.course_creation_id,
    c.course_name,
    c.course_year,
    c.exam_id,
    c.course_start_date,
    c.course_end_date,
    c.cost,
    c.discount,
    c.total_price,
    c.portal_id,
    c.active_course,
    c.card_image,
    GROUP_CONCAT(DISTINCT s.subject_id) AS subject_ids, 
    GROUP_CONCAT(DISTINCT c.exam_id) AS exam_ids
FROM iit_db.iit_course_creation_table c
LEFT JOIN iit_db.iit_course_subjects cs ON cs.course_creation_id = c.course_creation_id
LEFT JOIN iit_db.iit_subjects s ON s.subject_id = cs.subject_id
GROUP BY c.course_creation_id;
    `;

    // Run the query
    const [courses] = await conn.query(query);

    // Commit transaction (not really necessary for a read-only query)
    await conn.commit();

    // If courses exist, send the data back
    if (courses.length > 0) {
      res.status(200).json({
        success: true,
        data: courses,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No courses found.",
      });
    }
  } catch (err) {
    // In case of error, rollback the transaction (again, not necessary for a read-only query)
    await conn.rollback();
    console.error("❌ Error in GetAllCourses:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Release the connection
    conn.release();
  }
});








module.exports = router;
