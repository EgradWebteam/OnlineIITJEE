
require('dotenv').config();
const { S3Client,PutObjectCommand } = require("@aws-sdk/client-s3");
const { ListBucketsCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
async function testConnection() {
  try {
    const result = await s3.send(new ListBucketsCommand());
    console.log("Connected to S3. Buckets:", result.Buckets);
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();
module.exports = {
    s3,
    PutObjectCommand,
  };