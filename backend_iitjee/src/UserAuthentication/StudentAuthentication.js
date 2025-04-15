const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
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
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// Route: POST /api/studentRegistration

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

router.post(
  "/studentRegistration",
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

      const insertQuery = `
        INSERT INTO iit_student_registration 
        (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, district, pincode, qualification, college_name, passing_year, marks, uploaded_photo, password, password_change_attempts, reset_code) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const connection = await db.getConnection();
      const [result] = await connection.execute(insertQuery, values);
      connection.release(); // Release connection back to the pool

     

      // Use setImmediate to send the email asynchronously
      setImmediate(() => {
        const registrationText = `Dear ${form.candidateName},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
        sendMail(form.emailId, "Registration Successful", registrationText); // Send email asynchronously
        console.log("Sent registration email to:", form.emailId); // Log the email sending
      });

      res.json({
        success: true,
        message: "Student registered successfully. Email sent!",
        studentId: result.insertId,
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);
// forgot-password route to send reset code
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("Received forgot password request:", { email });

  try {
    // Query the database to check if the email exists
    const [userRows] = await db.query(
      "SELECT * FROM iit_student_registration WHERE email_id = ?",
      [email]
    );
    if (userRows.length === 0) {
      console.log("Email not found in database");
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate an alphanumeric reset code (e.g., 'A1b2C3')
    const resetCode = generateResetCode();
    console.log("Generated reset code:", resetCode);

    // SQL query to update the reset code in the database
    const updateQuery =
      "UPDATE iit_student_registration SET reset_code= ? WHERE email_id = ?";
    await db.query(updateQuery, [resetCode, email]);

    // Send the reset code via email asynchronously using the sendMail function
    const subject = "Password Reset Request";
    const text = `Here is your password reset code: ${resetCode}. Use it to reset your password.`;
    sendMail(email, subject, text);

    // Send response to the client without waiting for the email
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in sending reset email:", error);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// reset-password route to reset the password
router.post("/reset-password", async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    // 3. Update password in DB and clear reset code (optional)
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

// Route: POST /api/studentLogin
router.post("/studentLogin", async (req, res) => {
  let { email, password, sessionId } = req.body;

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
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const newSessionId = crypto.randomBytes(16).toString("hex");

    // 2. Check session conflict
    if (user.is_logged_in && user.session_id && user.session_id !== sessionId) {
      return res.status(403).json({ message: "You are already logged in on another device." });
    }

    // 3. Compare password
    console.log("Comparing input password:", password);
    console.log("With stored hashed password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    const hashedPassword = bcrypt.hash(password, 10); // Store the hashed password for debugging
    console.log(hashedPassword, user.password); // Log the password comparison for debugging
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Generate access token
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
        uploaded_photo: user.uploaded_photo,
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
    return res.status(400).json({ message: "Session ID is required" });
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
        .status(400)
        .json({ message: "Invalid session ID or user already logged out" });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
