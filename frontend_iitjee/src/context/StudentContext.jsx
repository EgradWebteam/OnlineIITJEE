import React, { createContext, useState, useContext, useEffect } from 'react';

const StudentContext = createContext();

export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);

  // 🔍 Log whenever studentData changes
  useEffect(() => {

    console.log('Updated studentData in context:', studentData);
  }, [studentData]);

   //  Load from localStorage on mount
   useEffect(() => {
    const storedData = localStorage.getItem('studentData');
    if (storedData) {
      setStudentData(JSON.parse(storedData));
    }
  }, []);

  //  Update localStorage whenever studentData changes
  useEffect(() => {
    if (studentData) {
      localStorage.setItem('studentData', JSON.stringify(studentData));
    }
  }, [studentData]);

  return (
    <StudentContext.Provider value={{ studentData, setStudentData }}>
      {children}
    </StudentContext.Provider>
  );
};
