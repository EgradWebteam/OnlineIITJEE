import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import { BASE_URL } from "../../../../apiConfig";
import axios from "axios";

const TestCreationForm = ({ setShowAddTestForm, testCreationFormData }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [includeSection, setIncludeSection] = useState(false);
  const [subjects, setSubjects] = useState([]);

  const handleCheckboxChange = () => {
    setIncludeSection(!includeSection);
  };

  const [subjectSections, setSubjectSections] = useState([
    { selectedSubject: "", sectionName: "", numOfQuestions: "" },
  ]);

  const handleSubjectSectionChange = (index, field, value) => {
    const updatedSections = [...subjectSections];
    updatedSections[index][field] = value;
    setSubjectSections(updatedSections);
  };

  const addSubjectSection = () => {
    setSubjectSections([
      ...subjectSections,
      { selectedSubject: "", sectionName: "", numOfQuestions: "" },
    ]);
  };

  const removeSubjectSection = () => {
    if (subjectSections.length > 1) {
      setSubjectSections(subjectSections.slice(0, -1));
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Collect form data
    const formData = {
      testName: e.target.testName.value,
      selectedCourse: e.target.selectedCourse.value,
      selectedTypeOfTest: e.target.selectedTypeOfTest.value,
      selectedInstruction: e.target.selectedInstruction.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      startTime: e.target.startTime.value,
      endTime: e.target.endTime.value,
      selectedOptionPattern: e.target.selectedOptionPattern.value,
      duration: e.target.duration.value,
      totalQuestions: e.target.totalQuestions.value,
      totalMarks: e.target.totalMarks.value,
      sections: subjectSections.map((section) => ({
        subjectId: section.selectedSubject,
        sectionName: section.sectionName,
        numOfQuestions: section.numOfQuestions,
      })),
    };
    console.log("formData", formData);
    // Make a POST request to the server to insert the test data
    try {
      const response = await fetch(`${BASE_URL}/TestCreation/CreateTest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("formData", formData);
      if (response.ok) {
        // Handle success response
        alert("Test created successfully!");
        setShowAddTestForm(false); // Close the form
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error while submitting the form.");
    }
    console.log("formData", formData);
  };
  // Function to fetch subjects based on selected course
  const handleCourseChange = async (e) => {
    const selectedCourseId = e.target.value;
    setSelectedCourse(selectedCourseId); // Update the selected course state

    if (selectedCourseId) {
      try {
        const response = await axios.get(
          `${BASE_URL}/TestCreation/CourseSubjects/${selectedCourseId}`
        );
        setSubjects(response.data.subjects); // Assuming response.data.subjects contains the subjects array
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setSubjects([]); // Reset subjects if there's an error
      }
    } else {
      setSubjects([]); // Reset subjects if no course is selected
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.testCreationFormContainer}>
        <form className={styles.testCreationForm} onSubmit={handleFormSubmit}>
          <div className={styles.formHeader}>
            <h3>Create a New Test</h3>
            <button
              type="button"
              className={styles.closeFormBtn}
              onClick={() => setShowAddTestForm(false)}
            >
              <RxCross2 />
            </button>
          </div>

          {/* Grid Layout for the Form */}
          <div className={styles.gridForm}>
            {/* Test Name */}
            <div className={styles.formGroup}>
              <label>
                Test Name <span className={styles.required}>*</span>
              </label>
              <input type="text" name="testName" required />
            </div>

            {/* Course Selection */}
            <div className={styles.formGroup}>
              <label>
                Select Course <span className={styles.required}>*</span>
              </label>
              <select
                name="selectedCourse"
                value={selectedCourse}
                onChange={handleCourseChange}
                required
              >
                <option value="">Select a course</option>
                {testCreationFormData &&
                  testCreationFormData.courses &&
                  testCreationFormData.courses.map((course) => (
                    <option
                      key={course.course_creation_id}
                      value={course.course_creation_id}
                    >
                      {course.course_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Type of Test */}
            <div className={styles.formGroup}>
              <label>
                Type of Test <span className={styles.required}>*</span>
              </label>
              <select name="selectedTypeOfTest" required>
                <option value="">Select a test type</option>
                {testCreationFormData &&
                  testCreationFormData.testTypes &&
                  testCreationFormData.testTypes.map((test) => (
                    <option
                      key={test.type_of_test_id}
                      value={test.type_of_test_id}
                    >
                      {test.type_of_test_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Select instructions */}
            <div className={styles.formGroup}>
              <label>
                Select instructions <span className={styles.required}>*</span>
              </label>
              <select name="selectedInstruction" required>
                <option value="">Select instructions</option>
                {testCreationFormData &&
                  testCreationFormData.instructions &&
                  testCreationFormData.instructions.map((inst) => (
                    <option
                      key={inst.instruction_id}
                      value={inst.instruction_id}
                    >
                      {inst.instruction_heading}
                    </option>
                  ))}
              </select>
            </div>

            {/* Test Date & Time */}
            <div className={styles.formGroup}>
              <label>
                Start Date <span className={styles.required}>*</span>
              </label>
              <input type="date" name="startDate" required />
            </div>

            <div className={styles.formGroup}>
              <label>
                End Date <span className={styles.required}>*</span>
              </label>
              <input type="date" name="endDate" required />
            </div>

            <div className={styles.formGroup}>
              <label>
                Start Time <span className={styles.required}>*</span>
              </label>
              <input type="time" name="startTime" required />
            </div>

            <div className={styles.formGroup}>
              <label>
                End Time <span className={styles.required}>*</span>
              </label>
              <input type="time" name="endTime" required />
            </div>

            {/* Option Pattern */}
            <div className={styles.formGroup}>
              <label>
                Select Option pattern <span className={styles.required}>*</span>
              </label>
              <select name="selectedOptionPattern" required>
                <option value="">Select an option pattern</option>
                {testCreationFormData &&
                  testCreationFormData.optionPatterns &&
                  testCreationFormData.optionPatterns.map((pattern) => (
                    <option
                      key={pattern.options_pattern_id}
                      value={pattern.options_pattern_id}
                    >
                      {pattern.options_pattern_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <label>
                Duration (in minutes) <span className={styles.required}>*</span>
              </label>
              <input type="number" name="duration" min="1" max="300" required />
            </div>

            {/* Total Questions */}
            <div className={styles.formGroup}>
              <label>
                Total Questions <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="totalQuestions"
                min="1"
                max="200"
                required
              />
            </div>

            {/* Total Marks */}
            <div className={styles.formGroup}>
              <label>
                Total Marks <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="totalMarks"
                min="1"
                max="1000"
                required
              />
            </div>

            {/* Sections */}
            <div style={{ margin: "1rem 0" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input type="checkbox" onChange={handleCheckboxChange} />
                Click here if you want to include any section in the test
              </label>

              <div>
                <div>
                  {subjectSections.map((section, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "20px",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={{ marginBottom: "10px" }}>
                        <label>Select a subject: </label>
                        <select
                          name="selectedSubject"
                          value={section.selectedSubject}
                          onChange={(e) =>
                            handleSubjectSectionChange(
                              index,
                              "selectedSubject",
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">Select a subject</option>
                          {subjects.length > 0 ? (
                            subjects.map((subject) => (
                              <option
                                key={subject.subject_id}
                                value={subject.subject_id}
                              >
                                {subject.subject_name}
                              </option>
                            ))
                          ) : (
                            <option value="no-subjects">
                              No subjects available
                            </option>
                          )}
                        </select>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>Enter Section Name: </label>
                        <input
                          type="text"
                          name="sectionName"
                          value={section.sectionName}
                          onChange={(e) =>
                            handleSubjectSectionChange(
                              index,
                              "sectionName",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>No. of Questions: </label>
                        <input
                          type="number"
                          name="numOfQuestions"
                          min={1}
                          value={section.numOfQuestions}
                          onChange={(e) =>
                            handleSubjectSectionChange(
                              index,
                              "numOfQuestions",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: "10px" }}>
                    <button type="button" onClick={addSubjectSection}>
                      +
                    </button>
                    <button type="button" onClick={removeSubjectSection}>
                      -
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreationForm;
