import React, { useState } from 'react';
import DynamicTable from './DynamicTable'; // Ensure you have this component
import styles from '../../../Styles/AdminDashboardCSS/CourseCreation.module.css'; // Importing CSS module for styling
import { FaSearch } from 'react-icons/fa';
import TestCreationForm from './TestCreationForm'; // Import TestCreationForm component

const TestCreation = () => {
  const [showAddTestForm, setShowAddTestForm] = useState(false);
  const [tests, setTests] = useState([]); // State to hold the test data
  const [testData, setTestData] = useState({
    testName: '',
    selectedCourse: '',
    testDate: '',
    startTime: '',
    endTime: '',
    totalQuestions: '',
    questionsUploaded: ''
  });

  const [search, setSearch] = useState("");

  // Form Handlers
  const handleInputChange = (e) => {
    setTestData({
      ...testData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTest = {
      serial: tests.length + 1,
      ...testData,
      testStarted: "No", // Set as "No" or "Yes" based on your logic
      actions: 'Edit | Delete', // Placeholder for actions
      testActivation: 'Inactive' // Placeholder for activation status
    };
    setTests([...tests, newTest]);
    setShowAddTestForm(false); // Close the form after adding the test
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleAddTestClick = () => {
    setShowAddTestForm(true);
  };

  const handleCloseForm = () => {
    setShowAddTestForm(false);
  };

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.pageHeading}>TEST CREATION</div>

      <button className={styles.addCourseBtn} onClick={handleAddTestClick}>
        Add Test
      </button>

      {/* Conditionally render the Add Test Form */}
      {showAddTestForm && (
        <TestCreationForm
          handleSubmit={handleSubmit}
          formErrors={{}} 
          courses={[]} 
          typeOfTests={[]} 
          handleInputChange={handleInputChange}
          handleSelectChange={() => {}}
          handleSelectTypeOfTest={() => {}} 
          handleDurationChange={() => {}} 
          handleTotalQuestionsChange={() => {}} 
          handleTotalMarksChange={() => {}} 
          setShowAddTestForm={setShowAddTestForm}
          testData={testData}
        />
      )}

      {/* Table for displaying test data */}
      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={[
            { header: 'S.No', accessor: 'serial' },
            { header: 'Test Name', accessor: 'testName' },
            { header: 'Selected Course', accessor: 'selectedCourse' },
            { header: 'Test Started', accessor: 'testStarted' },
            { header: 'Test Date', accessor: 'testDate' },
            { header: 'Start Time', accessor: 'startTime' },
            { header: 'End Time', accessor: 'endTime' },
            { header: 'Total Questions', accessor: 'totalQuestions' },
            { header: 'Questions Uploaded', accessor: 'questionsUploaded' },
            { header: 'Actions', accessor: 'actions' },
            { header: 'Test Activation', accessor: 'testActivation' }
          ]}
          data={tests}
          onEdit={(item) => console.log('Edit', item)}
          onDelete={(item) => console.log('Delete', item)}
          onToggle={(item) => console.log('Toggle Activation', item)}
        />
      </div>
    </div>
  );
};

export default TestCreation;
