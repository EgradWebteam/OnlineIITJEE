import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../../Styles/AdminDashboardCSS/Assigntotest.module.css";
import { BASE_URL } from '../../../config/apiConfig';

const AssignToTest = ({ testCreationTableId, onClose }) => {
  const [notAssignedCourses, setNotAssignedCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Fetch courses on mount or testCreationTableId change
  useEffect(() => {
    fetchCourses();
  }, [testCreationTableId]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/TestCreation/getNotAssignedCourses/${testCreationTableId}`);
      setNotAssignedCourses(response.data.rowsNotAssigned || []);
      setAssignedCourses(response.data.rowsAssigned || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleCheckboxChange = (courseId, isChecked, isAssigned) => {
    if (isChecked) {
      setSelectedCourses((prevSelected) => [...prevSelected, courseId]);
    } else {
      setSelectedCourses((prevSelected) =>
        prevSelected.filter((id) => id !== courseId)
      );
    }

    // If it's an assigned course and unchecking, remove from selected and unassign
    if (isAssigned && !isChecked) {
      handleUnassign(courseId); // Call to unassign
    }
  };
  const handleAssignCourses = async () => {
    try {
      const coursesToAssign = notAssignedCourses.filter((course) =>
        selectedCourses.includes(course.course_creation_id)
      );
  
      const response = await axios.post(
        `${BASE_URL}/TestCreation/assignToTest/${testCreationTableId}`,
        {
          coursesToBeAssigned: coursesToAssign,
        }
      );
  
      if (response.status === 200) {
        alert("Courses assigned successfully!");
        setSelectedCourses([]); 
        fetchCourses();
        onClose(); 
      } else {
        alert("Failed to assign courses.");
      }
    } catch (error) {
      console.error("Error assigning courses:", error);
      alert("Failed to assign courses.");
    }
  };
  

  const handleUnassign = async (course_creation_id) => {
    if (!window.confirm("Are you sure you want to unassign this course?")) return;

    try {
      const response = await axios.delete(
        `${BASE_URL}/TestCreation/assignedTestDel/${course_creation_id}/${testCreationTableId}`
      );

      if (response.status === 200) {
        alert("Course unassigned successfully!");
        fetchCourses(); // Refresh both lists
      } else {
        alert("Failed to unassign course.");
      }
    } catch (error) {
      console.error("Error while unassigning course:", error);
      alert("Something went wrong while unassigning.");
    }
  };

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popupContent}>
        <h2>Assign Courses to Test</h2>

        {/* Not Assigned Courses */}
        <div className={styles.courseList}>
          <h3>Not Assigned Courses</h3>
          {notAssignedCourses.length === 0 ? (
            <p>No courses available to assign.</p>
          ) : (
            notAssignedCourses.map((course) => (
              <div key={course.course_creation_id} className={styles.courseItem}>
                <input
                  type="checkbox"
                  id={`not-assigned-course-${course.course_creation_id}`}
                  onChange={(e) =>
                    handleCheckboxChange(course.course_creation_id, e.target.checked, false)
                  }
                  checked={selectedCourses.includes(course.course_creation_id)}
                />
                <label htmlFor={`not-assigned-course-${course.course_creation_id}`}>
                  {course.course_name}
                </label>
              </div>
            ))
          )}
        </div>

        {/* Assigned Courses */}
        <div className={styles.courseList}>
          <h3>Assigned Courses</h3>
          {assignedCourses.length === 0 ? (
            <p>No courses assigned.</p>
          ) : (
            assignedCourses.map((course) => (
              <div key={course.course_creation_id} className={styles.courseItem}>
                <input
                  type="checkbox"
                  id={`assigned-course-${course.course_creation_id}`}
                  onChange={(e) =>
                    handleCheckboxChange(course.course_creation_id, e.target.checked, true)
                  }
                  checked={selectedCourses.includes(course.course_creation_id) || true} // Always checked initially
                />
                <label htmlFor={`assigned-course-${course.course_creation_id}`}>
                  {course.course_name}
                </label>
                {/* Remove button to unassign course manually */}
                <button
                  className={styles.removeBtn}
                  onClick={() => handleUnassign(course.course_creation_id)}
                >
                  Unassign
                </button>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.assignButton}
            onClick={handleAssignCourses}
            disabled={selectedCourses.length === 0}
          >
            Assign Selected Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignToTest;
