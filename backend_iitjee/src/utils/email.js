const nodemailer = require('nodemailer');

// Set up the email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // The sender email from environment variable
    pass: process.env.GMAIL_PASSWORD, // The password from environment variable
  },
});

// Helper function to send emails
const sendMail = (to, subject, textContent) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,  // Sender's email
    to: to,  // Recipient's email
    subject: subject,  // Subject of the email
    text: textContent,  // Content of the email
  };

  // Use setImmediate to handle sending email asynchronously
  setImmediate(() => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  });
};

module.exports = sendMail;
