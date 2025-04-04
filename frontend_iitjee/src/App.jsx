import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Lazily load components
const AdminLogin = React.lazy(() => import('./Components/AdminDasboardPagesFolder/AdminLoginPages/AdminLogin.jsx'));
const StudentLogin = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentLogin.jsx'));
const StudentRegistration = React.lazy(() => import('./Components/StudentDashboardPagesFolder/StudentLoginpages/studentRegistration.jsx'));
const AdminDashboardHome = React.lazy(() => import('./Components/AdminDasboardPagesFolder/adminDashboardPages/AdminDashboardHome.jsx'));
function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-registration" element={<StudentRegistration />} />
          <Route path="/admin-dashboard" element={<AdminDashboardHome />} />

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
