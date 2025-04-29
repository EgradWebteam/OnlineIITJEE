const express = require("express");
const multer = require("multer");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { BlobServiceClient } = require("@azure/storage-blob");
const db = require("../config/database"); // Make sure your DB connection is set up
const sendMail = require("../utils/email"); // Import the sendMail function
const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

function encryptDataWithAN(data) {
  const algorithm = "aes-256-cbc";
  const key = crypto.randomBytes(32); // Replace with your key
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Concatenate iv and encrypted data in hex format and return the first 10 characters
  const result = iv.toString("hex") + ":" + encrypted.toString("hex");
  return result.slice(0, 10); // Return only the first 10 characters
}

// Upload file to Azure using SAS token
async function uploadToAzureWithSAS(file, options = {}) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const sasToken = process.env.AZURE_SAS_TOKEN_UPLOADS;
  const containerName = process.env.AZURE_CONTAINER_NAME;
  const STUDENT_PHOTO_FOLDER = "student-data/";

  const sanitizedFilename = file.originalname.replace(/\s+/g, "_");

  let customPrefix = `${Date.now()}`; // Default unique name for photo

  // Only modify name for "proof" file
  if (options.type === "proof" && options.email && options.name && options.phone) {
    const last4Digits = options.phone.slice(-4);
    const emailSanitized = options.email.replace(/[^a-zA-Z0-9]/g, "_");
    const nameSanitized = options.name.replace(/\s+/g, "_");

    customPrefix = `${emailSanitized}-${nameSanitized}-${last4Digits}`;
  }
// console.log("customPrefix",customPrefix)
  const uniqueFilename = `${customPrefix}-${sanitizedFilename}`;
  const blobName = `${STUDENT_PHOTO_FOLDER}${uniqueFilename}`;

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

    // console.log(`✅ File saved at: ${fileUrl}`);
    // console.log(`Upload block blob ${file.originalname} successfully`, uploadBlobResponse.requestId);

    return {
      fileUrl,
      uniqueName: uniqueFilename,
    };
  } catch (error) {
    console.error("❌ Error uploading to Azure:", error);
    throw error;
  }
}

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// Route: POST /api/studentRegistration

