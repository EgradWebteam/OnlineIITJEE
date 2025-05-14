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

  const verifySession = async () => {
    const localSessionId = localStorage.getItem("sessionId");
    const sessionSessionId = sessionStorage.getItem("sessionId");
    const studentId = localStorage.getItem("decryptedId");
    if (!localSessionId || !sessionSessionId || localSessionId !== sessionSessionId) {
      setIsSessionValid(false);
 const navigationToken = sessionStorage.getItem('navigationToken');
if (navigationToken) {
   alert("Logout")
 
    const channel = new BroadcastChannel('session_channel');
channel.postMessage({ type: 'LOGOUT' });
channel.close();
   window.close();
  } else {
    navigate("/LoginPage");
  }
     
      return;
    }

    try {
      const navigationToken = sessionStorage.getItem('navigationToken');
      const response = await fetch(`${BASE_URL}/student/verifySession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, sessionId: localSessionId }),
      });

      const data = await response.json();

    
      if (!data.success) {
        setIsSessionValid(false);
        
      if (navigationToken) {
    const channel = new BroadcastChannel('session_channel');
channel.postMessage({ type: 'LOGOUT' });
channel.close();
   window.close();
  } else {
    navigate("/LoginPage");
  }
      } else {
        setIsSessionValid(true); 
      }
    } catch (err) {
      console.error("Session check failed", err);
      setIsSessionValid(false);
      
   if (navigationToken) {
   alert("Logout")
     const channel = new BroadcastChannel('session_channel');
channel.postMessage({ type: 'LOGOUT' });
channel.close();
   window.close();
  } else {
    navigate("/LoginPage");
  }
    }
  };
  useEffect(() => {
    verifySession();
  }, [navigate]); 
  const handleLogout = async () => {
   
        const sessionId = localStorage.getItem("sessionId");
     
        if (!sessionId) {
           await alert("No session found. Please log in again.", "error");
          navigate("/LoginPage");
          return;
        }
     
        try {
          const response = await fetch(`${BASE_URL}/student/studentLogout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });
     
          const data = await response.json();
          if (response.ok) {
            localStorage.clear();  
            navigate("/LoginPage");
          } else {
            await alert("No session found. Please log in again.", "error");
          }
        } catch (error) {
          //console.error("Logout error:", error);
        }
      };
     
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
