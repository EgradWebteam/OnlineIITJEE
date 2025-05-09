const express = require("express");
const db = require("../config/database.js");
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const bcryptjs = require("bcryptjs");
const router = express.Router();
const sendMail = require("../utils/email"); // Import the sendMail function
// Assuming you have a separate email.js function
const generatePassword = (length = 12) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    return password;
  };
  async function uploadToAzureWithSAS(file) {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.AZURE_SAS_TOKEN_UPLOADS;
    const containerName = process.env.AZURE_CONTAINER_NAME;
    const STUDENT_PHOTO_FOLDER = "student-data/"; // ← folder path with trailing slash
  
    // 1. Clean original filename (optional)
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_"); // replaces spaces with _
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;      // generates a unique name
    const blobName = `${STUDENT_PHOTO_FOLDER}${uniqueFilename}`;      // full path to blob
  
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    try {
      const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
  
      const fileUrl = blockBlobClient.url;
  
    //   console.log(`✅ File saved at: ${fileUrl}`);
    //   console.log(
    //     `Upload block blob ${file.originalname} successfully`,
    //     uploadBlobResponse.requestId
    //   );
  
      // 2. Return only the unique filename for DB and full URL optionally
      return {
        fileUrl,
        uniqueName: uniqueFilename,
      };
    } catch (error) {
      console.error("❌ Error uploading to Azure:", error);
      throw error;
    }
  }

  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_FOR_FETCHING;
const containerName = process.env.AZURE_CONTAINER_NAME;
const CourseCardImagesFolderName = process.env.AZURE_COURSECARDS_FOLDER;  
const BackendBASE_URL = process.env.BASE_URL;
const frontEndURL=process.env.frontEndURL;

// Helper to return proxy URL instead of exposing SAS token
const getImageUrl = (fileName) => {
    if (!fileName) return null;
  
    const cleanFileName = fileName.split('-').slice(1).join('-');
    console.log("✅ Cleaned File Name:", cleanFileName); // Logs the result
    return cleanFileName;
  };
  
  // ✅ Route to serve the actual course card image securely (proxy)
//   router.get('/CourseImage/:fileName', async (req, res) => {
//     const { fileName } = req.params;
  
//     if (!fileName) return res.status(400).send("File name is required");
  
//     const imageUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${CourseCardImagesFolderName}/${fileName}?${sasToken}`;
  
//     try {
//       const response = await fetch(imageUrl);
//       if (!response.ok) {
//         return res.status(response.status).send("Failed to fetch image from Azure");
//       }
  
//       res.setHeader("Content-Type", response.headers.get("Content-Type"));
//       response.body.pipe(res); // Stream the image directly
//     } catch (error) {
//       console.error("Error fetching image from Azure Blob:", error);
//       res.status(500).send("Error fetching image");
//     }
//   });
  
