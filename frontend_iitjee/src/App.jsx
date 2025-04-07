import React, {Suspense} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom";
const TermsAndConditions = React.lazy(() => import('./Components/GlobalFiles/TermsAndConditions.jsx'));
const ContactUs = React.lazy(() => import('./Components/GlobalFiles/ContactUs.jsx'));
const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentRegistration.jsx'));
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
const AdminDashboardHome = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/AdminDashboardHome.jsx'));
const StudentLogin= React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentLogin.jsx'));
const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardPagesFolder/studentDashboardPages/StudentDashboard.jsx'));
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
      <Route path="/StudentDashboard" element={<StudentDashboard/>}/>
      <Route path='/TermsAndConditions' element={<TermsAndConditions/>}/>
      <Route path='/ContactUs' element={<ContactUs/>}/>
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}

export default App