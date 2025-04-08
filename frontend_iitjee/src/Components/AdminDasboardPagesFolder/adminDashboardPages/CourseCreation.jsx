import React, { useState, useEffect } from 'react';
import DynamicTable from './DynamicTable';
import styles  from '../../../Styles/AdminDashboardCSS/CourseCreation.module.css'; // Importing CSS module for styling

import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const CourseCreation = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddOptions, setShowAddOptions] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/courseData").then((res) => {
      const serialCourses = res.data.map((course, index) => ({
        ...course,
        serial: index + 1
      }));
      setCourses(serialCourses);
    });
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.courseContainer}>
      <h2 className={styles.pageHeading}>COURSE CREATION PAGE</h2>

      {/* Top bar section */}
      <div className={styles.topRow}>
        {showAddOptions && (
          <div className={styles.onlineTestDiv}>
            <button className={styles.leftOptionBtn}>Online Test Series</button>
          </div>
        )}

        <button
          className={styles.addCourseBtn}
          onClick={() => setShowAddOptions(!showAddOptions)}
        >
          Add Course
        </button>
      </div>

      {/* Search Bar (Full Width Below) */}
      <div className={styles.searchBarContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search By Course Name"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Table Heading */}
      <h3 className={styles.subHeading}>CREATED COURSES LIST</h3>

      {/* Table Section */}
      <div className={styles.tableWrapper}>
        <DynamicTable
          columns={[
            { header: "S.no", accessor: "serial" },
            { header: "Portal", accessor: "portal" },
            { header: "Exam", accessor: "exam" },
            { header: "Course", accessor: "courseName" },
            { header: "Duration", accessor: "duration" },
            { header: "Cost", accessor: "cost" },
            { header: "Discount", accessor: "discount" },
            { header: "Total Price", accessor: "total" }
          ]}
          data={filteredCourses}
          onEdit={(item) => console.log("Edit", item)}
          onDelete={(item) => console.log("Delete", item)}
          onToggle={(item) => console.log("Toggle Activation", item)}
        />
      </div>
    </div>
  );
};

export default CourseCreation;
