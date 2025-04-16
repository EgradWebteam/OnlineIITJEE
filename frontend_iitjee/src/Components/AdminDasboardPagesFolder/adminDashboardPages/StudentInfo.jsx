
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../../apiConfig";
import html2canvas from "html2canvas";
import { FaUser } from "react-icons/fa6";
import { MdModeEditOutline } from "react-icons/md";
import styles from "../../../Styles/AdminDashboardCSS/StudentInfo.module.css";
import AdminDashboardHeader from "./AdminDashboardHeader";
 
const StudentInfo = () => {
  const [isPopUp, setIsPopUp] = useState(false); // Controls the Add Student form popup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState({});
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null); // Store student data after successful addition
  const [showStudentsButton, setShowStudentsButton] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentFilter, setStudentFilter] = useState("all"); // "all", "active", "inactive"
  const [purchasedTimes, setPurchasedTimes] = useState([]);
  const [courses, setCourses] = useState([]); // State to store available courses
  const [selectedCourses, setSelectedCourses] = useState([]); // State for selected courses
 
  const [studentsList, setStudentsList] = useState(() => {
    const saved = localStorage.getItem("studentsList");
    return saved ? JSON.parse(saved) : [];
  });
 
  useEffect(() => {
    localStorage.setItem("studentsList", JSON.stringify(studentsList));
  }, [studentsList]);
 
  useEffect(() => {
    fetchStudents();
  }, []);
   // Fetch courses from the backend
   useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/students/coursesName`); // Fetch courses from backend
        setCourses(response.data); // Set courses to state
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
 
    fetchCourses();
  }, []);
 
  const handleAddStudent = async (e) => {
    e.preventDefault();
    let validationErrors = {};
 
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      validationErrors.email = "Please enter a valid email address.";
    }
 
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
      }));
      alert("Enter valid email");
      return;
    }
   
    const stdData = {
      name,
      email,
      mobileNumber,
      courses: selectedCourses
    };
 
    try {
      const response = await axios.post(
        `${BASE_URL}/students/StudentInfo`,
        stdData
      );
      alert(response.data.message); // Show success alert
 
      console.log("Student Response Data: ", response.data);
 
      // Check if student data exists and set the state
      if (response.data?.message) {
        alert(response.data.message);
      }
 
      // Set latest student for popup
      setStudentDetails(response.data);
 
      // Refresh list from backend
      await fetchStudents();
 
      // Close form and clear fields
      setIsPopUp(false);
      setName("");
      setEmail("");
      setMobileNumber("");
      setErrors({});
    } catch (error) {
      console.error("Error adding student:", error);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.error === "Email already exists") {
          alert("Email already exists");
        } else {
          alert("Error adding student. Please try again.");
        }
      }
    }
  };
 
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/students/StudentInfo`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setStudentsList(response.data);
        setShowStudentsList(true);
        setShowStudentsButton(true);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students. Please try again.");
    }
  };
 
  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      // Allow only numbers and up to 10 digits
      setMobileNumber(value);
    }
  };
 
  // Handle course selection/unselection
  const handleCourseChange = (courseId) => {
    setSelectedCourses((prevSelectedCourses) => {
      if (prevSelectedCourses.includes(courseId)) {
        return prevSelectedCourses.filter(id => id !== courseId); // Unselect if already selected
      } else {
        return [...prevSelectedCourses, courseId]; // Add to selected courses
      }
    });
  };
  const handleNameChange = (e) => {
    const value = e.target.value;
    // Ensure name length is within 40 characters
    if (/^[A-Za-z\s]*$/.test(value) && value.length <= 40) {
      setName(value);
    }
  };
  const handleDownloadImage = () => {
    const popupContent = document.getElementById("studentDetailsPopup"); // Get the popup element
 
    // Use html2canvas to convert the DOM element to canvas
    html2canvas(popupContent).then((canvas) => {
      // Convert canvas to image URL
      const imgData = canvas.toDataURL("image/png");
 
      // Create a link to download the image
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${studentDetails.name}_details.png`; // Set the image file name
      link.click(); // Trigger the download
    });
  };
 
  const handleClosePopups = () => {
    // Close both popups and keep student details below the Add Student button
    setIsPopUp(false);
    setStudentDetails(null);
    setShowStudentsButton(true);
  };
 
  // ✅ PLACE IT HERE
  const handleEditStudent = async (student) => {
    try {
      const response = await axios.get(`${BASE_URL}/students/StudentInfo/${student.id}`); // ✅ fetch by ID
      const fullStudentData = response.data;
  
      setEditingStudent({
        ...student,
        ...fullStudentData, // includes course list
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      alert("Failed to fetch full student data.");
    }
  };
  
  
  const handleToggleActivation = async (studentId, currentStatus) => {
    try {
      // Toggle activation status (0 -> 1, 1 -> 0)
      const response = await axios.put(
        `${BASE_URL}/students/StudentInfo/${studentId}`,
        { student_activation: currentStatus === 1 ? 0 : 1 } // Toggle status
      );
 
      if (response.status === 200) {
        // Update the student activation status in the UI
        setStudentsList((prevStudents) =>
          prevStudents.map((student) =>
            student.id === studentId
              ? { ...student, student_activation: currentStatus === 1 ? 0 : 1 }
              : student
          )
        );
       
        alert(
          `Student ${
            currentStatus === 1 ? "activated" : "deactivated"
          } successfully.`
        );
      }
    } catch (error) {
      console.error("Error toggling activation:", error);
      alert("Error toggling student activation. Please try again.");
    }
  };
 
  const handleSaveEditedStudent = async (stdData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/students/StudentInfo/${stdData.id}`,
        {
          name: stdData.name,
          email: stdData.email,
          mobileNumber: stdData.mobileNumber,
          student_activation: stdData.student_activation ?? 1, // retain activation status
        courses: stdData.courses, // 🔁 Send updated courses if your backend supports it
        }
      );
 
      if (response.status === 200) {
        setStudentsList((prevStudents) =>
          prevStudents.map((student) =>
            student.id === stdData.id ? { ...student, ...stdData } : student
          )
        );
        alert("Student details updated successfully.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("There was an error updating the student. Please try again.");
    }
    setEditingStudent(null);
  };
 
 
  return (
    <div className={styles.AddedstudentsHomePage}>
      <AdminDashboardHeader />
      <div className={styles.StudentInfoHeader}>Student Information</div>
 
      <button className={styles.Addedstudent} onClick={() => setIsPopUp(true)}>
        Add students
      </button>
      <div className={styles.StundentInfoForContainer}>
        <div className={styles.FilterDropdown}>
          <select
            className={styles.ShowStudentsBtn}
            value={studentFilter}
            onChange={(e) => {
              setStudentFilter(e.target.value);
              setShowStudentsList(true); // Always show list when filter is used
            }}
          >
            <option value="all">Show All Students</option>
            <option value="active">Activated Students</option>
            <option value="inactive">Deactivated Students</option>
          </select>
        </div>
 
        {isPopUp && (
          <div className={styles.PopUPContainer}>
            <div className={styles.PopUP}>
              <h3 className={styles.HedaingForAddStudents}>Added Student</h3>
              <form className={styles.PopUPForm} onSubmit={handleAddStudent}>
                <h4 className={styles.SubHEadingForStd}>Student Information</h4>
                <div className={styles.InboxesForForm}>
                  <label>Name:</label>
                  <input
                    onChange={handleNameChange}
                    type="text"
                    placeholder="Enter your Name"
                    className={styles.PopUPInput}
                    value={name}
                  />
                </div>
                <div className={styles.InboxesForForm}>
                  <label>Email:</label>
                  <input
                    type="text"
                    placeholder="Enter your Mail"
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.PopUPInput}
                  />
                </div>
                {errors.email && (
                  <p className={styles.errorText}>{errors.email}</p>
                )}
                <div className={styles.InboxesForForm}>
                  <label>Mobile Number:</label>
                  <input
                    type="text"
                    placeholder="Enter your Number"
                    onChange={handleMobileChange}
                    value={mobileNumber}
                    className={styles.PopUPInput}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className={styles.errorText}>{errors.mobileNumber}</p>
                )}
                <h4 className={styles.subHeadingForStd}>Selected Courses</h4>
                <div className={styles.CoursesInputContainer}>
                {courses.length > 0 ? (
          courses.map(course => (
            <div key={course.id} className={styles.CoursesInput}>
              <input
                type="checkbox"
                className={styles.customCheckbox}
                checked={selectedCourses.includes(course.id)} // Check if course is selected
                onChange={() => handleCourseChange(course.id)} // Handle checkbox change
              />
              <label>{course.course_name}</label>
            </div>
          ))
        ) : (
          <p>No courses available</p>
        )}
        </div>
                <button className={styles.SubmitBtnsForPopUpfor} type="submit">
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
 
        {/* New popup to display the added student details */}
        {studentDetails && (
          <div className={styles.PopUPContainer}>
            <div className={styles.PopUP} id="studentDetailsPopup">
              <div className={styles.StudentInformation}>
                <div className={styles.HedaingForAddStudents}>
                  Student Information
                </div>
                <div>
                  <p className={styles.StudentInfoDetails}>
                    <b>Name:</b> <span>{studentDetails.name}</span>
                  </p>
                  <p className={styles.StudentInfoDetails}>
                    <b>Email:</b>
                    <span> {studentDetails.email}</span>
                  </p>
                  <p className={styles.StudentInfoDetails}>
                    <b>Mobile Number: </b>
                    <span>{studentDetails.mobileNumber}</span>
                  </p>
                  <p className={styles.StudentInfoDetails}>
                    <b>Password: </b>
                    <span>{studentDetails.password}</span>
                  </p>
                </div>
              </div>
              <div className={styles.ButtonsForPopupDetails}>
                <button
                  className={styles.BtnsForPopUp}
                  onClick={handleDownloadImage}
                >
                  Download as Image
                </button>
                <button
                  className={styles.BtnsForPopUp}
                  onClick={handleClosePopups} // Close both popups
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* Displaying the added student details below the "Add students" button */}
        {showStudentsList && studentsList.length > 0 && (
          <div className={styles.StudentDetailsinInterface}>
            <h3 className={styles.HeaderForStdInfoDetails}>Student Details</h3>
            <div className={styles.StudentInformationfromDBContainer}>
              {studentsList
                .filter((student) => {
                  if (studentFilter === "active")
                    return student.student_activation === 0;
                  if (studentFilter === "inactive")
                    return student.student_activation === 1;
                  return true; // "all"
                })
                .map((student, index) => (
                  <div className={styles.StudentInformationfromDB}>
                    <div className={styles.ProfileForStdDetails}>
                      <FaUser />
                    </div>
 
                    <h4 className={styles.HeadingForDetails}>
                      Added Student Information:
                    </h4>
 
                    <div key={index} className={styles.StudentItem}>
                      <p className={styles.StudentInfoDetails}>
                        <b>Name:</b> <span>{student.name}</span>
                      </p>
                      <p className={styles.StudentInfoDetails}>
                        <b>Email:</b> <span>{student.email}</span>
                      </p>
                      <p className={styles.StudentInfoDetails}>
                        <b>Mobile Number:</b>{" "}
                        <span>{student.mobileNumber}</span>
                      </p>
                    </div>
                    <div className={styles.ButtonsForStdEditDetails}>
                      <button
                        className={styles.ButtonsForDeactive}
                        onClick={() =>
                          handleToggleActivation(
                            student.id,
                            student.student_activation
                          )
                        }
                      >
                        {student.student_activation === 1
                          ? "Dectivate"
                          : "Activate"}
                      </button>
                      <div className={styles.EditBtnIcon}>
                        <button
                          className={styles.ButtonsForStdEdit}
                          onClick={() => handleEditStudent(student)} // Open edit form
                        >
                          <MdModeEditOutline />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
 
        {editingStudent && (
          <div className={styles.PopUPContainer}>
            <div className={styles.PopUP}>
              <h3>Edit Student</h3>
              <form
                className={styles.PopUPForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEditedStudent(editingStudent);
                }}
              >
                <div className={styles.InboxesForForm}>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.InboxesForForm}>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.InboxesForForm}>
                  <label>Mobile Number:</label>
                  <input
                    type="text"
                    value={editingStudent.mobileNumber}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.CoursesInputContainer}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className={styles.CoursesInput}>
                <input
  type="checkbox"
  className={styles.customCheckbox}
  checked={
    editingStudent.courses &&
    editingStudent.courses.includes(course.id)
  }
  onChange={() => {
    const isSelected = editingStudent.courses.includes(course.id);
    const updatedCourses = isSelected
      ? editingStudent.courses.filter((id) => id !== course.id)
      : [...editingStudent.courses, course.id];

    setEditingStudent({
      ...editingStudent,
      courses: updatedCourses,
    });
  }}
/>

                <label>{course.course_name}</label>
              </div>
            ))
          ) : (
            <p>No courses available</p>
          )}
        </div>
                <div className={styles.ButtonsForEdit}>
                  <button type="submit">Save</button>
                  <button onClick={() => setEditingStudent(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default StudentInfo;