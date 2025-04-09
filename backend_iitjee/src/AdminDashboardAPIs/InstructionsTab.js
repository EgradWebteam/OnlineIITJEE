const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const multer = require("multer");
const mammoth = require("mammoth");
const fs = require("fs");
const cheerio = require("cheerio");
const cors = require("cors");
router.use(cors());

router.get("/InstructionsFormData", async (req, res) => {
  try {
    const [exams] = await db.query("SELECT exam_id, exam_name FROM iit_exams");

    res.json({ exams });
  } catch (err) {
    console.error("Error fetching IIT data:", err);
    res.status(500).json({ error: "Failed to fetch IIT data" });
  }
});

const upload = multer({ dest: "uploads/" });

router.get("/InstructionsFormData", async (req, res) => {
  try {
    const [exams] = await db.query("SELECT exam_id, exam_name FROM iit_exams");
    res.json({ exams });
  } catch (err) {
    console.error("Error fetching IIT data:", err);
    res.status(500).json({ error: "Failed to fetch IIT data" });
  }
});

router.post(
  "/UploadInstructions",
  upload.single("document"),
  async (req, res) => {
    const docxFilePath = `uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    try {
      const fileContent = await mammoth.extractRawText({ path: docxFilePath });
      const result = await mammoth.convertToHtml({ path: docxFilePath });

      const htmlContent = result.value;
      const $ = cheerio.load(htmlContent);

      // Extract base64 images from HTML (if any)
      const images = [];
      $("img").each(function () {
        const src = $(this).attr("src");
        if (src && src.startsWith("data:image/")) {
          const base64Data = src.replace(/^data:image\/\w+;base64,/, "");
          const imageBuffer = Buffer.from(base64Data, "base64");
          images.push(imageBuffer);
        }
      });

      // Use the first image or null if no image exists
      const imageToInsert = images.length > 0 ? images[0] : null;

      // Insert into iit_instructions
      const [instructionResult] = await db.query(
        "INSERT INTO iit_instructions (exam_id, instruction_heading, document_name, instruction_img) VALUES (?, ?, ?, ?)",
        [
          req.body.exam_id,
          req.body.instruction_heading,
          fileName,
          imageToInsert,
        ]
      );

      const instructionId = instructionResult.insertId;

      const pointsArray = fileContent.value
        .split("/")
        .map((point) => point.trim());
      const filteredPointsArray = pointsArray.filter((point) => point !== "");

      for (const point of filteredPointsArray) {
        await db.query(
          "INSERT INTO iit_instruction_points (exam_id, instruction_point, instruction_id) VALUES (?, ?, ?)",
          [req.body.exam_id, point, instructionId]
        );
      }

      fs.unlinkSync(docxFilePath); // delete uploaded file

      res.status(200).json({
        success: true,
        instructionId,
        message: "File uploaded successfully with instructions.",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error.message,
      });
    }
  }
);
// GET: Fetch instruction and its points by instruction_id
router.get("/GetInstructionDetails", async (req, res) => {
  try {
    const [instructions] = await db.query(
      `SELECT 
        i.instruction_id, 
        i.instruction_heading, 
        i.document_name,
        e.exam_name
FROM 
    iit_instructions i
LEFT JOIN 
    iit_exams e 
ON 
    i.exam_id = e.exam_id;
`
    );

    if (instructions.length === 0) {
      return res.status(404).json({ message: "Instruction not found" });
    }

    res.json({ instructions });
  } catch (err) {
    console.error("Error fetching instruction details:", err);
    res.status(500).json({ error: "Failed to fetch instruction details" });
  }
});

router.get("/GetInstructionPoints/:instruction_id", async (req, res) => {
  const instructionId = req.params.instruction_id;

  try {
    const [pointsResults] = await db.query(
      `SELECT 
          ip.instruction_point, 
          i.instruction_img
        FROM 
          iit_db.iit_instruction_points ip
        JOIN 
          iit_db.iit_instructions i 
          ON i.instruction_id = ip.instruction_id
        WHERE 
          ip.instruction_id = ?`,
      [instructionId]
    );

    const points = pointsResults.map((p) => p.instruction_point);

    // Assuming the image is same for all rows (based on join), we take it from the first one
    const instructionImgBuffer = pointsResults[0]?.instruction_img;
    const instructionImgBase64 = instructionImgBuffer
      ? instructionImgBuffer.toString("base64")
      : null;

    res.json({
      points,
      instructionImg: instructionImgBase64,
    });
  } catch (err) {
    console.error("Error fetching instruction points:", err);
    res.status(500).json({ error: "Failed to fetch instruction points" });
  }
});

// // PUT: Update Instruction by ID
router.put(
  "/UpdateInstruction/:instruction_id",
  express.json({ limit: "50mb" }),
  async (req, res) => {
    const { instruction_id } = req.params;
    const { exam_id, instruction_points, instruction_img } = req.body;

    if (typeof instruction_points !== "string") {
      return res
        .status(400)
        .json({ message: "Instruction points must be a string" });
    }

    try {
      // 1. Update points
      const updatePointsQuery = `
        UPDATE iit_instruction_points
        SET exam_id = ?, instruction_point = ?
        WHERE instruction_id = ?
      `;
      await db.query(updatePointsQuery, [
        exam_id,
        instruction_points,
        instruction_id,
      ]);

      // 2. Update image as buffer
      let imgBuffer = null;
      if (instruction_img && instruction_img.includes(",")) {
        const base64Data = instruction_img.split(",")[1];
        imgBuffer = Buffer.from(base64Data, "base64");
      }

      const updateImageQuery = `
        UPDATE iit_instructions
        SET instruction_img = ?
        WHERE instruction_id = ?
      `;
      await db.query(updateImageQuery, [imgBuffer, instruction_id]);

      res
        .status(200)
        .json({ message: "Instruction and image updated successfully" });
    } catch (error) {
      console.error("Error updating instruction:", error);
      res.status(500).json({ message: "Failed to update instruction" });
    }
  }
);

router.delete("/DeleteInstruction/:instruction_id", async (req, res) => {
  const { instruction_id } = req.params;

  try {
    // First delete from instruction points
    await db.query(
      "DELETE FROM iit_instruction_points WHERE instruction_id = ?",
      [instruction_id]
    );

    // Then delete from instructions
    const [result] = await db.query(
      "DELETE FROM iit_instructions WHERE instruction_id = ?",
      [instruction_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Instruction not found" });
    }

    res
      .status(200)
      .json({
        message: "Instruction and associated points deleted successfully",
      });
  } catch (error) {
    console.error("Error deleting instruction:", error);
    res.status(500).json({ error: "Failed to delete instruction" });
  }
});

module.exports = router;
