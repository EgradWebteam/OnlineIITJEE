import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css"; // Importing CSS module for styling

const TestCreationForm = ({
  handleSubmit,
  formErrors,
  courses,
  typeOfTests,
  handleInputChange,
  handleSelectChange,
  handleSelectTypeOfTest,
  handleDurationChange,
  handleTotalQuestionsChange,
  handleTotalMarksChange,
  setShowAddTestForm,
  testData,
}) => {
  const [includeSection, setIncludeSection] = useState(false);
  const [sections, setSections] = useState([
    {
      id: Date.now(),
      dropdownValue: "",
      sectionName: "",
      numberOfQuestions: "",
    },
  ]);

  const handleCheckboxChange = () => {
    setIncludeSection(!includeSection);
  };

  const handleSectionChange = (id, field, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(),
        dropdownValue: "",
        sectionName: "",
        numberOfQuestions: "",
      },
    ]);
  };

  const handleRemoveSection = (id) => {
    const updatedSections = sections.filter((section) => section.id !== id);
    setSections(updatedSections);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.testCreationFormContainer}>
        <form
          className={styles.testCreationForm}
          onSubmit={(e) => handleSubmit(e)}
        >
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
              <input
                type="text"
                name="testName"
                value={testData.testName}
                onChange={handleInputChange}
              />
              {formErrors.testName && (
                <span className={styles.error}>{formErrors.testName}</span>
              )}
            </div>

            {/* Course Selection */}
            <div className={styles.formGroup}>
              <label>
                Select Course <span className={styles.required}>*</span>
              </label>
              <select
                name="selectedCourse"
                value={testData.selectedCourse}
                onChange={handleSelectChange}
              >
                <option value="" disabled>
                  Select a course
                </option>
                {courses.map((course) => (
                  <option
                    key={course.courseCreationId}
                    value={course.courseCreationId}
                  >
                    {course.courseName}
                  </option>
                ))}
              </select>
              {formErrors.selectedCourse && (
                <span className={styles.error}>
                  {formErrors.selectedCourse}
                </span>
              )}
            </div>

            {/* Type of Test */}
            <div className={styles.formGroup}>
              <label>
                Type of Test <span className={styles.required}>*</span>
              </label>
              <select
                name="selectedTypeOfTest"
                value={testData.selectedTypeOfTest}
                onChange={handleSelectTypeOfTest}
              >
                <option value="" disabled>
                  Select a test type
                </option>
                {typeOfTests.map((test) => (
                  <option key={test.TypeOfTestId} value={test.TypeOfTestId}>
                    {test.TypeOfTestName}
                  </option>
                ))}
              </select>
              {formErrors.selectedTypeOfTest && (
                <span className={styles.error}>
                  {formErrors.selectedTypeOfTest}
                </span>
              )}
            </div>
            {/*     Select instructions */}
            <div className={styles.formGroup}>
              <label>
                Select instructions <span className={styles.required}>*</span>
              </label>
              <select
                name="selectedTypeOfTest"
                value={testData.selectedTypeOfTest}
                onChange={handleSelectTypeOfTest}
              >
                <option value="" disabled>
                  Select instructions
                </option>
                {/* {typeOfTests.map((test) => (
                  <option key={test.TypeOfTestId} value={test.TypeOfTestId}>
                    {test.TypeOfTestName}
                  </option>
                ))} */}
              </select>
              {/* {formErrors.selectedTypeOfTest && (
                <span className={styles.error}>
                  {formErrors.selectedTypeOfTest}
                </span>
              )} */}
            </div>

            {/* Test Date & Time */}
            <div className={styles.formGroup}>
              <label>
                Start Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={testData.startDate}
                onChange={handleInputChange}
              />
              {formErrors.startDate && (
                <span className={styles.error}>{formErrors.startDate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>
                End Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={testData.endDate}
                onChange={handleInputChange}
              />
              {formErrors.endDate && (
                <span className={styles.error}>{formErrors.endDate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>
                Start Time <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={testData.startTime}
                onChange={handleInputChange}
              />
              {formErrors.startTime && (
                <span className={styles.error}>{formErrors.startTime}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>
                End Time <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={testData.endTime}
                onChange={handleInputChange}
              />
              {formErrors.endTime && (
                <span className={styles.error}>{formErrors.endTime}</span>
              )}
            </div>
            {/*Option Pattern*/}
            <div className={styles.formGroup}>
              <label>
                Select Option pattern <span className={styles.required}>*</span>
              </label>
              <select
                name="selectedTypeOfTest"
                // value={testData.selectedTypeOfTest}
                // onChange={handleSelectTypeOfTest}
              >
                <option value="" disabled>
                  Select a option pattern
                </option>
                {/* {typeOfTests.map((test) => (
                  <option key={test.TypeOfTestId} value={test.TypeOfTestId}>
                    {test.TypeOfTestName}
                  </option>
                ))} */}
              </select>
              {/* {formErrors.selectedTypeOfTest && <span className={styles.error}>{formErrors.selectedTypeOfTest}</span>} */}
            </div>
            {/* Duration */}
            <div className={styles.formGroup}>
              <label>
                Duration (in minutes) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={testData.duration}
                onChange={handleDurationChange}
                min="1"
                max="300"
              />
              {formErrors.duration && (
                <span className={styles.error}>{formErrors.duration}</span>
              )}
            </div>

            {/* Total Questions */}
            <div className={styles.formGroup}>
              <label>
                Total Questions <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="totalQuestions"
                value={testData.totalQuestions}
                onChange={handleTotalQuestionsChange}
                min="1"
                max="200"
              />
              {formErrors.totalQuestions && (
                <span className={styles.error}>
                  {formErrors.totalQuestions}
                </span>
              )}
            </div>

            {/* Total Marks */}
            <div className={styles.formGroup}>
              <label>
                Total Marks <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="totalMarks"
                value={testData.totalMarks}
                onChange={handleTotalMarksChange}
                min="1"
                max="1000"
              />
              {formErrors.totalMarks && (
                <span className={styles.error}>{formErrors.totalMarks}</span>
              )}
            </div>
            <div style={{ margin: "1rem 0" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input type="checkbox" onChange={handleCheckboxChange} />
                Click here if you want to include any section in the test
              </label>

              {includeSection && (
                <div>
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        margin: "10px 0",
                      }}
                    >
                      <div style={{ marginBottom: "10px" }}>
                        <label>Choose Section Type: </label>
                        <select
                          value={section.dropdownValue}
                          onChange={(e) =>
                            handleSectionChange(
                              section.id,
                              "dropdownValue",
                              e.target.value
                            )
                          }
                        >
                          <option value="">-- Select --</option>
                          <option value="math">Math</option>
                          <option value="science">Science</option>
                          <option value="reasoning">Reasoning</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>Section Name: </label>
                        <input
                          type="text"
                          value={section.sectionName}
                          onChange={(e) =>
                            handleSectionChange(
                              section.id,
                              "sectionName",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>No. of Questions: </label>
                        <input
                          type="number"
                          value={section.numberOfQuestions}
                          onChange={(e) =>
                            handleSectionChange(
                              section.id,
                              "numberOfQuestions",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      
              <div>
                {sections.length > 1 && (
                  <button
                    onClick={() => handleRemoveSection(section.id)}
                 
                  >
                    − Remove
                  </button>
                )}
                {index === sections.length - 1 && (
                  <button
                    onClick={handleAddSection}
                   
                  >
                    + Add
                  </button>
                )}
              </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <button type="submit" className={styles.submitBtn}>
                Create Test
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreationForm;
