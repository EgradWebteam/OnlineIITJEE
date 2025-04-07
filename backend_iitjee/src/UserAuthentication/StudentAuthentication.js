const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { BlobServiceClient } = require('@azure/storage-blob');
const db = require('../config/database'); // Make sure your DB connection is set up

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Upload file to Azure using SAS token
async function uploadToAzureWithSAS(file) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const sasToken = process.env.AZURE_SAS_TOKEN;
  const containerName = process.env.AZURE_CONTAINER_NAME;

  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net?${sasToken}`
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(file.originalname);

  try {
    const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    console.log(`Upload block blob ${file.originalname} successfully`, uploadBlobResponse.requestId);
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure:', error);
    throw error;
  }
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Password generator
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Route: POST /api/studentRegistration
router.post('/studentRegistration', upload.fields([{ name: 'uploadedPhoto' }]), async (req, res) => {
  const form = req.body;
  const files = req.files;
  console.log('Form Data:', form);

  try {
    const autoGeneratedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(autoGeneratedPassword, 10);

    const uploadedPhotoSASUrl = files?.uploadedPhoto
      ? await uploadToAzureWithSAS(files.uploadedPhoto[0])
      : null;

    const portalId =2;

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
      uploadedPhotoSASUrl || null,
      portalId,
      hashedPassword,
      0,
      0,
    ];

    const insertQuery = `
      INSERT INTO iit_student_registration 
      (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, district, pincode, qualification, college_name, passing_year, marks, uploaded_photo, portal_id, password, password_change_attempts, reset_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertQuery, values);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: form.emailId,
      subject: 'Registration Successful',
      text: `Hi ${form.candidateName},\n\nYour registration is successful.\nPortal ID: ${portalId}\nPassword: ${autoGeneratedPassword}\n\nPlease log in and change your password.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Student registered successfully. Email sent!',
      studentId: result.insertId,
      portalId,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route: POST /api/studentLogin
router.post("/studentLogin", async (req, res) => {
  const { emailId, password, sessionId } = req.body;
  console.log(emailId, password, sessionId);

  try {
    const sql = `
      SELECT student_registration_id, candidate_name, password, email_id, 
             last_login_time, is_logged_in, session_id, uploaded_photo, mobile_no 
      FROM iit_student_registration 
      WHERE email_id = ?`;
    
    const [users] = await db.query(sql, [emailId]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const newSessionId = crypto.randomBytes(16).toString("hex");

    // If already logged in, check session ID
    if (user.is_logged_in && user.session_id && user.session_id !== sessionId) {
      return res.status(403).json({ message: "You are already logged in on another device." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { user_Id: user.student_registration_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const encryptedUserId = encryptDataWithAN(user.student_registration_id.toString());

    // Update login status and session ID
    const updateSql = `
      UPDATE iit_student_registration 
      SET is_logged_in = TRUE, last_login_time = NOW(), session_id = ? 
      WHERE student_registration_id = ?`;
    await db.query(updateSql, [newSessionId, user.student_registration_id]);

    res.json({
      studentId: encryptedUserId,
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
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
