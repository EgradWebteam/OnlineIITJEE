const express=require("express");
const db = require("../config/database");
// const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/email");
const router = express.Router();
router.use(express.json());

function generatePassword(length = 6) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }


router.post("/StudentInfo", async (req, res) => {
    const { name, email, mobileNumber } = req.body;
    console.log("Logged student");

    try {
          const autoGeneratedPassword = generatePassword();
              const hashedPassword= await bcrypt.hash(autoGeneratedPassword, 10);
              console.log(hashedPassword)
         // Hashing password
        // Check if the email already exists
        const checkEmailQuery = 'SELECT * FROM iit_student_registration WHERE email_id = ?';
        const emailResult = await db.query(checkEmailQuery, [email]);

        // Log the raw result to check its format
        console.log("emailResult:", emailResult);

        // If emailResult[0] has values, it means the email exists
        if (emailResult[0] && emailResult[0].length > 0) {
            // Return the existing record if the email already exists
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

      
        const insertQuery = 'INSERT INTO iit_student_registration (candidate_name, email_id, contact_no,password) VALUES (?, ?, ?,?)';
        const connection = await db.getConnection();
        const [result] = await connection.execute(insertQuery, [name, email, mobileNumber,hashedPassword]);
   
        connection.release(); // Release connection back to the pool
  
        // Insert new student if email doesn't exist
        setImmediate(() => {
            const registrationText = `Dear ${name},\n\nYour registration is successful. Here is your auto-generated password: ${autoGeneratedPassword}\n\nPlease change your password after logging in for the first time.\n\nBest regards,\nYour Team`;
            console.log('Sending email to:', email);
            sendMail(email, "Registration Successful", registrationText); // Send email asynchronously
          });

        res.status(200).json({
        message: "Student registered successfully. Email sent!",
            id: result.insertId,
            hashedPassword:hashedPassword
        });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Database query failed' });
    }
});



module.exports = router;