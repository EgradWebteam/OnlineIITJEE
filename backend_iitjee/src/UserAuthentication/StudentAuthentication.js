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

// Azure config
const AZURE_SAS_TOKEN = process.env.AZURE_SAS_TOKEN;
const AZURE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;
const STUDENT_PHOTO_FOLDER = 'student-data/';
const AZURE_BLOB_URL = `https://iitstorage.blob.core.windows.net/${AZURE_ACCOUNT_NAME}?sp=rawl&st=2025-04-07T06:53:08Z&se=2025-04-08T14:53:08Z&sv=2024-11-04&sr=c&sig=kMpx6H6FqGNk%2BOkdI79%2BYwH3sG18ghJVJ9y8aRqSye0%3D`;

// Upload file to Azure using SAS token
const uploadToAzureWithSAS = async (file) => {
  const blobServiceClient = new BlobServiceClient(`${AZURE_BLOB_URL}?${AZURE_SAS_TOKEN}`);
  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

  const blobName = `${STUDENT_PHOTO_FOLDER}${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });

  return `${blockBlobClient.url}?${AZURE_SAS_TOKEN}`;
};

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

    const portalId = `JEE-${Date.now()}`;

    const insertQuery = `
      INSERT INTO iit_student_registration 
      (candidate_name, date_of_birth, gender, category, email_id, confirm_email_id, contact_no, father_name, occupation, mobile_no, line_1, state, districts, pincode, qualifications, college_name, passing_year, marks, uploaded_photo, portal_id, password, password_change_attempts, reset_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      form.candidateName,
      form.dateOfBirth,
      form.Gender,
      form.Category,
      form.emailId,
      form.confirmEmailId,
      form.contactNo,
      form.fatherName,
      form.occupation,
      form.mobileNo,
      form.line1,
      form.state,
      form.districts,
      form.pincode,
      form.qualifications,
      form.NameOfCollege,
      form.passingYear,
      form.marks,
      uploadedPhotoSASUrl,
      portalId,
      hashedPassword,
      0,
      0,
    ];

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

module.exports = router;
