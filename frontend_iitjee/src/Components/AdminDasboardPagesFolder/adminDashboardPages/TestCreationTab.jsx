import React, { useState, useEffect } from "react";
import DynamicTable from "./DynamicTable"; // Ensure you have this component
import styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css";
// import { FaSearch } from 'react-icons/fa';
import TestCreationForm from "./TestCreationForm"; // Import TestCreationForm component
import axios from "axios";
import { BASE_URL } from "../../../../apiConfig";

const TestCreationTab = () => {
  const [showAddTestForm, setShowAddTestForm] = useState(false);
  const [selectedTestData, setSelectedTestData] = useState(null);
  const [testCreationFormData, setTestCreationFormData] = useState(null);

  // API fetch function
  const fetchFormData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/TestCreation/TestCreationFormData`
      );
      setTestCreationFormData(response.data);
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };

  
  const handleToggle = (row) => {
    console.log("Toggle Activation", row);
  };
  
  const handleAssign = (row) => {
    console.log("Assign to Test", row);
  };
  
  const handleDownload = (row) => {
    console.log("Download Paper", row);
  };
  const handleAddTestClick = () => {
    setShowAddTestForm(true);
    fetchFormData(); 
  };
  const handleEdit = (testData) => {
    console.log("Selected Test Data for Edit:", testData); 
    setSelectedTestData(testData); 
    fetchFormData(); 
    setShowAddTestForm(true);
  };
  
  const handleDelete = async (testData) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the test "${testData.test_name}"?`
    );
  
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`${BASE_URL}/TestCreation/DeleteTest/${testData.test_creation_table_id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Test deleted successfully!");
        // Refetch the test table data
        const updatedData = await fetch(`${BASE_URL}/TestCreation/FetchTestDataFortable`);
        const data = await updatedData.json();
        setTestTableData(data);
      } else {
        const errorData = await response.json();
        alert(`Error deleting test: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("An error occurred while trying to delete the test.");
    }
  };
  
  const [testTableData, setTestTableData] = useState([]);
  const fetchTestTableData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/TestCreation/FetchTestDataFortable`);
      const data = await response.json();
      setTestTableData(data);
    } catch (error) {
      console.error("Error fetching Testdata:", error);
    }
  };
  useEffect(() => {
    fetchTestTableData();
  }, []);
    

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.pageHeading}>TEST CREATION</div>

      <button className={styles.addCourseBtn} onClick={handleAddTestClick}>
        Add Test
      </button>

      {/* Conditionally render the Add Test Form */}
      {showAddTestForm && (
        <TestCreationForm
          setShowAddTestForm={setShowAddTestForm}
          testCreationFormData={testCreationFormData}
          editData={selectedTestData} 
          onTestSaved={fetchTestTableData}
        />
      )}


      {/* Table for displaying test data */}
      <div  style={{padding:"3%"}} className={styles.tableWrapper}>
      <DynamicTable
  type="testCreation" // this activates the dropdown with test-related actions
  columns={[
    { header: "S.No", accessor: "serial" },
    { header: "Test Name", accessor: "test_name" },
    { header: "Selected Course", accessor: "course_name" },
    { header: "Test Started", accessor: "test_start_date" },
    { header: "Test Date", accessor: "test_end_date" },
    { header: "Start Time", accessor: "test_start_time" },
    { header: "End Time", accessor: "test_end_time" },
    { header: "Total Questions", accessor: "number_of_questions" },
    { header: "Questions Uploaded", accessor: "uploaded_questions" },

  ]}
  data={testTableData} // array of test data
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggle={handleToggle}
  onAssign={handleAssign}
  onDownload={handleDownload}
/>

      </div>
    </div>
  );
};

export default TestCreationTab;
