import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
 
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
 
  const sessionId = localStorage.getItem('sessionId');
 
  if (!sessionId) {
    return <Navigate to="/LoginPage" state={{ from: location }} replace />;
  }
 
  return children;
};
 
export default ProtectedRoute;