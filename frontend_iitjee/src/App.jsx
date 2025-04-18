// import React, {Suspense} from 'react'
// import {BrowserRouter, Routes, Route} from "react-router-dom";
// const ContactUs = React.lazy(() => import('./Components/GlobalFiles/ContactUs.jsx'));
// const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
// const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
// const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLoginFiles/studentRegistration.jsx'));
// const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
// const AdminDashboardHome  = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminDashboardHome.jsx'));
// const FooterTermsAndConditions = React.lazy(() => import('./Components/LandingPagesFolder/MainPageHeaderFooterFiles/FooterTermsAndConditions.jsx'));
// const StudentLogin= React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLoginFiles/studentLogin.jsx'));
// const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentDashboardFiles/StudentDashboard.jsx'));
// const OTSRootFile = React.lazy(() => import('./Components/OTS/OTSRootFile.jsx'));
// const DashBoard = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/DashBoard.jsx'));
// const CourseCreationTab = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/CourseCreationTab.jsx'));
// const Instruction = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/Instruction.jsx'));
// const TestCreation = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/TestCreation.jsx'));
// const DocumentUpload = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/DocumentUpload.jsx'));
// function App() {
//   return (
//    <Suspense>
//     <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<LandingPageIITJEE />} />
//       <Route path="/OTSHomePage" element={<OTSandORVLHomePage/>}/>
//       <Route path="/ORVLHomePage" element={<OTSandORVLHomePage/>}/>
//       <Route path='/LoginPage' element={<StudentLogin />} />
//       <Route path="/StudentRegistrationPage" element={<StudentRegistration />} />
//       <Route path="/AdminLoginPage" element={<AdminLogin />} />
//       <Route path="/StudentDashboard/:userId" element={<StudentDashboard />} />
//       <Route path='/FooterTermsAndConditions' element={<FooterTermsAndConditions/>}/>
//       <Route path='/ContactUs' element={<ContactUs/>}/>
//       <Route path='/AdminDashboard' element={<MainLayout/>}/>
//       <Route path='/OTSRootFile' element={<OTSRootFile/>}/>
//    <Route path="/admin/dashboard" element={<DashBoard />} />
//             <Route path="/CourseCreation" element={<CourseCreationTab />} />
//             <Route path="/admin/instruction" element={<Instruction />} />
//             <Route path="/admin/test-creation" element={<TestCreation />} />
//             <Route path="/admin/document-upload" element={<DocumentUpload />} />
//     </Routes>
//     </BrowserRouter>
//    </Suspense>
//   )
// }

// export default App



import React, {Suspense} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom";
const ContactUs = React.lazy(() => import('./Components/GlobalFiles/ContactUs.jsx'));
const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
const StudentRegistrationeGradTutor = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLogineGradTutor/StudentRegistrationeGradTutor.jsx'));
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
const AdminDashboardHome  = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminDashboardHome.jsx'));
const FooterTermsAndConditions = React.lazy(() => import('./Components/LandingPagesFolder/MainPageHeaderFooterFiles/FooterTermsAndConditions.jsx'));
const StudentLogineGradTutor = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLogineGradTutor/StudentLogineGradTutor.jsx'));
const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentDashboardFiles/StudentDashboard.jsx'));
const OTSRootFile = React.lazy(() => import('./Components/OTS/OTSRootFile.jsx'));
const MainLayout = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminMainLayout.jsx'));
const CourseCreationTab = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/CourseCreationTab.jsx'));
const StudentInfo = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/StudentInfo.jsx'));
const GeneralInstructions = React.lazy(() => import('./Components/OTS/InstructionsFolder/GeneralInstructions.jsx'));
const PageNotFound =   React.lazy(() => import('./Components/OTS/InstructionsFolder/PageNotFound.jsx'));
const ExamInstrctions =  React.lazy(() => import( './Components/OTS/InstructionsFolder/ExamInstrctions.jsx'));
const AdminProfiler=React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminProfiler.jsx'));
const OrvlDashboard=React.lazy(()=>import("./Components/AdminDasboardPagesFolder/OrvlAdminDashboard/OrvlAdminDashboard.jsx"))
const StudentReportMain  = React.lazy(()=>import('./Components/OTS/ResultsFolderOTS/StudentReportMain.jsx'));
function App() {
  return (
   <Suspense>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPageIITJEE />} />
      <Route path="/OTSHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path="/ORVLHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path='/LoginPage' element={<StudentLogineGradTutor />} />
      <Route path="/StudentRegistrationPage" element={<StudentRegistrationeGradTutor />} />
      <Route path="/AdminLoginPage" element={<AdminLogin />} />
      <Route path="/StudentDashboard/:userId" element={<StudentDashboard />} />
      <Route path='/FooterTermsAndConditions' element={<FooterTermsAndConditions/>}/>
      <Route path='/ContactUs' element={<ContactUs/>}/>
      <Route path='/AdminDashboard' element={<MainLayout/>}/>
      <Route path='/OTSRootFile/:testId/:studentId' element={<OTSRootFile/>}/>
      <Route path="/StudentInfo" element={<StudentInfo />} />
      <Route path="/CourseCreation" element={<CourseCreationTab />} />
      <Route path='/GeneralInstructions/:testId/:studentId' element={<GeneralInstructions/>}/>
      <Route path='/Error' element={<PageNotFound/>}/>
      <Route path='/ExamInstructions/:testId/:studentId' element={<ExamInstrctions/>}/>
      <Route path="/AdminProfiler" element={<AdminProfiler />} />
      <Route path="/OrvlDashboard" element={<OrvlDashboard />} />
      <Route path='/GeneralInstructions/:testId' element={<GeneralInstructions/>}/>
      <Route path='/ExamInstructions/:testId' element={<ExamInstrctions/>}/>
      <Route path='/OTSRootFile/:testId' element={<OTSRootFile/>}/>
      <Route path='/StudentReport/:testId' element={<StudentReportMain/>} />
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}
 
export default App
 