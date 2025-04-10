import express from 'express';
import db from '../config/database.js';
import Razorpay from 'razorpay';
require("dotenv").config();
const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
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
      const order = await razorpay.orders.create(options);
      res.json({ success: true, order });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  module.exports = router;
