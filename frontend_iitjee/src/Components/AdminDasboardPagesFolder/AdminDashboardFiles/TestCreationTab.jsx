import React, { useState, useEffect } from "react";
import DynamicTable from "./DynamicTable.jsx";
import styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css";
import TestCreationForm from "./TestCreationForm.jsx";
import axios from "axios";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import { FaSearch } from 'react-icons/fa';
const TestCreationTab = () => {
  const [showAddTestForm, setShowAddTestForm] = useState(false);
  const [selectedTestData, setSelectedTestData] = useState(null);
  const [testCreationFormData, setTestCreationFormData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

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
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const handleActivationToggle = async (row) => {
    const {
      test_creation_table_id,
      test_activation,
      number_of_questions,
      uploaded_questions,
    } = row;

    if (number_of_questions !== uploaded_questions) {
      alert(
        "Cannot activate the test because the total questions do not match the uploaded questions."
      );
      return;
    }

    const newStatus = test_activation === "active" ? "inactive" : "active";

    try {
      const response = await axios.post(
        `${BASE_URL}/TestCreation/toggleTestStatus`,
        {
          testCreationTableId: test_creation_table_id,
          newStatus,
        }
      );

      fetchTestTableData();
    } catch (error) {
      console.error("Error toggling test status:", error);
      alert("Failed to toggle test status.");
    }
  };

  const handleDownload = (row) => {
    //console.log("Download Paper", row);
  };
  const handleAddTestClick = () => {
    setSelectedTestData(null);
    fetchFormData();
    setShowAddTestForm(true);
  };
  const handleEdit = (testData) => {
    //console.log("Selected Test Data for Edit:", testData);
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
      const response = await fetch(
        `${BASE_URL}/TestCreation/DeleteTest/${testData.test_creation_table_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Test deleted successfully!");
        // Refetch the test table data
        const updatedData = await fetch(
          `${BASE_URL}/TestCreation/FetchTestDataFortable`
        );
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
      const response = await fetch(
        `${BASE_URL}/TestCreation/FetchTestDataFortable`
      );
      const data = await response.json();
      setTestTableData(data);
    } catch (error) {
      console.error("Error fetching Testdata:", error);
    }
  };
  useEffect(() => {
    fetchTestTableData();
  }, []);
  const filteredTests = testTableData.filter(testTableData => {
    return Object.values(testTableData).some(value => 
      value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTestData = filteredTests.slice(indexOfFirstItem, indexOfLastItem);
  
 
  return (
    <div className={styles.dashboardContent}>
      <div className={styles.pageHeading}>TEST CREATION</div>
<div
        style={{ display: "flex", justifyContent: "end" }}
>  <button className={styles.addCourseBtn} onClick={handleAddTestClick}>
        Add Test
      </button></div>
    

    <div className={styles.searchBarContainer}>
          <FaSearch className={styles.searchIcon} />
           <input 
             type="text" 
             placeholder="Search tests..." 
             className={styles.searchInput}
             value={searchTerm}
             onChange={handleSearchChange} 
           />
      
   
         </div>
      {showAddTestForm && (
        <TestCreationForm
          setShowAddTestForm={setShowAddTestForm}
          testCreationFormData={testCreationFormData}
          editData={selectedTestData}
          onTestSaved={fetchTestTableData}
        />
      )}

      {/* Table for displaying test data */}
      <div style={{ padding: "3%" }} className={styles.tableWrapper}>
        <DynamicTable
          type="test"
          columns={[
            { header: "sno", accessor: "test_creation_table_id" },
            { header: "Test Name", accessor: "test_name" },
            { header: "Selected Course", accessor: "course_name" },
            { header: "Test Started", accessor: "test_start_date" },
            { header: "Test Date", accessor: "test_end_date" },
            { header: "Start Time", accessor: "test_start_time" },
            { header: "End Time", accessor: "test_end_time" },
            { header: "Total Questions", accessor: "number_of_questions" },
            { header: "Questions Uploaded", accessor: "uploaded_questions" },
          ]}
          data={currentTestData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleActivationToggle}
          onDownload={handleDownload}
        />
      </div>
      <div className={styles.pagination}>
  {Array.from({ length: Math.ceil(filteredTests.length / itemsPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={currentPage === i + 1 ? styles.pageButtonActive : styles.pageButton}
    >
      {i + 1}
    </button>
  ))}
</div>

    </div>
  );
};

export default TestCreationTab;
