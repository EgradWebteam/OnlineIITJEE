const express = require("express");
const db = require("../config/database");
// const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/email");
const router = express.Router();
router.use(express.json());
 
// Function to generate a random password
function generatePassword(length = 6) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
// Get all registered students
router.get("/StudentInfo", async (req, res) => {
  try {
    const query = `
      SELECT
        student_registration_id AS id,
        candidate_name AS name,
        email_id AS email,
        contact_no AS mobileNumber,
        student_activation
      FROM iit_student_registration
    `;
 
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students from database" });
  }
});
// ✅ 🔽 ADD THIS NEW ROUTE BELOW (or above) without replacing the above one
router.get("/coursesName", async (req, res) => {
  try {
    const query = `SELECT course_creation_id AS id, course_name FROM iit_course_creation_table`;
    const [rows] = await db.query(query);
 
    console
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses from database" });
  }
});
 
 
// POST route to add student info
router.post("/StudentInfo", async (req, res) => {
  const { name, email, mobileNumber, courses = [] } = req.body;
  console.log("Logging student");
 
  try {
    const autoGeneratedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(autoGeneratedPassword, 10);
    console.log("Hashed Password:", hashedPassword);
 
    // Check if the email already exists
    const checkEmailQuery =
      "SELECT * FROM iit_student_registration WHERE email_id = ?";
    const emailResult = await db.query(checkEmailQuery, [email]);
 
    // If the email exists, return an error
    if (emailResult[0] && emailResult[0].length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }
 
    // Insert new student into the database
    const connection = await db.getConnection();
    const insertQuery =
      "INSERT INTO iit_student_registration (candidate_name, email_id, contact_no, password,student_activation) VALUES (?, ?, ?, ?,1)";
 
    const [result] = await connection.execute(insertQuery, [
      name,
      email,
      mobileNumber,
      hashedPassword,
    ]);
    const studentId = result.insertId;
 
    // Insert course selections
    for (const courseId of courses) {
      await connection.execute(
        `INSERT INTO iit_student_buy_courses (student_registration_id, course_creation_id, transaction_status,user_purchased_time)
         VALUES (?, ?, ?,NOW())`,
        [studentId, courseId, "paid"]
      );
    }
 
    connection.release(); // Release connection back to the pool
 
    // Send email after successful registration
    setImmediate(() => {
      const registrationText = `Dear ${name},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
      console.log("Sending email to:", email);
      sendMail(email, "Registration Successful", registrationText); // Send email asynchronously
    });
 
    res.status(200).json({
      message: "Student registered successfully. Email sent!",
      id: studentId,
      name: name,
      email: email,
      mobileNumber: mobileNumber,
      password: autoGeneratedPassword,
      selectedCourses: courses,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res.status(500).json({ error: "Database query failed" });
  }
});
 
// Update student details
router.put("/StudentInfo/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const { student_activation } = req.body;
 
    if (student_activation === undefined) {
      return res.status(400).json({ message: "student_activation value is required" });
    }
 
    const updateQuery = `
      UPDATE iit_student_registration
      SET student_activation = ?
      WHERE student_registration_id = ?
    `;
    await db.query(updateQuery, [student_activation, studentId]);
 
    res.status(200).json({
      message: `Student has been ${student_activation === 1 ? 'deactivated' : 'activated'} successfully`,
    });
  } catch (error) {
    console.error("Error updating student activation:", error);
    res.status(500).json({ message: "Error updating student activation" });
  }
});
 
 
module.exports = router;