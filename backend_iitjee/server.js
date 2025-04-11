const express = require("express");
const cors = require("cors");

require("dotenv").config();
const db = require("./src/config/database.js"); // Ensure this path is correct
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req, res)=> {
    res.json({message: "Backend is working!"});
});
const adminLogin = require("./src/UserAuthentication/AdminLogin.js");
app.use("/admin", adminLogin);

const studentRegistration = require("./src/UserAuthentication/StudentAuthentication.js");
app.use("/student", studentRegistration);


const CourseCreationTab = require("./src/AdminDashboardAPIs/CourseCreationTab");
app.use("/CourseCreation", CourseCreationTab); // ✅ route mount point
const studentbuycourses = require("./src/StudentDashboardAPIs/BuyCourses.js");
app.use("/studentbuycourses", studentbuycourses); // ✅ route mount point
const studentMycourses = require("./src/StudentDashboardAPIs/MyCourses.js");
app.use("/studentmycourses", studentMycourses);
app.use("/CourseCreation", CourseCreationTab); 


const InstructionsTab = require("./src/AdminDashboardAPIs/InstructionsTab");
app.use("/Instructions", InstructionsTab); 

const TestCreationTab = require("./src/AdminDashboardAPIs/TestCreationTab");
app.use("/TestCreation", TestCreationTab);

const TestPaperDocumentUpload = require("./src/AdminDashboardAPIs/TestPaperDocumentUpload");
app.use("/DocumentUpload", TestPaperDocumentUpload);

const TestPaper = require("./src/StudentDashboardAPIs/TestPaper");
app.use("/OTS", TestPaper);

const EncryptDecrypt = require("./src/EncryptDecryptAPIs/encryptDecryptController.js");
app.use("/EncryptDecrypt", EncryptDecrypt)

const StudentInfo = require('./src/UserAuthentication/StudentInfo.js')
app.use("/students", StudentInfo);
const CourseHomePage = require('./src/LandingPageApis/CourseHomePage.js')
app.use("/CourseHomePage", CourseHomePage);
app.get("/",(req, res)=> {
    res.json({message: "Backend is working!"});
});
const razorpay = require("./src/PaymentGateway/Razorpay.js");
app.use("/razorpay", razorpay); // ✅ route mount point
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));