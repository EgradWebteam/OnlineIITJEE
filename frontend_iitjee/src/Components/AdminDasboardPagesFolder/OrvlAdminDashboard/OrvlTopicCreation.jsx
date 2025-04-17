import React, { useState, useEffect } from "react";
import axios from "axios";
import OrvlTopicForm from "./OrvlTopicForm.jsx";
import ORVLDynamicTable from "./ORVLDynamicTable.jsx";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from "../../../config/apiConfig.js";
const OrvlTopicCreation = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);

  const handleAddTopicClick = () => {
    setShowForm(prev => !prev);
  };
  const handleClose = () => {
    setShowForm(false);
  };
  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/OrvlTopicCreation/getTopics`);
      console.log("Fetched Topics:", response.data);  // Verify data here
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
    // You can pass this row to a form or open modal to update topic
  };

  const handleDelete = async (row) => {
    try {
      await axios.delete(`/deleteTopic/${row.orvl_topic_id}`);
      fetchTopics(); // Refresh after delete
    } catch (err) {
      console.error("❌ Error deleting topic:", err);
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

  return (
    <div>
      <h2>Topics</h2>
      <button onClick={handleAddTopicClick} className={styles.addBtn}>
        {showForm ? "Close Form" : "Add Topic"}
      </button>
      {showForm && <OrvlTopicForm onSuccess={fetchTopics} onClose={handleClose} />}

      {/* 🔥 Table section */}
      < div style={{padding:"2%"}}>
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