router.get("/UnPurchasedcourses/:studentregisterationid",async (req,res) => {
    const { studentregisterationid } = req.params;
    // console.log("Received request for unpurchased courses:", { studentregisterationid });
 
    let connection;
 
    try {
        connection = await db.getConnection();
 
        const [rows] = await connection.query(
            `SELECT
    cct.course_creation_id,
    cct.course_name,
    cct.exam_id,
    e.exam_name,
    p.portal_id,
    p.portal_name,
    cct.total_price,
    cct.portal_id,
    cct.card_image
FROM
    iit_course_creation_table cct
LEFT JOIN iit_exams e ON cct.exam_id = e.exam_id
LEFT JOIN iit_portal p ON cct.portal_id = p.portal_id
WHERE
    EXISTS (
        SELECT 1
        FROM iit_student_registration sr
        WHERE sr.student_registration_id = ?
    )
    AND NOT EXISTS (
        SELECT 1
        FROM iit_student_buy_courses student
        WHERE student.student_registration_id = ?
        AND student.course_creation_id = cct.course_creation_id
    )
    AND cct.active_course = 'active'
 
 
 
                `,  // <- Add closing parenthesis here
            [studentregisterationid,studentregisterationid]
        );
       
 
        if (rows.length === 0) {
            // console.log("No unpurchased courses found for this student.");
            return res.status(404).json({ message: "No unpurchased courses found" });
        }
 
        // console.log("Unpurchased courses found:", rows);
        // res.status(200).json(rows);
        const coursesByPortalAndExam = {};
 
        // Loop through the rows and organize the data
        rows.forEach((course) => {
            // Check if portal_id exists in the coursesByPortalAndExam object
            if (!coursesByPortalAndExam[course.portal_id]) {
                coursesByPortalAndExam[course.portal_id] = {
                    portal_id: course.portal_id,
                    portal_name: course.portal_name,
                    exams: {},
                };
            }
       
            // Check if exam_id exists under the portal
            if (!coursesByPortalAndExam[course.portal_id].exams[course.exam_id]) {
                coursesByPortalAndExam[course.portal_id].exams[course.exam_id] = {
                    exam_id: course.exam_id,
                    exam_name: course.exam_name,
                    courses: [],
                };
            }
       
            // Add the course to the correct exam under the correct portal
            coursesByPortalAndExam[course.portal_id].exams[course.exam_id].courses.push({
                course_creation_id: course.course_creation_id,
                course_name: course.course_name,
                total_price: course.total_price,
                card_image: course.card_image,
                total_tests: course.total_tests,
            });
        });
       
        // Convert the structure to an array for easier handling on the frontend
        const structuredCourses = Object.values(coursesByPortalAndExam);
        res.status(200).json(structuredCourses);
        // console.log("Unpurchased courses grouped by portal and exam:", structuredCourses);
    } catch (error) {
        console.error("Error fetching unpurchased courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
})
router.get("/studentpaymentcreation/:studentregisterationid/:coursecreationid", async (req, res) => {
    const { studentregisterationid, coursecreationid } = req.params;
    // console.log("Received request for student payment creation:", { studentregisterationid, coursecreationid });
if(!studentregisterationid || !coursecreationid) {
    // console.log("Missing student registration ID or course creation ID.");
    return res.status(400).json({ message: "Student registration ID and course creation ID are required." });
}
    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            `SELECT
                cct.course_creation_id,
                cct.course_name,
                cct.total_price,
                sr.student_registration_id,
                sr.candidate_name,
                sr.email_id,
                sr.mobile_no
            FROM
                iit_course_creation_table cct,
                iit_student_registration sr
            WHERE
                sr.student_registration_id = ? AND cct.course_creation_id = ?`,
            [studentregisterationid, coursecreationid]
        );

        if (rows.length === 0) {
            // console.log("No courses found for this student and course creation ID.");
            return res.status(404).json({ message: "No courses found for this student and course creation ID" });
        }

        // Extracting the student and course data
        const studentdata = {
            student_registration_id: rows[0].student_registration_id, // Corrected the field name
            candidate_name: rows[0].candidate_name,
            email_id: rows[0].email_id,
            mobile_no: rows[0].mobile_no
        };

        const courseData = {
            course_creation_id: rows[0].course_creation_id,
            course_name: rows[0].course_name,
            total_price: rows[0].total_price
        };

        // Combining both student and course data into a single object
        const responseData = {
            student: studentdata,
            course: courseData
        };

        // Sending the combined response
        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});

router.get("/ActiveCourses/:coursecreationid", async (req, res) => {
    const { coursecreationid } = req.params;
    // console.log("Received request for active course:", { coursecreationid });

    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            `SELECT
                course_creation_id,
                course_name,
                course_end_date,
                course_start_date AS course_duration
            FROM
                iit_course_creation_table
            WHERE
                active_course = "active"
                AND course_creation_id = ?`,
            [coursecreationid]
        );

        if (rows.length === 0) {
            // console.log("No active courses found for this course creation ID.");
            return res.status(404).json({ message: "No active course found for this course creation ID" });
        }

        // console.log("Active course found:", rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching active course:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});
// router.post(
//   "/studentRegistrationBuyCourses",
//   upload.fields([{ name: "uploadedPhoto" }]),
//   async (req, res) => {
//     const form = req.body;
//     const files = req.files;

//     console.log("➡️ Form Data:", form);
//     if (files?.uploadedPhoto) {
//       console.log("📸 Uploaded Photo:", files.uploadedPhoto[0]);
//     } else {
//       console.log("🚫 No photo uploaded.");
//     }

//     try {
//       const autoGeneratedPassword = generatePassword();
//       console.log("🔐 Auto-generated Password:", autoGeneratedPassword);

//       const hashedPasswordPromise = bcrypt.hash(autoGeneratedPassword, 10);
//       const uploadPhotoPromise = files?.uploadedPhoto
//         ? uploadToAzureWithSAS(files.uploadedPhoto[0])
//         : Promise.resolve(null);

//       const [hashedPassword, uploadedPhotoData] = await Promise.all([
//         hashedPasswordPromise,
//         uploadPhotoPromise,
//       ]);

//       const uploadedPhotoFilename = uploadedPhotoData?.uniqueName || null;

//       // Insert data into the student registration table
//       const studentValues = [
//         form.candidateName || null,
//         form.dateOfBirth || null,
//         form.gender || null,
//         form.category || null,
//         form.emailId || null,
//         form.confirmEmailId || null,
//         form.contactNo || null,
//         form.fatherName || null,
//         form.occupation || null,
//         form.mobileNo || null,
//         form.line1 || null,
//         form.state || null,
//         form.district || null,
//         form.pincode || null,
//         form.qualification || null,
//         form.nameOfCollege || null,
//         form.passingYear || null,
//         form.marks || null,
//         uploadedPhotoFilename,
//         hashedPassword,
//         0, // password_change_attempts
//         0, // reset_code
//         0, // is_logged_in (newly added)
//       ];

//       const studentInsertQuery = `
//         INSERT INTO iit_student_registration 
//         (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, district, pincode, qualification, college_name, passing_year, marks, uploaded_photo, password, password_change_attempts, reset_code, is_logged_in) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       const connection = await db.getConnection();
//       await connection.beginTransaction();

//       const [studentResult] = await connection.execute(studentInsertQuery, studentValues);
//       const studentId = studentResult.insertId; // Get the studentId after insertion
//       console.log("🆔 Student Registered with ID:", studentId);

//       // Now insert into the buy_courses table
//       const buyCourseValues = [
//         new Date(),              // user_purchased_time
//         0,                        // payment_status set to 0 (pending)
//         studentId,                // student_registration_id (from student table)
//         "completed",              // transaction_status (you can adjust this based on your needs)
//         form.courseCreationId || null, // course_creation_id (optional, if provided in the form)
//       ];

//       const buyCourseInsertQuery = `
//         INSERT INTO iit_student_buy_courses 
//         (user_purchased_time, payment_status, student_registration_id, transaction_status, course_creation_id) 
//         VALUES (?, ?, ?, ?, ?)
//       `;

//       const [buyCourseResult] = await connection.execute(buyCourseInsertQuery, buyCourseValues);

//       await connection.commit();
//       connection.release();

//       // Send registration email asynchronously
//       setImmediate(() => {
//         const registrationText = `Dear ${form.candidateName},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
//         sendMail(form.emailId, "Registration Successful", registrationText);
//         console.log("📧 Sent registration email to:", form.emailId);
//       });

//       // Respond with both the studentId and buyCourseId (from the buy_course table)
//       res.json({
//         success: true,
//         message: "Student registered and course entry created. Email sent!",
//         studentId,                // studentId from student registration table
//         buyCourseId: buyCourseResult.insertId, // buy_course_id from buy courses table (auto-generated)
//       });
//     } catch (err) {
//       console.error("❌ Registration Error:", err);
//       res.status(500).json({ success: false, error: err.message });
//     }
//   }
// );

;


  

  
module.exports = router;
