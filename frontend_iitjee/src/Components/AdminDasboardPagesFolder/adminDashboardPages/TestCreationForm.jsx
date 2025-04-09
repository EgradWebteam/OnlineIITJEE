import React from "react";
import { RxCross2 } from "react-icons/rx";
import styles from '../../../Styles/AdminDashboardCSS/TestCreation.module.css'; // Importing CSS module for styling

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
  testData
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.testCreationFormContainer}>
        <form className={styles.testCreationForm} onSubmit={(e) => handleSubmit(e)}>
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
              <label>Test Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="testName"
                value={testData.testName}
                onChange={handleInputChange}
              />
              {formErrors.testName && <span className={styles.error}>{formErrors.testName}</span>}
            </div>

            {/* Course Selection */}
            <div className={styles.formGroup}>
              <label>Select Course <span className={styles.required}>*</span></label>
              <select
                name="selectedCourse"
                value={testData.selectedCourse}
                onChange={handleSelectChange}
              >
                <option value="" disabled>Select a course</option>
                {courses.map((course) => (
                  <option key={course.courseCreationId} value={course.courseCreationId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              {formErrors.selectedCourse && <span className={styles.error}>{formErrors.selectedCourse}</span>}
            </div>

            {/* Type of Test */}
            <div className={styles.formGroup}>
              <label>Type of Test <span className={styles.required}>*</span></label>
              <select
                name="selectedTypeOfTest"
                value={testData.selectedTypeOfTest}
                onChange={handleSelectTypeOfTest}
              >
                <option value="" disabled>Select a test type</option>
                {typeOfTests.map((test) => (
                  <option key={test.TypeOfTestId} value={test.TypeOfTestId}>
                    {test.TypeOfTestName}
                  </option>
                ))}
              </select>
              {formErrors.selectedTypeOfTest && <span className={styles.error}>{formErrors.selectedTypeOfTest}</span>}
            </div>

            {/* Test Date & Time */}
            <div className={styles.formGroup}>
              <label>Start Date <span className={styles.required}>*</span></label>
              <input
                type="date"
                name="startDate"
                value={testData.startDate}
                onChange={handleInputChange}
              />
              {formErrors.startDate && <span className={styles.error}>{formErrors.startDate}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>End Date <span className={styles.required}>*</span></label>
              <input
                type="date"
                name="endDate"
                value={testData.endDate}
                onChange={handleInputChange}
              />
              {formErrors.endDate && <span className={styles.error}>{formErrors.endDate}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Start Time <span className={styles.required}>*</span></label>
              <input
                type="time"
                name="startTime"
                value={testData.startTime}
                onChange={handleInputChange}
              />
              {formErrors.startTime && <span className={styles.error}>{formErrors.startTime}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>End Time <span className={styles.required}>*</span></label>
              <input
                type="time"
                name="endTime"
                value={testData.endTime}
                onChange={handleInputChange}
              />
              {formErrors.endTime && <span className={styles.error}>{formErrors.endTime}</span>}
            </div>

            {/* Duration */}
            <div className={styles.formGroup}>
              <label>Duration (in minutes) <span className={styles.required}>*</span></label>
              <input
                type="number"
                name="duration"
                value={testData.duration}
                onChange={handleDurationChange}
                min="1"
                max="300"
              />
              {formErrors.duration && <span className={styles.error}>{formErrors.duration}</span>}
            </div>

            {/* Total Questions */}
            <div className={styles.formGroup}>
              <label>Total Questions <span className={styles.required}>*</span></label>
              <input
                type="number"
                name="totalQuestions"
                value={testData.totalQuestions}
                onChange={handleTotalQuestionsChange}
                min="1"
                max="200"
              />
              {formErrors.totalQuestions && <span className={styles.error}>{formErrors.totalQuestions}</span>}
            </div>

            {/* Total Marks */}
            <div className={styles.formGroup}>
              <label>Total Marks <span className={styles.required}>*</span></label>
              <input
                type="number"
                name="totalMarks"
                value={testData.totalMarks}
                onChange={handleTotalMarksChange}
                min="1"
                max="1000"
              />
              {formErrors.totalMarks && <span className={styles.error}>{formErrors.totalMarks}</span>}
            </div>
           
            <div className={styles.formGroup}>
              <button type="submit" className={styles.submitBtn}>Create Test</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreationForm;
