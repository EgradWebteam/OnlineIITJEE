const express = require("express");
const router = express.Router(); // ✅ MUST include this!
const db = require("../config/database.js"); // Adjust path if needed
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/CourseCreationFormData", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [examsResult, typesResult] = await Promise.all([
      connection.query("SELECT exam_id, exam_name FROM iit_exams"),
      connection.query(
        "SELECT type_of_test_id, type_of_test_name FROM iit_type_of_test"
      ),
    ]);

    const [exams] = examsResult;
    const [types] = typesResult;

    res.json({ exams, types });
  } catch (err) {
    console.error("Error fetching IIT data:", err);
    res.status(500).json({ error: "Failed to fetch IIT data" });
  } finally {
    if (connection) connection.release();
  }
});
router.get("/OrvlExamsTypesofCourses", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [examsResult, coursetypesResult] = await Promise.all([
      connection.query("SELECT exam_id, exam_name FROM iit_exams"),
      connection.query(
        "SELECT orvl_course_type_id, orvl_course_type_name FROM iit_orvl_course_types"
      ),
    ]);

    const [exams] = examsResult;
    const [coursetypes] = coursetypesResult;

    res.json({ exams, coursetypes });
  } catch (err) {
    console.error("Error fetching IIT data:", err);
    res.status(500).json({ error: "Failed to fetch IIT data" });
  } finally {
    if (connection) connection.release();
  }
});

// GET subjects by exam_id
router.get("/ExamSubjects/:examId", async (req, res) => {
  const { examId } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const [subjects] = await connection.query(
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
  } finally {
    if (connection) connection.release();
  }
});
// router.post(
//   "/CreateCourse",
//   upload.single("courseImageFile"),
//   async (req, res) => {
//     const conn = await db.getConnection();
//     await conn.beginTransaction();

//     try {
//       const {
//         courseName,
//         selectedYear,
//         courseStartDate,
//         courseEndDate,
//         cost,
//         discount,
//         totalPrice,
//         selectedExamId,
//         courseImageFile,
//         portal_id, // Extract portal_id from request body
//       } = req.body;

//       const parseInputArray = (input) => {
//         if (!input) return [];
//         if (Array.isArray(input)) return input.map(Number);
//         try {
//           const parsed = JSON.parse(input);
//           return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
//         } catch {
//           return String(input).split(",").map(Number);
//         }
//       };

//       const selectedSubjects = parseInputArray(req.body.selectedSubjects);
//       const selectedTypes = parseInputArray(req.body.selectedTestTypes);

//       const OriginalFileName = req.file.originalname;
//       let imageUrl = "";
//       if (req.file) {
//         const frontendBaseURL = "http://localhost:5173"; 
//         imageUrl = `${frontendBaseURL}/OtsCourseCardImages/${req.file.originalname}`;
//       }

//       let azureUrl = "";
//       let azureFileName = "";
//       if (req.file) {
//         azureUrl = await uploadToAzureWithSAS(req.file, OriginalFileName); 
//         azureFileName = azureUrl.split("/").pop().split("?")[0]; 
//       }

//       const activeCourseStatus = "inactive"; // Set the initial course status to inactive

//       // Insert course data into iit_course_creation_table
//       const insertCourseQuery = `
//         INSERT INTO iit_course_creation_table 
//         (course_name, course_year, exam_id, course_start_date, course_end_date, cost, discount, total_price, portal_id, active_course, card_image) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       const courseValues = [
//         courseName,
//         selectedYear,
//         selectedExamId,
//         courseStartDate,
//         courseEndDate,
//         cost,
//         discount,
//         totalPrice,
//         portal_id, // Use the portal_id from request body
//         activeCourseStatus,
//         azureFileName,
//       ];

//       const [courseResult] = await conn.query(insertCourseQuery, courseValues);
//       const courseCreationId = courseResult.insertId;

//       // Insert into iit_course_subjects table
//       for (const subjectId of selectedSubjects) {
//         await conn.query(
//           `INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)`,
//           [courseCreationId, subjectId]
//         );
//       }

