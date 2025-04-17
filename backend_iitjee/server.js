const express = require("express");
const cors = require("cors");

require("dotenv").config();
const db = require("./src/config/database.js"); 
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req, res)=> {
    res.json({message: "Backend is working!"});
});
/**UserAuthentication*/
const adminLogin = require("./src/UserAuthentication/AdminLogin.js");
app.use("/admin", adminLogin);
const studentRegistration = require("./src/UserAuthentication/StudentAuthentication.js");
app.use("/student", studentRegistration);
const StudentInfo = require('./src/UserAuthentication/StudentInfo.js')
app.use("/studentInfo", StudentInfo);
/**UserAuthentication*/


/**AdminDashborad API's */
const CourseCreationTab = require("./src/AdminDashboardAPIs/CourseCreationTab.js");
app.use("/CourseCreation", CourseCreationTab);
const InstructionsTab = require("./src/AdminDashboardAPIs/InstructionsTab.js");
app.use("/Instructions", InstructionsTab); 
const OrvlTopicCreationTab = require("./src/AdminDashboardAPIs/OrvlTopicCreation.js");
app.use("/OrvlTopicCreation", OrvlTopicCreationTab);
const TestCreationTab = require("./src/AdminDashboardAPIs/TestCreationTab.js");
app.use("/TestCreation", TestCreationTab);
const TestPaperDocumentUpload = require("./src/AdminDashboardAPIs/TestPaperDocumentUpload.js");
app.use("/DocumentUpload", TestPaperDocumentUpload);
/**AdminDashborad API's */


/**StudentDashborad API's */
const studentbuycourses = require("./src/StudentDashboardAPIs/BuyCourses.js");
app.use("/studentbuycourses", studentbuycourses); 
const studentMycourses = require("./src/StudentDashboardAPIs/MyCourses.js");
app.use("/studentmycourses", studentMycourses);
app.use("/CourseCreation", CourseCreationTab); 
const MyResults = require("./src/StudentDashboardAPIs/MyResults.js");
app.use("/MyResults", MyResults);
const TestPaper = require("./src/StudentDashboardAPIs/TestPaper.js");
app.use("/OTS", TestPaper);
const ExamSummary = require("./src/StudentDashboardAPIs/ExamSummary.js");
app.use("/OTSExamSummary", ExamSummary);
/**StudentDashborad API's */


/**EncrptDecryptAPIs */
const EncryptDecrypt = require("./src/EncryptDecryptAPIs/encryptDecryptController.js");
app.use("/EncryptDecrypt", EncryptDecrypt)
/**EncrptDecryptAPIs */

/**Payment API's */
const razorpay = require("./src/PaymentGateway/Razorpay.js");
app.use("/razorpay", razorpay); 
/**Payment API's */

/**LandingPageApis */
const CourseHomePage = require('./src/LandingPageApis/CourseHomePage.js')
app.use("/CourseHomePage", CourseHomePage);
/**LandingPageApis */


app.get("/",(req, res)=> {
    res.json({message: "Backend is working!"});
});

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));