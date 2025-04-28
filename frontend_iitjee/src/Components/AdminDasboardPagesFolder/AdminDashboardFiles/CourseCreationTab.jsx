import React, { useState, useEffect } from "react";
import CourseForm from "./CourseForm.jsx"; 
import DynamicTable from "./DynamicTable.jsx";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import Styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css";
import { FaSearch } from 'react-icons/fa';
const CourseCreationTab = ({portalid}) => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage, setItemsPerPage] = useState(4); 
  const [editCourseData, setEditCourseData] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const fetchCourses = () => {
const portalid = 1;
    fetch(`${BASE_URL}/CourseCreation/GetAllCourses/${portalid}`)
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


  useEffect(() => {
    fetchCourses();
  }, []);


  const handleCourseCreated = () => {
    setShowForm(false);
    fetchCourses(); 
  };

  const handleEdit = (course) => {
    setEditCourseData(course); 
    setShowForm(true);         
  };
  

  const handleOpen = (course) => {
    alert(`Opening: ${course.course_name}`);
  };


  const handleDelete = (course) => {
    if (window.confirm(`Delete course "${course.course_name}"?`)) {
      fetch(`${BASE_URL}/CourseCreation/delete/${course.course_creation_id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            alert("Deleted.");
            fetchCourses(); 
          } else {
            alert("Failed to delete.");
          }
        });
    }
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleToggle = async (course) => {
    const newStatus = course.active_course === "active" ? "inactive" : "active"; 
  
    try {
      const response = await fetch(`${BASE_URL}/CourseCreation/toggleCourseStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseCreationTableId: course.course_creation_id, 
        }),
      });
  
      const result = await response.json();
      if (result.success) {
        console.log(`Course status updated to ${newStatus}`);
        fetchCourses();
      } else {
        console.error("Failed to update course status:", result.message);
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
  };
  const columns = courses.length

    ? Object.keys(courses[0])

        .filter((key) => key !== "subject_ids" && key !== "exam_ids" && key !=="card_image" && key !=="course_type_ids" && key !=="test_type_ids") // Filter out 'subject_ids' and 'exam_ids'
        .map((key) => ({
          header: key.replace(/_/g, " ").toUpperCase(),
          accessor: key,
        }))
    : [];

    const filteredCourses = courses.filter(course => {
      return Object.values(course).some(value => 
        value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(courses.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }


  return (
    <div>
   <div className={Styles.pageHeading}>COURSE CREATION</div>
      {!showForm && (
        <div className={Styles.flex}>
          <button className={Styles.addCourseBtn} onClick={() => setShowForm(true)}> Add Course</button>
          </div>
        
      )}
       <div className={Styles.searchBarContainer}>
       <FaSearch className={Styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search courses..." 
          className={Styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange} 
        />
   

      </div>

   
      {showForm && (
  <div className={Styles.modal}>
    <div className={Styles.modalContent}>
      <CourseForm
        onCourseCreated={handleCourseCreated}
        courseData={editCourseData}    
        setShowForm={setShowForm}  
        setEditCourseData={setEditCourseData}  
        portalid={portalid} 
      />
      
    </div>
  </div>
)}
      <div style={{ padding: "2%", backgroundColor:" #f9fafc" }}>
  {courses.length === 0 ? (
    <div>No courses available. Please add some courses.</div>
  ) : (
    <DynamicTable
      columns={columns}
      data={currentCourses} 
      onEdit={handleEdit}
      onOpen={handleOpen}
      onDelete={handleDelete}
      onToggle={handleToggle}
      type="course"
      course="ots"
    />
  )}
</div>
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

export default CourseCreationTab;