const generatePassword = (length = 6) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
};
router.post("/checkEmailExists", async (req, res) => {
  const { emailId } = req.body;

  try {
    const sql = `SELECT * FROM iit_student_registration WHERE email_id = ?`;
    const [result] = await db.query(sql, [emailId]);
console.log( "result",result)
    if (result.length > 0) {
      return res.json({ message: "Your email already exists. Please use a different email." });
    } else {
      return res.json({ message: "Email is available" });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/studentRegistration",
  upload.fields([{ name: "uploadedPhoto" },, { name: "proof" }]), // Handling file upload (for the uploaded photo)
  async (req, res) => {
    const form = req.body;  // Extract form data from the request body
    const files = req.files;  // Extract uploaded files (if any)

    // Log the form data and uploaded files
    // console.log("Form Data:", form);
    if (files?.uploadedPhoto && files?.proof) {
      // console.log("Uploaded Photo Data and proof:", files.uploadedPhoto[0] , files.proof[0]);
    } else {
      // console.log("No photo uploaded or proof.");
    }

    try {
      // 1. Check if the email already exists in the database
      const emailCheckQuery = `SELECT * FROM iit_student_registration WHERE email_id = ?`;
      const [existingEmail] = await db.query(emailCheckQuery, [form.emailId]);

      if (existingEmail.length > 0) {
        // If email already exists, send an error response
        return res.status(400).json({
          success: false,
          message: "Your email already exists.",
        });
      }

      // 2. Generate an auto-generated password
      const autoGeneratedPassword = generatePassword();
      const hashedPassword = await bcryptjs.hash(autoGeneratedPassword, 10); // Hash the generated password

      // 3. Upload the photo to Azure or handle if no photo is uploaded
      const uploadPhotoPromise = files?.uploadedPhoto
        ? uploadToAzureWithSAS(files.uploadedPhoto[0]) // Function to upload photo to Azure
        : Promise.resolve(null); // If no photo, resolve to null
        const uploadProofPromise = files?.proof
        ? uploadToAzureWithSAS(files.proof[0], {
            type: "proof",
            email: form.emailId,
            name: form.candidateName,
            phone: form.contactNo,
          })
        : Promise.resolve(null);
      
      const [hashedPasswordResult, uploadedPhotoData,] = await Promise.all([
        hashedPassword,
        uploadPhotoPromise,
      ]);

      const uploadedPhotoFilename = uploadedPhotoData?.uniqueName || null;

      // console.log("Hashed password:", hashedPasswordResult);
      // console.log("Uploaded photo filename:", uploadedPhotoFilename);

      // 4. Prepare the values to insert into the database
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
        hashedPasswordResult,
        0, // password_change_attempts
        0, // reset_code
      ];

      // 5. Insert the new student record into the database
      const insertQuery = `
        INSERT INTO iit_student_registration 
        (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, district, pincode, qualification, college_name, passing_year, marks, uploaded_photo, password, password_change_attempts, reset_code) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const connection = await db.getConnection();  // Get a connection from the database pool
      const [result] = await connection.execute(insertQuery, values);  // Execute the query with the form data
      connection.release();  // Release the connection back to the pool

      // 6. Send a registration email to the student
      setImmediate(() => {
        const registrationText = `Dear ${form.candidateName},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
        sendMail(form.emailId, "Registration Successful", registrationText);  // Assuming you have a function to send emails
        // console.log("Sent registration email to:", form.emailId);  // Log the email sending
      });

      // 7. Send success response with student ID
      res.json({
        success: true,
        message: "Student registered successfully. Email sent!",
        studentId: result.insertId,
      });
    } catch (err) {
      // Handle errors (e.g., database issues, file upload issues)
      console.error("Registration error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // console.log("Received forgot password request:", { email });

  try {
    // Query the database to check if the email exists
    const [userRows] = await db.query(
      "SELECT * FROM iit_student_registration WHERE email_id = ?",
      [email]
    );
    if (userRows.length === 0) {
      // console.log("Email not found in database");
      return res.status(404).json({ message: "Email not found" });
    }
    const resetCode = generateResetCode();
    // console.log("Generated reset code:", resetCode);
    const updateQuery =
      "UPDATE iit_student_registration SET reset_code= ? WHERE email_id = ?";
    await db.query(updateQuery, [resetCode, email]);
    const subject = "Password Reset Request";
    const text = `Here is your password reset code: ${resetCode}. Use it to reset your password.`;
    sendMail(email, subject, text);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in sending reset email:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
});
router.post("/reset-password", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    // 1. Find the user by email and reset code
    const sql = `
      SELECT student_registration_id, reset_code 
      FROM iit_student_registration 
      WHERE email_id = ?;
    `;
    const [userRows] = await db.query(sql, [email]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = userRows[0];

    // 2. Convert both reset codes to numbers
    const dbResetCodeNumber = Number(user.reset_code); // Convert reset code from database to number
    const userResetCodeNumber = Number(resetCode); // Convert provided reset code to number

    // Log the numeric comparison
    // console.log("Comparing reset codes as numbers:");
    // console.log("Reset code from database (as number):", dbResetCodeNumber);
    // console.log("Reset code provided by user (as number):", userResetCodeNumber);

    // 3. Check if the reset code matches the one stored in the database after conversion
    if (dbResetCodeNumber !== userResetCodeNumber) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // 4. Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword.trim(), 10);

    // 5. Update password in DB and clear reset code (optional)
    const updatePasswordSql = `
      UPDATE iit_student_registration 
      SET password = ?, reset_code = NULL 
      WHERE student_registration_id = ?;
    `;
    await db.query(updatePasswordSql, [hashedPassword, user.student_registration_id]);

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Error in resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sasToken = process.env.AZURE_SAS_TOKEN_FOR_FETCHING;
const containerName = process.env.AZURE_CONTAINER_NAME;
const StudentImagesFolderName = process.env.AZURE_STUDENT_IMAGES_FOLDER;  
const BASE_URL = process.env.BASE_URL;




// Helper to return proxy URL instead of exposing SAS token
const getImageUrl = (fileName) => {
  // console.log("fileName",fileName)
    if (!fileName) return null;
    return `${BASE_URL}/student/StudentImage/${fileName}`; // or use your production domain
  };
  
  // ✅ Route to serve the actual course card image securely (proxy)
  router.get('/StudentImage/:fileName', async (req, res) => {
    const { fileName } = req.params;
  // console.log("fileName",fileName)
    if (!fileName) return res.status(400).send("File name is required");
  
    const imageUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${StudentImagesFolderName}/${fileName}?${sasToken}`;
  
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(response.status).send("Failed to fetch image from Azure");
      }
  
      res.setHeader("Content-Type", response.headers.get("Content-Type"));
      response.body.pipe(res); // Stream the image directly
    } catch (error) {
      console.error("Error fetching image from Azure Blob:", error);
      res.status(500).send("Error fetching image");
    }
  });

  router.post("/studentLogin", async (req, res) => {
    let { email, password } = req.body;
  
    email = email.trim();
    password = password.trim();
  
    try {
      // 1. Fetch student by email
      const sql = `
        SELECT student_registration_id, candidate_name, password, email_id,
               last_login_time, is_logged_in, session_id, uploaded_photo, mobile_no
        FROM iit_student_registration
        WHERE email_id = ?
      `;
      const [users] = await db.query(sql, [email]);
  
      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      const user = users[0];
  
      // 2. Block login if already logged in
      if (user.is_logged_in) {
        return res.status(403).json({
          message: "You are already logged in. Please log out before logging in again.",
        });
      }
  
      // 3. Compare password
      const isMatch = await bcryptjs.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // 4. Generate new session and access token
      const newSessionId = crypto.randomBytes(16).toString("hex");
      const accessToken = jwt.sign(
        { user_Id: user.student_registration_id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
  
      const encryptedUserId = encryptDataWithAN(user.student_registration_id.toString());
  
      // 5. Update login status
      const updateSql = `
        UPDATE iit_student_registration
        SET is_logged_in = TRUE, last_login_time = NOW(), session_id = ?
        WHERE student_registration_id = ?
      `;
      await db.query(updateSql, [newSessionId, user.student_registration_id]);
  
      // 6. Send response
      const responseData = {
        user_Id: encryptedUserId,
        decryptedId: user.student_registration_id,
        accessToken,
        userDetails: {
          student_registration_id: user.student_registration_id,
          candidate_name: user.candidate_name,
          email_id: user.email_id,
          last_login_time: user.last_login_time,
          uploaded_photo: getImageUrl(user.uploaded_photo),
          mobile_no: user.mobile_no,
        },
        sessionId: newSessionId,
      };
  
      res.json(responseData);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  
router.post("/studentLogout", async (req, res) => {
  const { sessionId } = req.body; // Assume sessionId is passed in the request body

  if (!sessionId) {
    return res.status(401).json({ message: "Session ID is required" });
  }

  try {
    // Update the database to set is_logged_in to false and clear the session ID
    const updateSql = `
      UPDATE iit_student_registration 
      SET is_logged_in = FALSE, session_id = NULL 
      WHERE session_id = ?`;

    const result = await db.query(updateSql, [sessionId]);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res
        .status(401)
        .json({ message: "Invalid session ID or user already logged out" });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/changePassword", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // 1. Find the user by email
    const sql = `
      SELECT student_registration_id 
      FROM iit_student_registration 
      WHERE email_id = ?;
    `;
    const [userRows] = await db.query(sql, [email]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = userRows[0];

    // 2. Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword.trim(), 10);

    // 3. Update password in DB and clear the reset code (optional)
    const updatePasswordSql = `
      UPDATE iit_student_registration 
      SET password = ?, reset_code = NULL 
      WHERE student_registration_id = ?;
    `;
    await db.query(updatePasswordSql, [hashedPassword, user.student_registration_id]);

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Error in resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});


module.exports = router;
