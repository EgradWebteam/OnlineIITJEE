import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';  
const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [isSessionValid, setIsSessionValid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
const closeTestWindowIfOpen = () => {
  if (window.testWindowRef && !window.testWindowRef.closed) {
    window.testWindowRef.close();
    window.testWindowRef = null;
  }
};
  const verifySession = async () => {
    const localSessionId = localStorage.getItem("sessionId");
    const sessionSessionId = sessionStorage.getItem("sessionId");
    const studentId = localStorage.getItem("decryptedId");
    if (!localSessionId || !sessionSessionId || localSessionId !== sessionSessionId) {
      setIsSessionValid(false);
      closeTestWindowIfOpen();
      navigate("/LoginPage");
      return;
    }

    try {
     
      const response = await fetch(`${BASE_URL}/student/verifySession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, sessionId: localSessionId }),
      });

      const data = await response.json();

    
      if (!data.success) {
        setIsSessionValid(false);
          closeTestWindowIfOpen();
        navigate("/LoginPage");
      } else {
        setIsSessionValid(true); 
      }
    } catch (err) {
      console.error("Session check failed", err);
      setIsSessionValid(false);
        closeTestWindowIfOpen();
      navigate("/LoginPage"); 
    }
  };
  useEffect(() => {
    verifySession();
  }, [navigate]); 
  useEffect(() => {
    const handleUserClick = () => {
      verifySession();
    }
    window.addEventListener("click", handleUserClick);

   
    return () => {
      window.removeEventListener("click", handleUserClick);
    };
  }, []); 

  return (
    <SessionContext.Provider value={{ isSessionValid, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};
