import React, { useState, useEffect } from "react";
import DynamicTable from "./DynamicTable"; // Ensure you have this component
import styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css";
// import { FaSearch } from 'react-icons/fa';
import TestCreationForm from "./TestCreationForm"; // Import TestCreationForm component
import axios from "axios";
import { BASE_URL } from "../../../../apiConfig";

const TestCreationTab = () => {
  const [showAddTestForm, setShowAddTestForm] = useState(false);

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

  // Called on button click
  const handleAddTestClick = () => {
    setShowAddTestForm(true);
    fetchFormData(); // Fetch data only when button is clicked
  };

  const [testTableData, setTestTableData] = useState([]);
  useEffect(() => {
    fetch(`${BASE_URL}/TestCreation/FetchTestDataFortable`)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data); // Log the full response to inspect
        setTestTableData(data); // Ensure that data.data is correct
      })
      .catch((error) => console.error("Error fetching Testdata:", error));
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
        />
      )}

      {/* Table for displaying test data */}
      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={[
            { header: "S.No", accessor: "serial" },
            { header: "Test Name", accessor: "test_name" },
            { header: "Selected Course", accessor: "course_name" },
            { header: "Test Started", accessor: "test_started" },
            { header: "Test Date", accessor: "test_start_date" },
            { header: "Start Time", accessor: "test_start_time" },
            { header: "End Time", accessor: "test_end_time" },
            { header: "Total Questions", accessor: "number_of_questions" },
            { header: "Questions Uploaded", accessor: "uploaded_questions" },
            { header: "Actions", accessor: "actions" },
            { header: "Test Activation", accessor: "test_activation" },
          ]}
          data={testTableData}
          onEdit={(item) => console.log("Edit", item)}
          onDelete={(item) => console.log("Delete", item)}
          onToggle={(item) => console.log("Toggle Activation", item)}
        />
      </div>
    </div>
  );
};

export default TestCreationTab;
