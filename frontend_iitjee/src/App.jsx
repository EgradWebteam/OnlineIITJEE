


import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from './Components/StudentDashboardFilesFolder/StudentDashboardFiles/ProtectComponent.jsx';
import { AlertProvider } from './Components/StudentDashboardFilesFolder/StudentDashboardFiles/AlertContext.jsx';
const ContactUs = React.lazy(() => import('./Components/GlobalFiles/ContactUs.jsx'));
const LandingPageIITJEE = React.lazy(() => import('./Components/LandingPagesFolder/LandingPageIITJEE.jsx'));
const OTSandORVLHomePage = React.lazy(() => import('./Components/LandingPagesFolder/OTSandORVLHomePage.jsx'));
const RegistrationGuideHomePage = React.lazy(() => import('./Components/LandingPagesFolder/RegistrationGuideHomePage.jsx'));
const StudentRegistrationeGradTutor = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLogineGradTutor/StudentRegistrationeGradTutor.jsx'));
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
const FooterTermsAndConditions = React.lazy(() => import('./Components/LandingPagesFolder/MainPageHeaderFooterFiles/FooterTermsAndConditions.jsx'));
const StudentLogineGradTutor = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentLogineGradTutor/StudentLogineGradTutor.jsx'));
const StudentDashboard = React.lazy(() => import('./Components/StudentDashboardFilesFolder/StudentDashboardFiles/StudentDashboard.jsx'));
const OTSRootFile = React.lazy(() => import('./Components/OTS/OTSRootFile.jsx'));
const OTSTerminationPage = React.lazy(() => import('./Components/OTS/OTSTerminationPage.jsx'));
const MainLayout = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminMainLayout.jsx'));
const CourseCreationTab = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/CourseCreationTab.jsx'));
const StudentInfo = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/StudentInfo.jsx'));
const GeneralInstructions = React.lazy(() => import('./Components/OTS/InstructionsFolder/GeneralInstructions.jsx'));
const PageNotFound = React.lazy(() => import('./Components/OTS/InstructionsFolder/PageNotFound.jsx'));
const ExamInstrctions = React.lazy(() => import('./Components/OTS/InstructionsFolder/ExamInstrctions.jsx'));
const AdminProfiler = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminDashboardFiles/AdminProfiler.jsx'));
const OrvlDashboard = React.lazy(() => import("./Components/AdminDasboardPagesFolder/OrvlAdminDashboard/OrvlAdminDashboard.jsx"))
const StudentReportMain = React.lazy(() => import('./Components/OTS/ResultsFolderOTS/StudentReportMain.jsx'));

import { TimerProvider } from './ContextFolder/TimerContext.jsx';
import { QuestionStatusProvider } from './ContextFolder/CountsContext.jsx';

import LoadingSpinner from './ContextFolder/LoadingSpinner.jsx';

function App() {
  return (
    <Suspense fallback={<div><LoadingSpinner/></div>}>
      <BrowserRouter>

        <AlertProvider>
            <Routes>
          <Route path="/" element={<LandingPageIITJEE />} />
          <Route path="/OTSHomePage" element={<OTSandORVLHomePage />} />
          <Route path="/ORVLHomePage" element={<OTSandORVLHomePage />} />
          <Route path="/CourseRegistrationGuide" element={<RegistrationGuideHomePage />} />
          <Route path='/LoginPage' element={<StudentLogineGradTutor />} />
          <Route path="/StudentRegistrationPage" element={<StudentRegistrationeGradTutor />} />
          <Route path="/AdminLoginPage" element={<AdminLogin />} />
          <Route
            path="/StudentDashboard/:userId"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path='/FooterTermsAndConditions' element={<FooterTermsAndConditions />} />
          <Route path='/ContactUs' element={<ContactUs />} />
          <Route path='/AdminDashboard' element={<MainLayout />} />
          <Route path='/OTSRootFile/:testId/:studentId' element={
            <QuestionStatusProvider>
            <TimerProvider>
            <OTSRootFile />
            </TimerProvider>
            </QuestionStatusProvider>
            } />
          <Route path='/OTSTerminationPage' element={<OTSTerminationPage />} />
          <Route path="/StudentInfo" element={<StudentInfo />} />
          <Route path="/CourseCreation" element={<CourseCreationTab />} />
          <Route path='/GeneralInstructions/:testId/:studentId' element={<GeneralInstructions />} />
          <Route path='/Error' element={<PageNotFound />} />
          <Route path='/ExamInstructions/:testId/:studentId' element={<ExamInstrctions />} />
          <Route path="/AdminProfiler" element={<AdminProfiler />} />
          <Route path="/OrvlDashboard" element={<OrvlDashboard />} />
          <Route path='/GeneralInstructions/:testId' element={<GeneralInstructions />} />
          <Route path='/ExamInstructions/:testId' element={<ExamInstrctions />} />
          <Route path='/OTSRootFile/:testId' element={
         <QuestionStatusProvider>
         <TimerProvider>
         <OTSRootFile />
         </TimerProvider>
         </QuestionStatusProvider>
            } />
          <Route path='/StudentReport/:testId' element={<StudentReportMain />} />
        </Routes>
        </AlertProvider>

      </BrowserRouter>
    </Suspense>
  )
}

export default App
