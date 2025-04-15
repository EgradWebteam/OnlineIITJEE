import React, { createContext, useState, useContext, useEffect } from 'react';

const StudentContext = createContext();

export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(null);

  // 🔍 Log whenever studentData changes
  useEffect(() => {

    console.log('Updated studentData in context:', studentData);
  }, [studentData]);

  return (
    <StudentContext.Provider value={{ studentData, setStudentData }}>
      {children}
    </StudentContext.Provider>
  );
};
