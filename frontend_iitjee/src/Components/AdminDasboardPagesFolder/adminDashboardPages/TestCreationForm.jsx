// import React, { useState } from "react";
// import { RxCross2 } from "react-icons/rx";
// import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css"; 

// const TestCreationForm = ({
//   handleSubmit,
//   setShowAddTestForm,
//   testCreationFormData,
// }) => {

//   const [includeSection, setIncludeSection] = useState(false);
//   const [sections, setSections] = useState([
//     {
//       id: Date.now(),
//       dropdownValue: "",
//       sectionName: "",
//       numberOfQuestions: "",
//     },
//   ]);

//   const handleCheckboxChange = () => {
//     setIncludeSection(!includeSection);
//   };

//   const handleSectionChange = (id, field, value) => {
//     setSections((prev) =>
//       prev.map((section) =>
//         section.id === id ? { ...section, [field]: value } : section
//       )
//     );
//   };
//   const handleAddSection = () => {
//     setSections([
//       ...sections,
//       {
//         id: Date.now(),
//         dropdownValue: "",
//         sectionName: "",
//         numberOfQuestions: "",
//       },
//     ]);
//   };

//   const handleRemoveSection = (id) => {
//     const updatedSections = sections.filter((section) => section.id !== id);
//     setSections(updatedSections);
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.testCreationFormContainer}>
//         <form
//           className={styles.testCreationForm}
//           onSubmit={(e) => handleSubmit(e)}
//         >
//           <div className={styles.formHeader}>
//             <h3>Create a New Test</h3>
//             <button
//               type="button"
//               className={styles.closeFormBtn}
//               onClick={() => setShowAddTestForm(false)}
//             >
//               <RxCross2 />
//             </button>
//           </div>

//           {/* Grid Layout for the Form */}
//           <div className={styles.gridForm}>
//             {/* Test Name */}
//             <div className={styles.formGroup}>
//               <label>
//                 Test Name <span className={styles.required}>*</span>
//               </label>
//               <input type="text" name="testName" />
//               {/* {formErrors.testName && (
//                 <span className={styles.error}>{formErrors.testName}</span>
//               )} */}
//             </div>

//             {/* Course Selection */}
//             <div className={styles.formGroup}>
//               <label>
//                 Select Course <span className={styles.required}>*</span>
//               </label>
//               <select name="selectedCourse">
//                 <option value="">Select a course</option>

//                 {testCreationFormData &&
//                   testCreationFormData.courses &&
//                   testCreationFormData.courses.map((course) => (
//                     <option
//                       key={course.course_creation_id}
//                       value={course.course_creation_id}
//                     >
//                       {course.course_name}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Type of Test */}
//             <div className={styles.formGroup}>
//               <label>
//                 Type of Test <span className={styles.required}>*</span>
//               </label>
//               <select name="selectedTypeOfTest">
//                 <option value="">Select a test type</option>

//                 {testCreationFormData &&
//                   testCreationFormData.testTypes &&
//                   testCreationFormData.testTypes.map((test) => (
//                     <option
//                       key={test.type_of_test_id}
//                       value={test.type_of_test_id}
//                     >
//                       {test.type_of_test_name}
//                     </option>
//                   ))}
//               </select>
//             </div>
//             {/*     Select instructions */}
//             <div className={styles.formGroup}>
//               <label>
//                 Select instructions <span className={styles.required}>*</span>
//               </label>
//               <select name="selectedInstruction">
//                 <option value="">Select instructions</option>

//                 {testCreationFormData &&
//                   testCreationFormData.instructions &&
//                   testCreationFormData.instructions.map((inst) => (
//                     <option
//                       key={inst.instruction_id}
//                       value={inst.instruction_id}
//                     >
//                       {inst.instruction_heading}
//                     </option>
//                   ))}
//               </select>
//             </div>

//             {/* Test Date & Time */}
//             <div className={styles.formGroup}>
//               <label>
//                 Start Date <span className={styles.required}>*</span>
//               </label>
//               <input type="date" name="startDate" />
//             </div>

//             <div className={styles.formGroup}>
//               <label>
//                 End Date <span className={styles.required}>*</span>
//               </label>
//               <input type="date" name="endDate" />
//             </div>

//             <div className={styles.formGroup}>
//               <label>
//                 Start Time <span className={styles.required}>*</span>
//               </label>
//               <input type="time" name="startTime" />
//             </div>

//             <div className={styles.formGroup}>
//               <label>
//                 End Time <span className={styles.required}>*</span>
//               </label>
//               <input type="time" name="endTime" />
//             </div>
//             {/*Option Pattern*/}
//             <div className={styles.formGroup}>
//               <label>
//                 Select Option pattern <span className={styles.required}>*</span>
//               </label>
//               <select name="selectedTypeOfTest">
//                 <option value="">Select a option pattern</option>
//                 {testCreationFormData &&
//                   testCreationFormData.optionPatterns &&
//                   testCreationFormData.optionPatterns.map((pattern) => (
//                     <option
//                       key={pattern.options_pattern_id}
//                       value={pattern.options_pattern_id}
//                     >
//                       {pattern.options_pattern_name}
//                     </option>
//                   ))}
//               </select>
//             </div>
//             {/* Duration */}
//             <div className={styles.formGroup}>
//               <label>
//                 Duration (in minutes) <span className={styles.required}>*</span>
//               </label>
//               <input type="number" name="duration" min="1" max="300" />
//             </div>

