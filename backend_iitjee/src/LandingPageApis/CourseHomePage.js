const express = require("express");
const db = require("../config/database.js");
const router = express.Router();

router.get("/AvailableCourse/:portal_id", async (req, res) => {
    const { portal_id } = req.params;
    console.log("Received request for available courses");
 
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
 
 
   
    WHERE cct.portal_id = ? AND cct.active_course = 'active' `,[portal_id] // Pass the parameter as an array to the query function
        );
 
        if (rows.length === 0) {
            console.log("No courses found");
            return res.status(404).json({ message: "No courses found" });
        }

        console.log("Available courses found:", rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
})
module.exports = router;
