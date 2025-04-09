const express=require("express");
const db = require("../config/database");
const router = express.Router();
router.use(express.json());

router.post("/StudentInfo", async (req, res) => {
    const { name, email, mobileNumber } = req.body;
    console.log("Logged student");

    try {
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

        // Insert new student if email doesn't exist
        const insertQuery = 'INSERT INTO iit_student_registration (candidate_name, email_id, contact_no) VALUES (?, ?, ?)';
        const result = await db.query(insertQuery, [name, email, mobileNumber]);

        res.status(200).json({
            message: 'Added student successfully',
            id: result.insertId,
        });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: 'Database query failed' });
    }
});



module.exports = router;