//             {/* Total Questions */}
//             <div className={styles.formGroup}>
//               <label>
//                 Total Questions <span className={styles.required}>*</span>
//               </label>
//               <input type="number" name="totalQuestions" min="1" max="200" />
//             </div>

//             {/* Total Marks */}
//             <div className={styles.formGroup}>
//               <label>
//                 Total Marks <span className={styles.required}>*</span>
//               </label>
//               <input type="number" name="totalMarks" min="1" max="1000" />
//             </div>
//             <div style={{ margin: "1rem 0" }}>
//               <label
//                 style={{ display: "flex", alignItems: "center", gap: "10px" }}
//               >
//                 <input type="checkbox" onChange={handleCheckboxChange} />
//                 Click here if you want to include any section in the test
//               </label>

//               {includeSection && (
//                 <div>
//                   {sections.map((section, index) => (
//                     <div
//                       key={section.id}
//                       style={{
//                         border: "1px solid #ccc",
//                         padding: "10px",
//                         margin: "10px 0",
//                       }}
//                     >
//                       <div style={{ marginBottom: "10px" }}>
//                         <label>Choose Section Type: </label>
//                         <select
//                           value={section.dropdownValue}
//                           onChange={(e) =>
//                             handleSectionChange(
//                               section.id,
//                               "dropdownValue",
//                               e.target.value
//                             )
//                           }
//                         >
//                           <option value="">-- Select --</option>
//                           <option value="math">Math</option>
//                           <option value="science">Science</option>
//                           <option value="reasoning">Reasoning</option>
//                         </select>
//                       </div>

//                       <div style={{ marginBottom: "10px" }}>
//                         <label>Section Name: </label>
//                         <input
//                           type="text"
//                           value={section.sectionName}
//                           onChange={(e) =>
//                             handleSectionChange(
//                               section.id,
//                               "sectionName",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </div>

//                       <div style={{ marginBottom: "10px" }}>
//                         <label>No. of Questions: </label>
//                         <input
//                           type="number"
//                           value={section.numberOfQuestions}
//                           onChange={(e) =>
//                             handleSectionChange(
//                               section.id,
//                               "numberOfQuestions",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </div>

//                       <div>
//                         {sections.length > 1 && (
//                           <button
//                             onClick={() => handleRemoveSection(section.id)}
//                           >
//                             − Remove
//                           </button>
//                         )}
//                         {index === sections.length - 1 && (
//                           <button onClick={handleAddSection}>+ Add</button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <div className={styles.formGroup}>
//               <button type="submit" className={styles.submitBtn}>
//                 Create Test
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default TestCreationForm;












import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "../../../Styles/AdminDashboardCSS/TestCreation.module.css"; 
import { BASE_URL } from "../../../../apiConfig";

const TestCreationForm = ({

  setShowAddTestForm,
  testCreationFormData,
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
      sections: sections, // Include section data
    };
console.log("formData",formData)
    // Make a POST request to the server to insert the test data
    try {
      const response = await fetch(`${BASE_URL}/TestCreation/CreateTest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

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
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.testCreationFormContainer}>
        <form
          className={styles.testCreationForm}
          onSubmit={handleFormSubmit}
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
              <input type="text" name="testName" required />
            </div>

            {/* Course Selection */}
            <div className={styles.formGroup}>
              <label>
                Select Course <span className={styles.required}>*</span>
              </label>
              <select name="selectedCourse" required>
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
              <input type="number" name="totalQuestions" min="1" max="200" required />
            </div>

            {/* Total Marks */}
            <div className={styles.formGroup}>
              <label>
                Total Marks <span className={styles.required}>*</span>
              </label>
              <input type="number" name="totalMarks" min="1" max="1000" required />
            </div>

            {/* Sections */}
            <div style={{ margin: "1rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" onChange={handleCheckboxChange} />
                Click here if you want to include any section in the test
              </label>

              {includeSection && (
                <div>
                  {sections.map((section, index) => (
                    <div key={section.id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <label>Choose Section Type: </label>
                        <select
                          value={section.dropdownValue}
                          onChange={(e) =>
                            handleSectionChange(section.id, "dropdownValue", e.target.value)
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
                            handleSectionChange(section.id, "sectionName", e.target.value)
                          }
                        />
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>No. of Questions: </label>
                        <input
                          type="number"
                          value={section.numberOfQuestions}
                          onChange={(e) =>
                            handleSectionChange(section.id, "numberOfQuestions", e.target.value)
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section.id)}
                        style={{ color: "red", border: "none", background: "transparent" }}
                      >
                        Remove Section
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSection}
                    style={{
                      marginTop: "10px",
                      padding: "5px 10px",
                      border: "1px solid #ccc",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                    }}
                  >
                    Add New Section
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn}>Create Test</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreationForm;
