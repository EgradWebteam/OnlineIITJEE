const express = require("express");
const db = require("../config/database.js");
const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const bcrypt = require("bcrypt");
const router = express.Router();
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
    const sasToken = process.env.AZURE_SAS_TOKEN;
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
  
      console.log(`✅ File saved at: ${fileUrl}`);
      console.log(
        `Upload block blob ${file.originalname} successfully`,
        uploadBlobResponse.requestId
      );
  
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

router.get("/UnPurchasedcourses/:studentregisterationid",async (req,res) => {
    const { studentregisterationid } = req.params;
    console.log("Received request for unpurchased courses:", { studentregisterationid });
 
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
            console.log("No unpurchased courses found for this student.");
            return res.status(404).json({ message: "No unpurchased courses found" });
        }
 
        console.log("Unpurchased courses found:", rows);
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
        console.log("Unpurchased courses grouped by portal and exam:", structuredCourses);
    } catch (error) {
        console.error("Error fetching unpurchased courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
})
router.get("/studentpaymentcreation/:studentregisterationid/:coursecreationid", async (req, res) => {
    const { studentregisterationid, coursecreationid } = req.params;
    console.log("Received request for student payment creation:", { studentregisterationid, coursecreationid });

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
            console.log("No courses found for this student and course creation ID.");
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
    console.log("Received request for active course:", { coursecreationid });

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
                iit_db.iit_course_creation_table
            WHERE
                active_course = "active"
                AND course_creation_id = ?`,
            [coursecreationid]
        );

        if (rows.length === 0) {
            console.log("No active courses found for this course creation ID.");
            return res.status(404).json({ message: "No active course found for this course creation ID" });
        }

        console.log("Active course found:", rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching active course:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});
router.post(
    "/studentRegistrationBuyCourses",
    upload.fields([{ name: "uploadedPhoto" }]), // Handling file upload
    async (req, res) => {
      const form = req.body;
      const files = req.files;
  
      // Log the form data
      console.log("Form Data:", form);
  
      // Log the uploaded files (specifically the uploaded photo)
      if (files?.uploadedPhoto) {
        console.log("Uploaded Photo Data:", files.uploadedPhoto[0]);
      } else {
        console.log("No photo uploaded.");
      }
  
      try {
        const autoGeneratedPassword = generatePassword();
        const hashedPasswordPromise = bcrypt.hash(autoGeneratedPassword, 10); // Hashing password
        const uploadPhotoPromise = files?.uploadedPhoto
          ? uploadToAzureWithSAS(files.uploadedPhoto[0]) // Upload to Azure if photo is present
          : Promise.resolve(null); // If no photo, resolve to null
  
        // Wait for both async tasks concurrently
        const [hashedPassword, uploadedPhotoData] = await Promise.all([
          hashedPasswordPromise,
          uploadPhotoPromise,
        ]);
  
        const uploadedPhotoFilename = uploadedPhotoData?.uniqueName || null;
  
        console.log("Hashed password:", hashedPassword);
        console.log("Uploaded photo filename:", uploadedPhotoFilename);
  
        // Prepare the values to be inserted
        const values = [
          form.candidateName || null,
          form.dateOfBirth || null,
          form.gender || null,
          form.category || null,
          form.emailId || null,
          form.confirmEmailId || null,
          form.contactNo || null,
          form.fatherName || null,
          form.occupation || null,
          form.mobileNo || null,
          form.line1 || null,
          form.state || null,
          form.district || null,
          form.pincode || null,
          form.qualification || null,
          form.nameOfCollege || null,
          form.passingYear || null,
          form.marks || null,
          uploadedPhotoFilename || null,
          hashedPassword,
          0, // password_change_attempts
          0, // reset_code
        ];
  
        // Replace undefined values with null
        const cleanValues = values.map(value => value === undefined ? null : value);
  
        console.log("Clean Values to be inserted into the database:", cleanValues);
  
        const insertQuery = `
          INSERT INTO iit_student_registration 
          (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, district, pincode, qualification, college_name, passing_year, marks, uploaded_photo, password, password_change_attempts, reset_code) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        // Insert data into the database
        const connection = await db.getConnection();
        await connection.beginTransaction(); // Start the transaction
  
        const [result] = await connection.execute(insertQuery, cleanValues);
        const studentId = result.insertId; // Capture the inserted student ID
        console.log("Student registered with ID:", studentId);
  
        // Proceed with the course purchase insert
        const buyCourseValues = [
          form.buyCourseId, 
          new Date(), 
          'pending', 
          studentId,
          'completed', 
          form.courseCreationId, 
        ];
  
        const buyCourseQuery = `
          INSERT INTO course_purchase 
          (buy_course_id, user_purchased_time, payment_status, student_registration_id, transaction_status, course_creation_id) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
  
        const buyCourseConnection = await db.getConnection();
        const [buyCourseResult] = await buyCourseConnection.execute(buyCourseQuery, buyCourseValues);
        buyCourseConnection.release(); // Release connection back to the pool
  
        // Commit the transaction
        await connection.commit(); // Commit the transaction
        connection.release(); // Release the connection back to the pool
  
        // Use setImmediate to send the email asynchronously
        setImmediate(() => {
          const registrationText = `Dear ${form.candidateName},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
          sendMail(form.emailId, "Registration Successful", registrationText); // Send email asynchronously
          console.log("Sent registration email to:", form.emailId); // Log the email sending
        });
  
        // Send the response to the client
        res.json({
          success: true,
          message: "Student registered and course purchased successfully. Email sent!",
          studentId: studentId,
          buyCourseId: buyCourseResult.insertId,
        });
      } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, error: err.message });
      }
    }
  );
  

  
module.exports = router;
