const express = require("express");
const db = require("../config/database.js");
// Assuming you have a separate email.js function
const router = express.Router();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_FOR_FETCHING;
const containerName = process.env.AZURE_CONTAINER_NAME;
const CourseCardImagesFolderName = process.env.AZURE_COURSECARDS_FOLDER;
const BackendBASE_URL = process.env.BASE_URL;
// Helper to return proxy URL instead of exposing SAS token
const getImageUrl = (fileName) => {
  if (!fileName) return null;

  const cleanFileName = fileName.split('-').slice(1).join('-');
  console.log("✅ Cleaned File Name:", cleanFileName); 
  return cleanFileName;
};

// ✅ Route to serve the actual course card image securely (proxy)
// router.get("/CourseImage/:fileName", async (req, res) => {
//   const { fileName } = req.params;

//   if (!fileName) return res.status(400).send("File name is required");

//   const imageUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${CourseCardImagesFolderName}/${fileName}?${sasToken}`;

//   try {
//     const response = await fetch(imageUrl);
//     if (!response.ok) {
//       return res
//         .status(response.status)
//         .send("Failed to fetch image from Azure");
//     }

//     res.setHeader("Content-Type", response.headers.get("Content-Type"));
//     response.body.pipe(res); // Stream the image directly
//   } catch (error) {
//     console.error("Error fetching image from Azure Blob:", error);
//     res.status(500).send("Error fetching image");
//   }
// });

