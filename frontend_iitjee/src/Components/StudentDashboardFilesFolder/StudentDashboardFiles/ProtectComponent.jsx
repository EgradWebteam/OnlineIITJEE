import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
 
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
 
 
  const isAuthenticated = () => {
    const sessionId = sessionStorage.getItem('sessionId');
    return !!sessionId;
  };
 
  if (!isAuthenticated()) {
    return <Navigate to="/LoginPage" state={{ from: location }} replace />;
  }
 
  return children;
};
 
export default ProtectedRoute;