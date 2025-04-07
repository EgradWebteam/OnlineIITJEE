import React, {Suspense} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import StudentLogin from './Components/StudentDashboardPagesFolder/StudentLoginpages/studentLogin.jsx';

const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentRegistration.jsx'));
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
function App() {
  return (
   <Suspense>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPageIITJEE />} />
      <Route path="/OTSHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path="/ORVLHomePage" element={<OTSandORVLHomePage/>}/>
      <Route path="/StudentRegistrationPage" element={<StudentRegistration />} />
      <Route path="/AdminLoginPage" element={<AdminLogin />} />
      <Route path="/LoginPage" element={<StudentLogin/>} /> 
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}

export default App