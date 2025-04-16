const express = require("express");
const router = express.Router(); // ✅ MUST include this!
const db = require("../config/database.js"); // Adjust path if needed
const { BlobServiceClient  } = require("@azure/storage-blob");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get("/getexams",async (req,res) =>{
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query("SELECT * FROM iit_exams");
       
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
}

)


module.exports = router;