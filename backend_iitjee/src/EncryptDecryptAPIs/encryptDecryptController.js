const express = require("express");
const crypto = require("crypto");
const router = express.Router();

require("dotenv").config();

const algorithm = "aes-256-cbc";
const ivLength = 16;
const secretKey = crypto.createHash("sha256").update(process.env.SECRET_KEY || "myKey12").digest();

// In-memory short code store (use DB/Redis in production)
const shortCodeStore = new Map();

// Helper to encrypt a string
const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf-8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Helper to decrypt a string
const decrypt = (encryptedText) => {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Generate a random 5-character short token
const generateShortCode = () => {
  return crypto.randomBytes(3).toString("base64").replace(/[^a-zA-Z0-9]/g, "").substring(0, 5);
};

// Batch Encrypt and Store Short Code
router.post("/encrypt", (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: "texts must be a non-empty array" });
    }

    const response = texts.map((text) => {
      const encrypted = encrypt(text);
      const shortCode = generateShortCode();

      // Ensure uniqueness (retry if collision occurs)
      let retryCount = 0;
      while (shortCodeStore.has(shortCode) && retryCount < 5) {
        shortCode = generateShortCode();
        retryCount++;
      }

      shortCodeStore.set(shortCode, encrypted);
      return shortCode;
    });

    res.json({ shortCodes: response });
  } catch (error) {
    console.error("Batch encryption error:", error);
    res.status(500).json({ error: "Encryption error" });
  }
});

// Batch Decrypt using Short Codes
router.post("/decrypt", (req, res) => {
  try {
    const { shortCodes } = req.body;

    if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
      return res.status(400).json({ error: "shortCodes must be a non-empty array" });
    }

    const decryptedArray = shortCodes.map((code) => {
      const encryptedText = shortCodeStore.get(code);
      if (!encryptedText) throw new Error(`Invalid short code: ${code}`);
      return decrypt(encryptedText);
    });

    res.json({ decryptedArray });
  } catch (error) {
    console.error("Batch decryption error:", error.message);
    res.status(500).json({ error: "Decryption error" });
  }
});

module.exports = router;
