// AlertContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AlertPopup from './AlertPopup'; // your custom popup

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [resolveCallback, setResolveCallback] = useState(null);

  // Make sure this function RETURNS A PROMISE
  const alert = useCallback((message) => {
    setAlertMessage(message);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve); // Save the resolver
    });
  }, []);

  const hideAlert = () => {
    setAlertMessage(null);
    if (resolveCallback) {
      resolveCallback(); // This resolves the promise
      setResolveCallback(null);
    }
  };

  // Optional: override native window.alert globally
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = async (msg) => {
      await alert(msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [alert]);

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      {alertMessage && <AlertPopup message={alertMessage} onClose={hideAlert} />}
    </AlertContext.Provider>
  );
};
