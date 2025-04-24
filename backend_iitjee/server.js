const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require("path");

app.use(cors({
  origin: [
    "https://icy-sand-03dfe2700.6.azurestaticapps.net",
    "http://localhost:5173"
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "popup-page-status"]
}));


app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(":method :url :status :response-time ms"));

app.get("/", (req, res) => {
  res.json({ message: "Backend is working!" });
});
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true, // Enables ETag for change detection
  lastModified: true, // Uses Last-Modified timestamps
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, must-revalidate'); // 1-year caching
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()); // Fallback for old browsers
    }
  }
}));
app.get('/images/:filename', (req, res, next) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'some-dynamic-folder', filename);

  // Apply headers
  res.setHeader('Cache-Control', 'public, max-age=31536000, must-revalidate');
  res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());

  // Serve the image (local or stream from elsewhere)
  res.sendFile(filePath, err => {
    if (err) next(err);
  });
});

/**UserAuthentication*/
const adminLogin = require("./src/UserAuthentication/AdminLogin.js");
app.use("/admin", adminLogin);
const studentRegistration = require("./src/UserAuthentication/StudentAuthentication.js");
app.use("/student", studentRegistration);
const StudentInfo = require("./src/UserAuthentication/StudentInfo.js");
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
const studentBookMarks = require("./src/StudentDashboardAPIs/BookMark.js");
app.use("/studentBookMarks", studentBookMarks);

const MyResults = require("./src/StudentDashboardAPIs/MyResults.js");
app.use("/MyResults", MyResults);
const TestPaper = require("./src/StudentDashboardAPIs/TestPaper.js");
app.use("/OTS", TestPaper);
const ExamSummary = require("./src/StudentDashboardAPIs/ExamSummary.js");
app.use("/OTSExamSummary", ExamSummary);
/**StudentDashborad API's */
const OrvlTopics = require("./src/StudentDashboardAPIs/OrvlTopics.js");
app.use("/OrvlTopics", OrvlTopics);

/**EncrptDecryptAPIs */
const EncryptDecrypt = require("./src/EncryptDecryptAPIs/encryptDecryptController.js");
app.use("/EncryptDecrypt", EncryptDecrypt);
/**EncrptDecryptAPIs */

/**Payment API's */
const razorpay = require("./src/PaymentGateway/Razorpay.js");
app.use("/razorpay", razorpay);
/**Payment API's */

/**LandingPageApis */
const CourseHomePage = require("./src/LandingPageApis/CourseHomePage.js");
app.use("/CourseHomePage", CourseHomePage);
/**LandingPageApis */



const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