//       // Conditional insertion based on portal_id
//       if (portal_id ==1) {
//         // Insert into iit_course_type_of_tests table if portal_id is 1
//         for (const typeId of selectedTypes) {
//           await conn.query(
//             `INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)`,
//             [courseCreationId, typeId]
//           );
//         }
//       } else if (portal_id ==3) {
//         // Insert into iit_orvl_course_type_for_course table if portal_id is 3
//         for (const typeId of selectedTypes) {
//           await conn.query(
//             `INSERT INTO iit_orvl_course_type_for_course (course_creation_id, orvl_course_type_id) VALUES (?, ?)`,
//             [courseCreationId, typeId]
//           );
//         }
//       }

//       await conn.commit();

//       res.status(200).json({ success: true, message: "Course Created Successfully" });
//     } catch (err) {
//       await conn.rollback();
//       console.error("❌ Error in submitForm:", err);
//       res.status(500).json({ success: false, error: err.message });
//     } finally {
//       conn.release();
//     }
//   }
// );

// ENV VARIABLES (can also use dotenv)
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_UPLOADS;
const containerName = process.env.CONTAINER_NAME;
const STUDENT_PHOTO_FOLDER = "cards";

async function uploadToAzureWithSAS(fileBuffer, OriginalFileName) {
  // console.log("OriginalFileName", OriginalFileName);
  // Use the file buffer directly without needing to fetch it from a URL
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique blob name using the current timestamp and the image file name
  const timestamp = Date.now();
  const blobName = `${STUDENT_PHOTO_FOLDER}/${timestamp}-${OriginalFileName}`;

  // console.log("File name for Azure storage:", blobName); // Log the file name for Azure

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload the image to Azure using the buffer
  const uploadBlobResponse = await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: "image/png" }, // Assuming it's PNG; adjust as necessary
  });

  // console.log("uploadBlobResponse", uploadBlobResponse);
  // console.log("✅ Uploaded to Azure:", blockBlobClient.url);

  // Return the Azure URL of the uploaded image
  return blockBlobClient.url;
}
async function deleteFromAzure(imageName) {
  if (!imageName) {
    // console.log("⚠️ No image name provided to deleteFromAzure()");
    return;
  }

  // console.log("🧹 Calling deleteFromAzure() with:", imageName);

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(
    `${STUDENT_PHOTO_FOLDER}/${imageName}`
  );

  const response = await blobClient.deleteIfExists();
  // console.log("🗑️ deleteIfExists response:", response);
}
router.post("/CreateCourse",upload.none(), async (req, res) => {
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
      portal_id,
      selectedSubjects,
      selectedTestTypes,
      // courseImageFile // <- added this
    } = req.body;

    // Helper to parse array-like input
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

    const parsedSubjects = parseInputArray(selectedSubjects);
    const parsedTestTypes = parseInputArray(selectedTestTypes);
    const activeCourseStatus = "inactive";

    // 🔧 Include courseImageFile in the insert query
    const insertCourseQuery = `
      INSERT INTO iit_course_creation_table 
      (course_name, course_year, exam_id, course_start_date, course_end_date, cost, discount, total_price, portal_id, active_course) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
      // courseImageFile || null, // use NULL if not provided
    ];

    const [courseResult] = await conn.query(insertCourseQuery, courseValues);
    const courseCreationId = courseResult.insertId;

    // Insert selected subjects
    for (const subjectId of parsedSubjects) {
      await conn.query(
        `INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)`,
        [courseCreationId, subjectId]
      );
    }

    // Insert test types based on portal_id
    if (portal_id === 1) {
      for (const typeId of parsedTestTypes) {
        await conn.query(
          `INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)`,
          [courseCreationId, typeId]
        );
      }
    } else if (portal_id === 3) {
      for (const typeId of parsedTestTypes) {
        await conn.query(
          `INSERT INTO iit_orvl_course_type_for_course (course_creation_id, orvl_course_type_id) VALUES (?, ?)`,
          [courseCreationId, typeId]
        );
      }
    }

    await conn.commit();
    res.status(200).json({ success: true, message: "Course Created Successfully" });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Error in CreateCourse:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});




router.put(
  "/UpdateCourse/:courseId",
  upload.single("courseImageFile"),
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
      const selectedTypes = parseInputArray(req.body.selectedTestTypes);

      // console.log("📥 Incoming Update Data:", {
      //   courseId,
      //   courseName,
      //   selectedYear,
      //   courseStartDate,
      //   courseEndDate,
      //   cost,
      //   discount,
      //   totalPrice,
      //   selectedExamId,
      //   selectedSubjects,
      //   selectedTypes,
      //   hasNewImage: !!req.file,
      // });

      let newAzureFileName = null;

      // ✅ If a new image was uploaded, delete the old one and upload the new one
      if (req.file) {
        // console.log("🖼️ New image uploaded. Preparing to delete old image...");

        const [oldImageResult] = await conn.query(
          "SELECT card_image FROM iit_course_creation_table WHERE course_creation_id = ?",
          [courseId]
        );

        const oldImageName = oldImageResult[0]?.card_image;
        // console.log("🔍 Found old image in DB:", oldImageName);

        if (oldImageName) {
          await deleteFromAzure(oldImageName);
          // console.log("🗑️ Deleted old image from Azure:", oldImageName);
        }

        const azureUrl = await uploadToAzureWithSAS(
          req.file,
          req.file.originalname
        );
        newAzureFileName = azureUrl.split("/").pop().split("?")[0];
        // console.log("📤 Uploaded new image to Azure:", newAzureFileName);
      }

      // 🔄 Update course details in DB
      // console.log("🛠️ Updating course details in DB...");
      const updateQuery = `
      UPDATE iit_course_creation_table SET
        course_name = ?, 
        course_year = ?, 
        exam_id = ?, 
        course_start_date = ?, 
        course_end_date = ?, 
        cost = ?, 
        discount = ?, 
        total_price = ?
        ${newAzureFileName ? ", card_image = ?" : ""}
      WHERE course_creation_id = ?
    `;

      const values = [
        courseName,
        selectedYear,
        selectedExamId,
        courseStartDate,
        courseEndDate,
        cost,
        discount,
        totalPrice,
      ];
      if (newAzureFileName) values.push(newAzureFileName);
      values.push(courseId);

      await conn.query(updateQuery, values);
      // console.log("✅ Course updated successfully.");

      // 🧹 Remove old subject and type mappings
      // console.log("🧹 Cleaning up old subject and type mappings...");
      await conn.query(
        "DELETE FROM iit_course_subjects WHERE course_creation_id = ?",
        [courseId]
      );
      await conn.query(
        "DELETE FROM iit_course_type_of_tests WHERE course_creation_id = ?",
        [courseId]
      );
      await conn.query(
        "DELETE FROM iit_orvl_course_type_for_course WHERE course_creation_id = ?",
        [courseId]
      );

      // ➕ Re-insert new subject mappings
      // console.log("➕ Inserting new subject mappings...");
      for (const subjectId of selectedSubjects) {
        await conn.query(
          "INSERT INTO iit_course_subjects (course_creation_id, subject_id) VALUES (?, ?)",
          [courseId, subjectId]
        );
        // console.log(`   ✅ Subject ${subjectId} linked to course`);
      }

      // ➕ Re-insert new test types (both normal and ORVL)
      // console.log("➕ Inserting new test types...");
      for (const typeId of selectedTypes) {
        await conn.query(
          "INSERT INTO iit_course_type_of_tests (course_creation_id, type_of_test_id) VALUES (?, ?)",
          [courseId, typeId]
        );
        // console.log(`   ✅ Test Type ${typeId} (normal) linked to course`);

        await conn.query(
          "INSERT INTO iit_orvl_course_type_for_course (course_creation_id, orvl_course_type_id) VALUES (?, ?)",
          [courseId, typeId]
        );
        // console.log(`   ✅ Test Type ${typeId} (ORVL) linked to course`);
      }

      await conn.commit();
      // console.log("🎉 Course update committed successfully.");
      res
        .status(200)
        .json({ success: true, message: "✅ Course updated successfully." });
    } catch (err) {
      console.error("❌ Error during course update:", err.message);
      await conn.rollback();
      res.status(500).json({ success: false, error: err.message });
    } finally {
      conn.release();
    }
  }
);

router.delete("/delete/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // console.log(`🔄 Attempting to delete course with ID: ${courseId}`);

    // Step 1: Get course image before deleting
    const [imageResult] = await conn.query(
      "SELECT card_image FROM iit_course_creation_table WHERE course_creation_id = ?",
      [courseId]
    );
    const oldImageUrl = imageResult[0]?.card_image;

    // Step 2: Delete child data
    // console.log("🧹 Deleting related subjects...");
    await conn.query(
      "DELETE FROM iit_course_subjects WHERE course_creation_id = ?",
      [courseId]
    );

    // console.log("🧹 Deleting related test types...");
    await conn.query(
      "DELETE FROM iit_course_type_of_tests WHERE course_creation_id = ?",
      [courseId]
    );

    // console.log("🧹 Deleting related ORVL test types...");
    await conn.query(
      "DELETE FROM iit_orvl_course_type_for_course WHERE course_creation_id = ?",
      [courseId]
    );

    // Step 3: Delete the image from Azure
    if (oldImageUrl) {
      const imageName = oldImageUrl.split("/").pop().split("?")[0]; // Extract name from URL
      // console.log(`🧽 Attempting to delete image from Azure: ${imageName}`);

      try {
        await deleteFromAzure(imageName);
        // console.log("✅ Image deleted from Azure successfully.");
      } catch (azureErr) {
        console.warn("⚠️ Failed to delete image from Azure:", azureErr.message);
      }
    } else {
      // console.log("ℹ️ No image found for course, skipping Azure deletion.");
    }

    // Step 4: Delete course record
    // console.log("🗑️ Deleting main course entry...");
    await conn.query(
      "DELETE FROM iit_course_creation_table WHERE course_creation_id = ?",
      [courseId]
    );

    await conn.commit();
    // console.log("✅ Course and all related data deleted successfully.");

    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting course:", error.message);
    await conn.rollback();
    res.status(500).json({ success: false, error: "Failed to delete course." });
  } finally {
    conn.release();
  }
});

router.get("/GetAllCourses/:portalid", async (req, res) => {
  const { portalid } = req.params; 
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    let query = ` 
    SELECT 
      c.course_creation_id,
      c.course_name,
      c.course_year,
      c.exam_id,  -- Direct selection since it's from the main table
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
    `;
    
        // Add test and course types for portal_id 1 and 3 respectively
        if (portalid === '1') {
          query += `,
            GROUP_CONCAT(DISTINCT t.type_of_test_id) AS test_type_ids,
            GROUP_CONCAT(DISTINCT tt.type_of_test_name) AS test_type_names
          `;
        } else if (portalid === '3') {
          query += `,
            GROUP_CONCAT(DISTINCT ot.orvl_course_type_id) AS course_type_ids,
            GROUP_CONCAT(DISTINCT otc.orvl_course_type_name) AS course_type_names
          `;
        }
    
        query += ` FROM iit_course_creation_table c
        LEFT JOIN iit_course_subjects cs ON cs.course_creation_id = c.course_creation_id
        LEFT JOIN iit_subjects s ON s.subject_id = cs.subject_id
        LEFT JOIN iit_course_type_of_tests t ON t.course_creation_id = c.course_creation_id
        LEFT JOIN iit_type_of_test tt ON tt.type_of_test_id = t.type_of_test_id
        LEFT JOIN iit_orvl_course_type_for_course ot ON ot.course_creation_id = c.course_creation_id
        LEFT JOIN iit_orvl_course_types otc ON otc.orvl_course_type_id = ot.orvl_course_type_id
        WHERE c.portal_id = ?  -- This filter will ensure only matching portal_id courses are fetched
        GROUP BY c.course_creation_id;`;

    

    // Run the query
    const [courses] = await conn.query(query,[portalid]);

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
router.post("/toggleCourseStatus", async (req, res) => {
  const { courseCreationTableId } = req.body; // Get the course ID from request body

  if (!courseCreationTableId) {
    return res
      .status(400)
      .json({ success: false, message: "Course ID is required" });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Get the current activation status of the course
    const [currentCourse] = await conn.query(
      "SELECT active_course FROM iit_course_creation_table WHERE course_creation_id = ?",
      [courseCreationTableId]
    );

    if (currentCourse.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const currentStatus = currentCourse[0].active_course;
    const newStatus = currentStatus === "active" ? "inactive" : "active"; // Toggle the status

    // Update the course's activation status
    await conn.query(
      "UPDATE iit_course_creation_table SET active_course = ? WHERE course_creation_id = ?",
      [newStatus, courseCreationTableId]
    );

    await conn.commit();

    res.status(200).json({
      success: true,
      message: `Course status updated to ${newStatus}`,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Error toggling course status:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
