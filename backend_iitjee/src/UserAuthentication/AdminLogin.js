const express = require("express");
const db = require("../config/database.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");  // To generate reset codes
const sendMail = require('../utils/email'); // Assuming you have a separate email.js function
const router = express.Router();



router.post("/adminLogin", async (req, res) => {
    const { email, password } = req.body;
  
   
    if (!email|| !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
    console.log("Received login request:", { email });
  
    let connection;
  
    try {
       
 
      connection = await db.getConnection();
  
      const [rows] = await connection.query(
        "SELECT password, role FROM iit_admin_data WHERE admin_email_id = ?",
        [email]
      );
  
      if (rows.length === 0) {
        console.log("Invalid email or password");
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      const user = rows[0];
      console.log("User found:", { email, role: user.role });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password mismatch");
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      const token = jwt.sign(
        { role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
      );
  
      console.log("Login successful, sending JWT token");
  
      res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Server error" });
    } finally {
      if (connection) connection.release();
    }
  });
const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

// Forgot Password API (Send reset code without saving it in the database)


router.post("/forgot-passwordadmin", async (req, res) => {
    const { email } = req.body;

    console.log("Received forgot password request:", { email });
    let connection;
    try {
      
        // ✅ Only reached if valid email and password provided
        connection = await db.getConnection();
        const [userRows] = await connection.query("SELECT admin_email_id FROM iit_admin_data WHERE admin_email_id = ?", [email]);
        if (userRows.length === 0) {
            console.log("Email not found in database");
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate a 6-character reset code (e.g., 'a1b2c3')
        const resetCode = generateResetCode();
        console.log("Generated reset code:", resetCode);
        const updateQuery =
        "UPDATE iit_admin_data SET reset_code = ? WHERE admin_email_id = ?";
      await connection.query(updateQuery, [resetCode, email]);
       
        const subject = "Password Reset Request";
        const text = `Here is your password reset code: ${resetCode}. Use it to reset your password.`;
        sendMail(email, subject, text);
      

        console.log("Password reset email will be sent asynchronously");

        // Respond to the client immediately after processing
        res.status(200).json({ message: "Password reset email sent" });

    } catch (error) {
        console.error("Error in sending reset email:", error);
        res.status(500).json({ message: "Error sending reset email" });
    } finally {
        if (connection) connection.release();
      }
});


// Verify Reset Code and Update Password API
router.post("/reset-passwordadmin", async (req, res) => {
    const { resetCode, newPassword , email} = req.body;
    if (!resetCode || !newPassword || !email) {
        console.log("No reset code or new password or email  provided.");
        return res.status(400).json({ message: "Reset code,email and  new password is required." });
    }
    console.log("Received reset code verification request:", { resetCode ,newPassword});
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query(
            "SELECT reset_code FROM iit_admin_data WHERE admin_email_id = ?",
            [email]
          );
          if (rows.length === 0) {
            console.log("Email not found in database");
            return res.status(404).json({ message: "Email not found" });
        }
        console.log("Rows fetched:", rows[0].reset_code);
        // Check if the reset code is valid
        const isResetCodeMatch = Number(rows[0].reset_code) === String(resetCode);
        if (!isResetCodeMatch) {
            console.log("Invalid reset code");
            return res.status(400).json({ message: "Invalid reset code" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password for the user (the reset code logic is now managed on the frontend)
        const updateQuery =
        "UPDATE iit_admin_data SET password = ? WHERE admin_email_id = ?";
      await connection.query(updateQuery, [hashedPassword, email]);

        console.log("Password updated successfully for user");

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Error updating password" });
    } finally {
        if (connection) connection.release();
      }
});

module.exports = router;
