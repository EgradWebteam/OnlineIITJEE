// import React, {Suspense} from 'react'
// import {BrowserRouter, Routes, Route} from "react-router-dom";
// const ContactUs = React.lazy(() => import('./Components/GlobalFiles/ContactUs.jsx'));
// const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
// const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
// const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentRegistration.jsx'));
// const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
// const AdminDashboardHome  = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/AdminDashboardHome.jsx'));
// const FooterTermsAndConditions = React.lazy(() => import('./Components/LandingPagesFolder/mainPageHeaderFooterFolder/FooterTermsAndConditions.jsx'));
// const StudentLogin= React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentLogin.jsx'));
// const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardPagesFolder/studentDashboardPages/StudentDashboard.jsx'));
// const OTSRootFile = React.lazy(() => import('./Components/OTS/OTSRootFile.jsx'));
// const DashBoard = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/DashBoard.jsx'));
// const CourseCreationTab = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/CourseCreationTab.jsx'));
// const Instruction = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/Instruction.jsx'));
// const TestCreation = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/TestCreation.jsx'));
// const DocumentUpload = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/DocumentUpload.jsx'));
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
const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentRegistration.jsx'));
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
const AdminDashboardHome  = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/AdminDashboardHome.jsx'));
const FooterTermsAndConditions = React.lazy(() => import('./Components/LandingPagesFolder/mainPageHeaderFooterFolder/FooterTermsAndConditions.jsx'));
const StudentLogin= React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentLogin.jsx'));
const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardPagesFolder/studentDashboardPages/StudentDashboard.jsx'));
const OTSRootFile = React.lazy(() => import('./Components/OTS/OTSRootFile.jsx'));
const MainLayout = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/AdminMainLayout.jsx'));
const CourseCreationTab = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/CourseCreationTab.jsx'));

function App() {
  return (
   <Suspense>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPageIITJEE />} />
      <Route path="/OTSHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path="/ORVLHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path='/LoginPage' element={<StudentLogin />} />
      <Route path="/StudentRegistrationPage" element={<StudentRegistration />} />
      <Route path="/AdminLoginPage" element={<AdminLogin />} />
      <Route path="/StudentDashboard/:userId" element={<StudentDashboard />} />
      <Route path='/FooterTermsAndConditions' element={<FooterTermsAndConditions/>}/>
      <Route path='/ContactUs' element={<ContactUs/>}/>
      <Route path='/AdminDashboard' element={<MainLayout/>}/>
      <Route path='/OTSRootFile' element={<OTSRootFile/>}/>
      <Route path="/CourseCreation" element={<CourseCreationTab />} />
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}
 
export default App
 