// Endpoint to get purchased courses
router.get("/Purchasedcourses/:studentregisterationid", async (req, res) => {
  const { studentregisterationid } = req.params;
  // console.log("Received request for purchased courses:", {
  //   studentregisterationid,
  // });

  let connection;

  try {
    connection = await db.getConnection();

    // SQL query to fetch purchased courses
    const [rows] = await connection.query(
      // `
      //       SELECT
      //           cct.course_creation_id,
      //           cct.course_name,
      //           cct.exam_id,
      //           e.exam_name,
      //           p.portal_id,
      //           p.portal_name,
      //           cct.card_image
      //       FROM
      //           iit_course_creation_table cct
      //       LEFT JOIN iit_exams e ON cct.exam_id = e.exam_id
      //       LEFT JOIN iit_portal p ON cct.portal_id = p.portal_id
      //       LEFT JOIN iit_student_buy_courses student ON cct.course_creation_id = student.course_creation_id
      //       WHERE student.student_registration_id = ? 
      //           AND cct.active_course = "active"
      //           AND EXISTS (
      //               SELECT 1
      //               FROM iit_student_registration sr
      //               WHERE sr.student_registration_id = ?
      //           )`,
      `SELECT
                cct.course_creation_id,
                cct.course_name,
                cct.exam_id,
                e.exam_name,
                p.portal_id,
                p.portal_name,
                cct.card_image
            FROM
                iit_course_creation_table cct
            LEFT JOIN iit_exams e ON cct.exam_id = e.exam_id
            LEFT JOIN iit_portal p ON cct.portal_id = p.portal_id
            LEFT JOIN iit_student_buy_courses student ON cct.course_creation_id = student.course_creation_id
            WHERE student.student_registration_id = ? 
                AND cct.active_course = "active"
                AND EXISTS (
                    SELECT 1
                    FROM iit_student_registration sr
                    WHERE sr.student_registration_id = ?
                     AND sr.student_activation = 1
                )`,
      [studentregisterationid, studentregisterationid]
    );

    // ✅ Return 200 OK with empty array if no courses found
    if (rows.length === 0) {
      // console.log("No purchased courses found for this student.");
      return res.status(200).json([]);
    }
    // console.log("Purchased courses found:", rows);

    // Structure courses by portal and exam
    const coursesByPortalAndExam = {};

    rows.forEach((course) => {
      // Initialize portal and exam if not present
      if (!coursesByPortalAndExam[course.portal_id]) {
        coursesByPortalAndExam[course.portal_id] = {
          portal_id: course.portal_id,
          portal_name: course.portal_name,
          exams: {},
        };
      }

      if (!coursesByPortalAndExam[course.portal_id].exams[course.exam_id]) {
        coursesByPortalAndExam[course.portal_id].exams[course.exam_id] = {
          exam_id: course.exam_id,
          exam_name: course.exam_name,
          courses: [],
        };
      }

      // Add course details under correct portal and exam
      coursesByPortalAndExam[course.portal_id].exams[
        course.exam_id
      ].courses.push({
        course_creation_id: course.course_creation_id,
        course_name: course.course_name,
        card_image: course.card_image,
      });
    });

    // Return structured courses
    const structuredCourses = Object.values(coursesByPortalAndExam);
    res.status(200).json(structuredCourses);
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

router.get(
  "/coursetestdetails/:course_creation_id/:student_registration_id",
  async (req, res) => {
    const { course_creation_id, student_registration_id } = req.params;
    // console.log("Received request for course test details:", {
    //   course_creation_id,
    // });
    if (!course_creation_id) {
      return res
        .status(400)
        .json({ message: "Course creation ID is required" });
    }
    let connection;

    try {
      connection = await db.getConnection();

      const [rows] = await connection.query(
        `SELECT
                tct.test_creation_table_id,
                tct.test_name,
                tct.course_type_of_test_id,
                tct.total_marks,
                tct.duration,
                tct.course_creation_id,
                tsd.test_attempt_status,
                cct.course_name,
                 tct.status,
                tot.type_of_test_name
            FROM iit_test_creation_table tct
            LEFT JOIN iit_course_creation_table cct ON tct.course_creation_id = cct.course_creation_id
            LEFT JOIN iit_type_of_test tot ON tct.course_type_of_test_id = tot.type_of_test_id
            JOIN iit_student_buy_courses sbc ON sbc.course_creation_id = cct.course_creation_id
            LEFT JOIN iit_test_status_details tsd 
                ON tsd.test_creation_table_id = tct.test_creation_table_id 
                AND tsd.student_registration_id = sbc.student_registration_id
            WHERE tct.course_creation_id = ?
            AND tct.test_creation_table_id IN (
                SELECT test_creation_table_id 
                FROM iit_test_creation_table 
                WHERE course_creation_id = cct.course_creation_id 
                AND course_type_of_test_id = tot.type_of_test_id
            )
            AND sbc.student_registration_id = ?
            ORDER BY tct.test_creation_table_id ASC;
            `,
        [course_creation_id, student_registration_id] // Pass both parameters here
      );

      if (rows.length === 0) {
        // console.log("No test details found for this course.");
        return res.status(404).json({ message: "No test details found" });
      }

      // console.log("Test details found:", rows);
      // res.status(200).json(rows);
      if (rows.length === 0) {
        // console.log("No test details found for this course.");
        return res.status(404).json({ message: "No test details found" });
      }

      // Grouping the result into a course object with test details
      // const courseDetails = {
      //   course_creation_id: rows[0].course_creation_id,
      //   course_name: rows[0].course_name,
      //   test_details: {
      //     course_type_of_test_id: rows[0].course_type_of_test_id, // Assuming all tests have the same course_type_of_test_id
      //     type_of_test_name: rows[0].type_of_test_name, // Assuming all tests have the same type_of_test_name
      //     tests: rows.map((row) => ({
      //       test_creation_table_id: row.test_creation_table_id,
      //       test_attempt_status: row.test_attempt_status,
      //       test_name: row.test_name,
      //       total_marks: row.total_marks,
      //       duration: row.duration,
      //       status:row.status,
      //     })),
      //   },
      // };
// Group test details by course_type_of_test_id and type_of_test_name
const groupedTests = {};

rows.forEach((row) => {
  const key = `${row.course_type_of_test_id}-${row.type_of_test_name}`;

  if (!groupedTests[key]) {
    groupedTests[key] = {
      course_type_of_test_id: row.course_type_of_test_id,
      type_of_test_name: row.type_of_test_name,
      tests: [],
    };
  }

  groupedTests[key].tests.push({
    test_creation_table_id: row.test_creation_table_id,
    test_attempt_status: row.test_attempt_status,
    test_name: row.test_name,
    total_marks: row.total_marks,
    duration: row.duration,
    status: row.status,
  });
});

const courseDetails = {
  course_creation_id: rows[0].course_creation_id,
  course_name: rows[0].course_name,
  test_details: Object.values(groupedTests), // Convert grouped tests to array
};

      // console.log("Test details grouped:", courseDetails);
      res.status(200).json(courseDetails);
    } catch (error) {
      console.error("Error fetching test details:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  }
);
router.post("/InsertOrUpdateTestAttemptStatus", async (req, res) => {
  const {
    studentregistrationId,
    courseCreationId,
    testCreationTableId,
    studentTestStartTime,
    testAttemptStatus,
    testConnectionStatus,
    testConnectionTime,
  } = req.body;

  let connection;

  try {
    connection = await db.getConnection();
    // console.log("Student start test data", req.body);

    // Check if record already exists
    const [existing] = await connection.query(
      `SELECT student_registration_id,course_creation_id,test_creation_table_id FROM iit_test_status_details 
         WHERE student_registration_id = ? 
         AND course_creation_id = ? 
         AND test_creation_table_id = ?`,
      [studentregistrationId, courseCreationId, testCreationTableId]
    );

    if (existing.length > 0) {
      // Update existing record
      const updateQuery = `
          UPDATE iit_test_status_details 
          SET student_test_start_date_time = ?, 
              test_attempt_status = ?, 
              test_connection_status = ?, 
              student_test_end_date_time = ? 
          WHERE student_registration_id = ? 
            AND course_creation_id = ? 
            AND test_creation_table_id = ?`;

      await connection.query(updateQuery, [
        studentTestStartTime,
        testAttemptStatus,
        testConnectionStatus,
        testConnectionTime,
        studentregistrationId,
        courseCreationId,
        testCreationTableId,
      ]);

      res.status(200).json({ message: "Test status updated successfully." });
    } else {
      // Insert new record
      const insertQuery = `
          INSERT INTO iit_test_status_details 
          (student_registration_id, course_creation_id, test_creation_table_id, student_test_start_date_time, test_attempt_status, test_connection_status, student_test_end_date_time) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await connection.query(insertQuery, [
        studentregistrationId,
        courseCreationId,
        testCreationTableId,
        studentTestStartTime,
        testAttemptStatus,
        testConnectionStatus,
        testConnectionTime,
      ]);

      res.status(200).json({ message: "Test status inserted successfully." });
    }
  } catch (error) {
    console.error("Error in test_status_details API:", error);
    res.status(500).json({ error: "Failed to process test status details." });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/CheckActiveTestOfStudent/:studentRegistrationId', async (req, res) => {
 
  const { studentRegistrationId } = req.params; // Retrieve from req.params
  console.log("studentRegistrationId", studentRegistrationId); // This should log the studentRegistrationId from the URL
 
  if (!studentRegistrationId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
 
  const testAttemptStatus = "started";
  const testConnectionStatus = "active";
 
  try {
    // SQL query to check if there is an active test for the student
    const query = `
      SELECT COUNT(*) AS activeTestCount
      FROM iit_test_status_details
      WHERE student_registration_id = ?
        AND (test_attempt_status = ? AND test_connection_status = ?)
    `;
   
    // Execute the query
    const [rows] = await db.execute(query, [studentRegistrationId, testAttemptStatus, testConnectionStatus]);
   
    // If count > 0, there is an active test
    const activeTestExists = rows[0].activeTestCount > 0;
   
    // Send response
    return res.json({ activeTestExists });
   
  } catch (error) {
    console.error('Error checking active test:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get("/instructions/:test_creation_table_id", async (req, res) => {
  const { test_creation_table_id } = req.params;
  // console.log("Received request for instructions:", { test_creation_table_id });
  if (!test_creation_table_id) {
    return res.status(400).json({ message: "Test creation ID is required" });
  }
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `SELECT tc.test_creation_table_id,i.instruction_id,i.exam_id,
e.exam_name,i.instruction_heading,
i.document_name,i.instruction_img,
ip.instruction_point
 FROM iit_test_creation_table tc
 LEFT JOIN  iit_instructions i ON tc.instruction_id = i.instruction_id
 LEFT JOIN iit_instruction_points ip ON i.instruction_id=ip.instruction_id
 LEFT JOIN  iit_exams e ON i.exam_id= e.exam_id
 WHERE tc.test_creation_table_id= ?;`, // Ensure the query is properly formatted here.
      [test_creation_table_id] // Pass the parameter as an array to the query function
    );

    if (rows.length === 0) {
      // console.log("No instructions found for this test.");
      return res.status(404).json({ message: "No instructions found" });
    }

    // res.status(200).json(rows);
    const instructionMap = new Map();

    rows.forEach((row) => {
      if (!instructionMap.has(row.instruction_id)) {
        instructionMap.set(row.instruction_id, {
          test_creation_table_id: row.test_creation_table_id,
          instruction_id: row.instruction_id,
          exam_id: row.exam_id,
          exam_name: row.exam_name,
          instruction_heading: row.instruction_heading,
          document_name: row.document_name,
          instruction_img: row.instruction_img,
          instruction_points: [],
        });
      }

      // Push the instruction point if it's not null
      if (row.instruction_point) {
        instructionMap
          .get(row.instruction_id)
          .instruction_points.push(row.instruction_point);
      }
    });

    const groupedInstructions = Array.from(instructionMap.values());

    res.status(200).json(groupedInstructions);
  } catch (error) {
    console.error("Error fetching instruction details:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
