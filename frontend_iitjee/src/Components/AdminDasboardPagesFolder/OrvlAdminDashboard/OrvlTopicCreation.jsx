import React, { useState, useEffect } from "react";
import axios from "axios";
import OrvlTopicForm from "./OrvlTopicForm.jsx";
import DynamicTable from "../AdminDashboardFiles/DynamicTable.jsx";
import styles from "../../../Styles/AdminDashboardCSS/CourseCreation.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import { FaSearch } from "react-icons/fa"; 

const OrvlTopicCreation = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleAddTopicClick = () => {
    setShowForm((prev) => !prev);
    setSelectedTopic(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedTopic(null);
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/OrvlTopicCreation/getTopics`);
      setTopics(response.data);
    } catch (err) {
      console.error("❌ Error fetching topics:", err);
      alert("Error fetching topics!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleEdit = (row) => {
    setSelectedTopic(row);
    setShowForm(true);
  };

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the topic "${row.orvl_topic_name}"?`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const response = await axios.delete(`${BASE_URL}/OrvlTopicCreation/deleteTopic/${row.orvl_topic_id}`);
      fetchTopics();
      alert("Topic deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting topic:", err);
      alert("Error deleting topic!");
    } finally {
      setLoading(false);
    }
  };

  const columns = topics.length
    ? Object.keys(topics[0])
        .filter((key) => key !== "exam_id")
        .map((key) => ({
          header: key.replace(/_/g, " ").toUpperCase(),
          accessor: key,
        }))
    : [];

  const filteredTopics = topics.filter((topic) => {
    return Object.values(topic).some((value) =>
      value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastTopic = currentPage * itemsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - itemsPerPage;
  const currentTopics = filteredTopics.slice(indexOfFirstTopic, indexOfLastTopic);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredTopics.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div>
      <div className={styles.pageHeading}>TOPIC CREATION</div>



      <div className={styles.flex}>
        <button onClick={handleAddTopicClick} className={styles.addCourseBtn}>
          {showForm ? "Close Form" : "Add Topic"}
        </button>
      </div>

      <div className={styles.searchBarContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search topics..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {showForm && (
        <OrvlTopicForm topic={selectedTopic} onSuccess={fetchTopics} onClose={handleClose} />
      )}

      {loading && <div className={styles.loading}>Loading...</div>}

      <div style={{ padding: "2%" }}>
        <DynamicTable
          columns={columns}
          data={currentTopics}
          type="orvltopic"
          showEdit={true}
          showToggle={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className={styles.pagination}>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ""}`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrvlTopicCreation;
