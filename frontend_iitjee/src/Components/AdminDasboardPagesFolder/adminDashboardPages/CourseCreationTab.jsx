import React, { useState, useEffect } from "react";
import CourseForm from "./CourseForm"; // updated component name
import DynamicTable from "./DynamicTable";
import { BASE_URL } from "../../../../apiConfig";
import Styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css"; // Importing styles

const CourseManagementTabs = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items per page
  const [selectedCourseId, setSelectedCourseId] = useState(null); 
  const [editCourseData, setEditCourseData] = useState(null); 
  // Fetch courses data from the new API
  const fetchCourses = () => {
    fetch(`${BASE_URL}/CourseCreation/GetAllCourses`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourses(data.data || []);
        } else {
          console.error("Error fetching courses:", data.message || "Unknown error");
        }
      })
      .catch((err) => console.error("Error loading courses", err));
  };

  // Fetch courses when the component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  // Callback when a course is created
  const handleCourseCreated = () => {
    setShowForm(false);
    fetchCourses(); // Refresh courses after a new course is added
  };

  const handleEdit = (course) => {
    setEditCourseData(course); 
    setShowForm(true);         
  };
  

  // Handle opening a course (e.g., view more details)
  const handleOpen = (course) => {
    alert(`Opening: ${course.course_name}`);
  };

  // Handle deleting a course
  const handleDelete = (course) => {
    if (window.confirm(`Delete course "${course.course_name}"?`)) {
      fetch(`${BASE_URL}/CourseCreation/delete/${course.course_creation_id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            alert("Deleted.");
            fetchCourses(); // Refresh courses after deletion
          } else {
            alert("Failed to delete.");
          }
        });
    }
  };

  // Handle toggling the course status
  const handleToggle = (course) => {
    const newStatus = course.active_course === "active" ? "inactive" : "active"; // Toggle between 'active' and 'inactive'
    fetch(`${BASE_URL}/CourseCreation/toggle-status/${course.course_creation_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active_course: newStatus }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          fetchCourses(); // Refresh courses after status change
        }
      });
  };

  // Prepare columns for the table (use the course data keys)
  const columns = courses.length
    ? Object.keys(courses[0])
        .filter((key) => key !== "subject_ids" && key !== "exam_ids") // Filter out 'subject_ids' and 'exam_ids'
        .map((key) => ({
          header: key.replace(/_/g, " ").toUpperCase(),
          accessor: key,
        }))
    : [];

  // Get current courses for the current page
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total pages
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(courses.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <h2>Course Management</h2>

      {/* Button to add a new course */}
      {!showForm && (
        <button className={Styles.addCourseBtn} onClick={() => setShowForm(true)}>➕ Add Course</button>
      )}

      {/* Show the course form if showForm is true */}
      {showForm && (
  <div className={Styles.modal}>
    <div className={Styles.modalContent}>
      <CourseForm
        onCourseCreated={handleCourseCreated}
        courseData={editCourseData}             
      />
      <button
        className={Styles.closeBtn}
        onClick={() => {
          setShowForm(false);
          setEditCourseData(null);              
        }}
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* Display courses in a dynamic table */}
      <DynamicTable
        columns={columns}
        data={currentCourses} // Show paginated courses
        onEdit={handleEdit}
        onOpen={handleOpen}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />

      {/* Pagination controls */}
      <div className={Styles.pagination}>
        {pageNumbers.map((number) => (
          <button className={Styles.pageButton} key={number} onClick={() => paginate(number)}>
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseManagementTabs;
