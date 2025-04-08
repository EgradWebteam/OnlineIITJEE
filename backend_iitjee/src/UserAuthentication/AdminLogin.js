const express = require("express");
const db = require("../config/database.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");  // To generate reset codes
const sendMail = require('../utils/email'); // Assuming you have a separate email.js function
const router = express.Router();

// Admin Login API
router.post("/adminLogin", async (req, res) => {
    const { email, password } = req.body;

    console.log("Received login request:", { email });

    try {
        const [rows] = await db.query("SELECT password, role FROM iit_admin_data WHERE admin_email_id = ?", [email]);
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
    }
});

// Forgot Password API (Send reset code without saving it in the database)


router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    console.log("Received forgot password request:", { email });

    try {
        const [userRows] = await db.query("SELECT * FROM iit_admin_data WHERE admin_email_id = ?", [email]);
        if (userRows.length === 0) {
            console.log("Email not found in database");
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate a 6-character reset code (e.g., 'a1b2c3')
        const resetCode = crypto.randomBytes(3).toString('hex');
        console.log("Generated reset code:", resetCode);

        // Prepare the email content
        const emailContent = `Here is your password reset code: ${resetCode}. Use it to reset your password.`;

        // Use setImmediate to send the email asynchronously
        setImmediate(() => {
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: "Password Reset Request",
                text: emailContent,
            };

            console.log("Sending email to:", email);
            sendMail(mailOptions);  // Send email asynchronously
        });

        console.log("Password reset email will be sent asynchronously");

        // Respond to the client immediately after processing
        res.status(200).json({ message: "Password reset email sent" });

    } catch (error) {
        console.error("Error in sending reset email:", error);
        res.status(500).json({ message: "Error sending reset email" });
    }
});


// Verify Reset Code and Update Password API
router.post("/reset-password", async (req, res) => {
    const { resetCode, newPassword } = req.body;

    console.log("Received reset code verification request:", { resetCode });

    try {
        // This is where you can check the reset code from the frontend and verify it matches with the reset code
        // that the user received in their email. Since we're not saving the reset code in the database, you'll need
        // to do the comparison on the frontend.

        if (!resetCode) {
            console.log("No reset code provided.");
            return res.status(400).json({ message: "Reset code is required." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password for the user (the reset code logic is now managed on the frontend)
        await db.query("UPDATE iit_admin_data SET password = ? WHERE reset_code = ?", [hashedPassword, resetCode]);

        console.log("Password updated successfully for user");

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Error updating password" });
    }
});

module.exports = router;
