// Razorpay.js

const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const Razorpay = require("razorpay");
const sendMail = require("../utils/email.js");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.VITE_RAZORPAY_KEY_SECRET,
});


router.post("/razorpay-create-order", async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || isNaN(amount) || amount < 100) {
    return res.status(400).json({
      success: false,
      error: "Order amount must be at least ₹1.00 and valid.",
    });
  }

  try {
    const options = {
      amount: Math.round(amount),
      currency: currency || "INR",
      receipt: `receipt_${Math.random().toString(36).substr(2, 9)}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const orderData = await razorpay.orders.create(options);
    res.json({ success: true, orderData });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/paymentsuccess", async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    email,
    name,
    course_name,
    studentId,
    courseId,
  } = req.body;

  console.log("Payment success data:", req.body);

  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !email ||
    !name ||
    !course_name ||
    !studentId ||
    !courseId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let connection;

  try {
    // ✅ Correct way to declare the SQL query
    const sql = `INSERT INTO iit_student_buy_courses 
      (user_purchased_time, payment_status, student_registration_id, transaction_status, course_creation_id) 
      VALUES (?, ?, ?, ?, ?)`;

    // Get a connection
    connection = await db.getConnection();

    // ✅ Ensure values match the number of `?` placeholders
    const [result] = await connection.query(sql, [
      new Date(),
      1,
      studentId,
      "paid",
      courseId,
    ]);
    const messagetext = `Dear ${name},\n\nYour payment  for the  "${course_name}" was successful.\n\nThank you for your purchase!\n\nBest regards,\neGRADTutor`;
    sendMail(email, "Payment Successful", messagetext);
    return res.status(200).json({
      message: "Payment successful",
      id: result.insertId,
    });

  } catch (error) {
    console.error("Error inserting payment data:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
router.post("/paymentfailure", async (req, res) => {
  const { email, name, course_name ,studentId,courseId } = req.body;

  console.log("Payment failure data:", req.body);
  if (!email || !name || !course_name || !studentId || !courseId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const messagetext = `Dear ${name},\n\nYour payment for the "${course_name}" was unsuccessful.\n\nPlease try again.\n\nBest regards,\neGRADTutor`;
  sendMail(email, "Payment Unsuccessful", messagetext);
  return res.status(200).json({ message: "Payment failure handled" });
})

module.exports = router;
