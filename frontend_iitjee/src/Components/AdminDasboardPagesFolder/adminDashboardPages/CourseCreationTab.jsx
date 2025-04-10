import React, { useState, useEffect } from 'react';
import CourseForm from './CourseForm.jsx';
import { BASE_URL } from "../../../config/apiConfig.js";
import DynamicTable from './DynamicTable.jsx'; // Dynamic table component
import styles from '../../../Styles/AdminDashboardCSS/CourseCreation.module.css';

const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
useEffect(() => {

  console.log("CoursesTab called",courses)
}, [courses])
  // Define columns for the dynamic table
  const columns = [
    { header: 'Course Name', accessor: 'course_name' },
    { header: 'Year', accessor: 'course_year' },
    { header: 'Start Date', accessor: 'course_start_date' },
    { header: 'End Date', accessor: 'course_end_date' },
    { header: 'Cost', accessor: 'cost' },
    { header: 'Discount (%)', accessor: 'discount' },
    { header: 'Total Price', accessor: 'total_price' },
   
  ];

  // Fetch all the courses from the backend
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
   
    try {
      const response = await fetch(`${BASE_URL}/CourseCreation/GetCourses`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []); // Update the courses state with the response data
      } else {
        alert('Error fetching courses.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setCourseToEdit(null); // Reset courseToEdit to create a new course
  };

  const handleEditCourse = (course) => {
    debugger
    setIsCreatingNew(true);
    setCourseToEdit(course); // Set the course to be edited
  };

  const handleDeleteCourse = async (courseId) => {
    debugger
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`${BASE_URL}/CourseCreation/DeleteCourse/${courseId.course_creation_id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          alert('Course deleted successfully!');
          fetchCourses(); // Refresh the course list
        } else {
          alert('Error deleting the course.');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleToggleActivation = (course) => {
    const updatedCourse = { ...course, isActive: !course.isActive };
    // You should make an API call here to update the course's activation status
    alert(`Course ${updatedCourse.isActive ? 'Activated' : 'Deactivated'}: ${updatedCourse.course_name}`);
    fetchCourses(); // Refresh course list after activation/deactivation
  };

  const handleCloseForm = () => {
    setIsCreatingNew(false);
    setCourseToEdit(null); // Reset courseToEdit after form is closed
  };

  // Define actions for the table (Edit and Delete)
  const handleActions = (course) => (
    <div>
      <button onClick={() => handleEditCourse(course)} className={styles.editButton}>Edit</button>
      <button onClick={() => handleDeleteCourse(course.course_creation_id)} className={styles.deleteButton}>Delete</button>
    </div>
  );

  return (
    <div  className={styles.courseContainer}>
       <div className={styles.pageHeading}>COURSES</div>
      {/* Courses Table */}
      {!isCreatingNew && (
        <div  >
        
          <div className={styles.flex}>
          <button onClick={handleCreateNew} className={styles.createNewButton}>
            + Create New Course
          </button>
          </div>

          {/* Dynamic Table for Courses */}
          <DynamicTable
            columns={columns}
            data={courses}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
            onToggle={handleToggleActivation}
            actions={handleActions}
          />
        </div>
      )}

      {/* Course Form */}
      {isCreatingNew && (
        <div className={styles.courseFormContainer}>
          <CourseForm courseToEdit={courseToEdit} onSave={handleCloseForm} />
        </div>
      )}
    </div>
  );
};

export default CoursesTab;
