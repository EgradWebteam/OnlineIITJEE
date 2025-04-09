const express = require("express");
const db = require("../config/database.js");
// Assuming you have a separate email.js function
const router = express.Router();
router.get("/UnPurchasedcourses/:studentregisterationid",async (req,res) => {
    const { studentregisterationid } = req.params;
    console.log("Received request for unpurchased courses:", { studentregisterationid });

    let connection;

    try {
        connection = await db.getConnection();

        const [rows] = await connection.query(
            `SELECT 
             cct.course_creation_id,
                cct.course_name,
                cct.exam_id,
                e.exam_name,
                p.portal_id,
                p.portal_name,
                cct.total_price,
                cct.portal_id,
                cct.card_image
            FROM 
                iit_course_creation_table cct
            LEFT JOIN iit_exams e ON cct.exam_id = e.exam_id
            LEFT JOIN iit_portal p ON cct.portal_id = p.portal_id
            WHERE 
                NOT EXISTS (
                    SELECT 1
                    FROM iit_student_buy_courses student
                    WHERE student.student_registration_id = ?
                    AND student.course_creation_id = cct.course_creation_id
                )`,  // <- Add closing parenthesis here
            [studentregisterationid]
        );
        

        if (rows.length === 0) {
            console.log("No unpurchased courses found for this student.");
            return res.status(404).json({ message: "No unpurchased courses found" });
        }

        console.log("Unpurchased courses found:", rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching unpurchased courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
})

module.exports = router;
