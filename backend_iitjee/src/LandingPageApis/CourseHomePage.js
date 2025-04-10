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

        // console.log("Available courses found:", rows);
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
                total_price: course.total_price,
                card_image: course.card_image,
                
            });
        });
        
        // Convert the structure to an array for easier handling on the frontend
        const structuredCourses = Object.values(coursesByPortalAndExam);
        res.status(200).json(structuredCourses);
        // console.log("Unpurchased courses grouped by portal and exam:", structuredCourses);
    } catch (error) {
        console.error("Error fetching available courses:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
})
module.exports = router;
