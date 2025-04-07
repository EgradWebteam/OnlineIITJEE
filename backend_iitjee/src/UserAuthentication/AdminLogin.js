const express = require("express");
const db = require("../config/database.js");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



router.post("/adminLogin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const [rows] = await db.query("SELECT password,role FROM iit_admin_data WHERE admin_email_id = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = rows[0];

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {  role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );
      
        res.status(200).json({
            message: "Login successful",
          token,
     
        });
        
  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
);

module.exports = router;


