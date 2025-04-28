import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { userId } = useParams(); // Get userId from the URL
  const loggedInUserId = sessionStorage.getItem('userId'); 
  
  const isAuthenticated = () => {
    const sessionId = sessionStorage.getItem('sessionId');
    return !!sessionId; 
  };

  if (!isAuthenticated() || userId !== loggedInUserId) {
    return <Navigate to="/LoginPage" state={{ from: location }} replace />;
  }

  return children; 
};

export default ProtectedRoute;
