const express = require("express");
const db = require("../config/database.js");
// Assuming you have a separate email.js function
const router = express.Router();
router.get("/Purchasedcourses/:studentregisterationid", async (req, res) => {
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
              
                cct.portal_id,
                cct.card_image
            FROM 
                iit_course_creation_table cct
            LEFT JOIN iit_exams e ON cct.exam_id = e.exam_id
            LEFT JOIN iit_portal p ON cct.portal_id = p.portal_id
            LEFT JOIN iit_student_buy_courses student ON cct.course_creation_id = student.course_creation_id
            WHERE student.student_registration_id = ? AND cct.active_course = "active"
            AND
    EXISTS (
        SELECT 1
        FROM iit_student_registration sr
        WHERE sr.student_registration_id = ?
    )`, // Ensure the query is properly formatted here.
            [studentregisterationid,studentregisterationid] // Pass the parameter as an array to the query function
        );

        if (rows.length === 0) {
            console.log("No purchased courses found for this student.");
            return res.status(404).json({ message: "No purchased courses found" });
        }

        console.log("purchased courses found:", rows);
        // res.status(200).json(rows);
        const coursesByPortalAndExam = {};

        // Loop through the rows and organize the data
        rows.forEach((course) => {
            // Check if portal_id exists in the coursesByPortalAndExam object
            if (!coursesByPortalAndExam[course.portal_id]) {
                coursesByPortalAndExam[course.portal_id] = {
                    portal_id: course.portal_id,
                    portal_name: course.portal_name,
                    exams: {},
                };
            }
        
            // Check if exam_id exists under the portal
            if (!coursesByPortalAndExam[course.portal_id].exams[course.exam_id]) {
                coursesByPortalAndExam[course.portal_id].exams[course.exam_id] = {
                    exam_id: course.exam_id,
                    exam_name: course.exam_name,
                    courses: [],
                };
            }
        
            // Add the course to the correct exam under the correct portal
            coursesByPortalAndExam[course.portal_id].exams[course.exam_id].courses.push({
                course_creation_id: course.course_creation_id,
                course_name: course.course_name,
               
                card_image: course.card_image
            });
        });
        
        // Convert the structure to an array for easier handling on the frontend
        const structuredCourses = Object.values(coursesByPortalAndExam);
        res.status(200).json(structuredCourses);
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;
