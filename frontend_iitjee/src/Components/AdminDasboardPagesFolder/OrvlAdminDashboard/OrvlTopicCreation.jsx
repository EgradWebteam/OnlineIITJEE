import React, { useState, useEffect } from "react";
import axios from "axios";
import OrvlTopicForm from "./orvlTopicForm.jsx";
import ORVLDynamicTable from "./ORVLDynamicTable.jsx";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from "../../../config/apiConfig.js";

const OrvlTopicCreation = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);  // State to store the selected topic for editing

  const handleAddTopicClick = () => {
    setShowForm(prev => !prev);
    setSelectedTopic(null); // Clear the selected topic when adding a new topic
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedTopic(null); // Clear the selected topic on close
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/OrvlTopicCreation/getTopics`);
      setTopics(response.data);
    } catch (err) {
      console.error("❌ Error fetching topics:", err);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleEdit = (row) => {
    console.log("✏️ Edit clicked for:", row);
    setSelectedTopic(row);  // Set the selected topic for editing
    setShowForm(true);  // Show the form to edit
  };

  const handleDelete = async (row) => {
    try {  const response = await axios.delete(`${BASE_URL}/OrvlTopicCreation/deleteTopic/${row.orvl_topic_id}`);

      fetchTopics(); // Refresh after delete
    } catch (err) {
      console.error("❌ Error deleting topic:", err);
    }
  };

  const columns = topics.length
    ? Object.keys(topics[0])
        .filter((key) => key !== "exam_id") // Exclude 'exam_id' or other unwanted fields
        .map((key) => ({
          header: key.replace(/_/g, " ").toUpperCase(),
          accessor: key,
        }))
    : [];

  return (
    <div>
      <h2>Topics</h2>
      <button onClick={handleAddTopicClick} className={styles.addBtn}>
        {showForm ? "Close Form" : "Add Topic"}
      </button>
      {showForm && (
        <OrvlTopicForm
          topic={selectedTopic}  // Pass selected topic to form for pre-filling
          onSuccess={fetchTopics}
          onClose={handleClose}
        />
      )}

      {/* 🔥 Table section */}
      <div style={{ padding: "2%" }}>
        <ORVLDynamicTable
          columns={columns}
          data={topics}
          type="orvltopic"
          showEdit={true}
          showToggle={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default OrvlTopicCreation;
