import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import axios from "axios";

const TestCreationForm = ({ setShowAddTestForm, testCreationFormData, editData, onTestSaved }) => {
  const isEditMode = !!editData;

  const [selectedCourse, setSelectedCourse] = useState("");
  const [includeSection, setIncludeSection] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [formFields, setFormFields] = useState({
    testName: "",
    selectedTypeOfTest: "",
    selectedInstruction: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    selectedOptionPattern: "",
    duration: "",
    totalQuestions: "",
    totalMarks: "",
  });

  const [subjectSections, setSubjectSections] = useState([
    { selectedSubject: "", sectionName: "", numOfQuestions: "" },
  ]);

  useEffect(() => {
    const loadEditData = async () => {
      if (isEditMode && editData) {
        console.log("💡 Edit Mode - Received Edit Data:", editData);

        // Pre-fill main test form fields
        setFormFields({
          testName: editData.test_name || "",
          selectedTypeOfTest: editData.course_type_of_test_id || "",
          selectedInstruction: editData.instruction_id || "",
          startDate: editData.test_start_date || "",
          endDate: editData.test_end_date || "",
          startTime: editData.test_start_time || "",
          endTime: editData.test_end_time || "",
          selectedOptionPattern: editData.options_pattern_id || "",
          duration: editData.duration || "",
          totalQuestions: editData.number_of_questions || "",
          totalMarks: editData.total_marks || "",
        });

        // Pre-select course
        setSelectedCourse(editData.course_creation_id || "");

        // Fetch & populate subjects for the selected course
        if (editData.course_creation_id) {
          try {
            const response = await axios.get(`${BASE_URL}/TestCreation/CourseSubjects/${editData.course_creation_id}`);
            setSubjects(response.data.subjects || []);
          } catch (err) {
            console.error("Error fetching subjects:", err);
          }
        }

        // Pre-fill sections if present
        if (Array.isArray(editData.sections) && editData.sections.length > 0) {
          console.log("🧩 Prefilling sections:", editData.sections);

          setIncludeSection(true);
          const mappedSections = editData.sections.map((section) => ({
            selectedSubject: section.subject_id || "",
            sectionName: section.section_name || "",
            numOfQuestions: section.no_of_questions || "", // Ensure this matches your DB column
          }));
          setSubjectSections(mappedSections);
        } else {
          setIncludeSection(false);
          setSubjectSections([{ selectedSubject: "", sectionName: "", numOfQuestions: "" }]);
        }
      } else {
        // Reset form in Add mode
        setFormFields({
          testName: "",
          selectedTypeOfTest: "",
          selectedInstruction: "",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          selectedOptionPattern: "",
          duration: "",
          totalQuestions: "",
          totalMarks: "",
        });
        setSelectedCourse("");
        setIncludeSection(false);
        setSubjectSections([{ selectedSubject: "", sectionName: "", numOfQuestions: "" }]);
        setSubjects([]);
      }
    };

    loadEditData();
  }, [isEditMode, editData]);



  const handleFormFieldChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = () => {
    setIncludeSection(!includeSection);
  };

  const handleCourseChange = async (e) => {
    const selectedCourseId = e.target.value;
    setSelectedCourse(selectedCourseId);
    try {
      const response = await axios.get(
        `${BASE_URL}/TestCreation/CourseSubjects/${selectedCourseId}`
      );
      setSubjects(response.data.subjects || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const handleSubjectSectionChange = (index, field, value) => {
    const updated = [...subjectSections];
    updated[index][field] = value;
    setSubjectSections(updated);
  };

  const addSubjectSection = () => {
    setSubjectSections([...subjectSections, { selectedSubject: "", sectionName: "", numOfQuestions: "" }]);
  };

  const removeSubjectSection = () => {
    if (subjectSections.length > 1) {
      setSubjectSections(subjectSections.slice(0, -1));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      ...formFields,
      selectedCourse,
      sections: includeSection
        ? subjectSections.map((section) => ({
          subjectId: section.selectedSubject,
          sectionName: section.sectionName,
          numOfQuestions: section.numOfQuestions,
        }))
        : [],
    };

    try {
      const response = await fetch(
        `${BASE_URL}/TestCreation/${isEditMode ? `UpdateTest/${editData.test_creation_table_id}` : "CreateTest"}`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );


      if (response.ok) {
        alert(`Test ${isEditMode ? "updated" : "created"} successfully!`);
        setShowAddTestForm(false);
        onTestSaved() // Close the form
      }
      else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error while submitting the form.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.testCreationFormContainer}>

        <form className={styles.testCreationForm} onSubmit={handleFormSubmit}>
          <div>
            <div className={styles.formHeader}>
              <h3>{isEditMode ? "Edit Test" : "Create a New Test"}</h3>
              <button
                type="button"
                className={styles.closeFormBtn}
                onClick={() => setShowAddTestForm(false)}
              >
                <RxCross2 />
              </button>
            </div>

            <div className={styles.gridForm}>
              <div className={styles.formGroup}>
                <label>Test Name *</label>
                <input type="text" name="testName" className={styles.testFeilds} value={formFields.testName} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Select Course *</label>
                <select className={styles.testFeilds} name="selectedCourse" value={selectedCourse} onChange={handleCourseChange} required>
                  <option value="">Select a course</option>
                  {testCreationFormData?.courses?.map((course) => (
                    <option key={course.course_creation_id} value={course.course_creation_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Type of Test *</label>
                <select className={styles.testFeilds} name="selectedTypeOfTest" value={formFields.selectedTypeOfTest} onChange={handleFormFieldChange} required>
                  <option value="">Select a test type</option>
                  {testCreationFormData?.testTypes?.map((type) => (
                    <option key={type.type_of_test_id} value={type.type_of_test_id}>
                      {type.type_of_test_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Select instructions *</label>
                <select className={styles.testFeilds} name="selectedInstruction" value={formFields.selectedInstruction} onChange={handleFormFieldChange} required>
                  <option value="">Select instructions</option>
                  {testCreationFormData?.instructions?.map((inst) => (
                    <option key={inst.instruction_id} value={inst.instruction_id}>
                      {inst.instruction_heading}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input type="date" name="startDate" className={styles.testFeilds} value={formFields.startDate} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>End Date *</label>
                <input className={styles.testFeilds} type="date" name="endDate" value={formFields.endDate} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Start Time *</label>
                <input type="time" name="startTime" className={styles.testFeilds} value={formFields.startTime} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>End Time *</label>
                <input type="time" name="endTime" className={styles.testFeilds} value={formFields.endTime} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Option Pattern *</label>
                <select className={styles.testFeilds} name="selectedOptionPattern" value={formFields.selectedOptionPattern} onChange={handleFormFieldChange} required>
                  <option value="">Select an option pattern</option>
                  {testCreationFormData?.optionPatterns?.map((pattern) => (
                    <option key={pattern.options_pattern_id} value={pattern.options_pattern_id}>
                      {pattern.options_pattern_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Duration (minutes) *</label>
                <input className={styles.testFeilds} type="number" name="duration" value={formFields.duration} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Total Questions *</label>
                <input className={styles.testFeilds} type="number" name="totalQuestions" value={formFields.totalQuestions} onChange={handleFormFieldChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Total Marks *</label>
                <input className={styles.testFeilds} type="number" name="totalMarks" value={formFields.totalMarks} onChange={handleFormFieldChange} required />
              </div>

              <div>
                <label>
                  <input className={styles.testFeilds} type="checkbox" checked={includeSection} onChange={handleCheckboxChange} />
                  Include section(s) in the test
                </label>

                {includeSection && subjectSections.map((section, index) => (
                  <div key={index} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px", display: "grid" }}>
                    <label>Subject</label>
                    <select
                      className={styles.testFeilds}
                      value={section.selectedSubject}
                      onChange={(e) => handleSubjectSectionChange(index, "selectedSubject", e.target.value)}
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subj) => (
                        <option key={subj.subject_id} value={subj.subject_id}>
                          {subj.subject_name}
                        </option>
                      ))}
                    </select>

                    <label>Section Name</label>
                    <input
                      type="text"
                      className={styles.testFeilds}
                      value={section.sectionName}
                      onChange={(e) => handleSubjectSectionChange(index, "sectionName", e.target.value)}
                      required
                    />

                    <label>No. of Questions</label>
                    <input
                      className={styles.testFeilds}
                      type="number"
                      value={section.numOfQuestions}
                      onChange={(e) => handleSubjectSectionChange(index, "numOfQuestions", e.target.value)}
                      required
                    />
                  </div>
                ))}

                {includeSection && (
                  <div>
                    <button type="button" onClick={addSubjectSection}>+ Add Section</button>
                    <button type="button" onClick={removeSubjectSection}>- Remove Section</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <button type="submit" className={styles.createButton}>
                {isEditMode ? "Update Test" : "Create Test"}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default TestCreationForm;
