import React, {Suspense} from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom";

const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/StudentRegistration.jsx'));
 
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
    </Routes>
    </BrowserRouter>
   </Suspense>
  )
}
 
export default App