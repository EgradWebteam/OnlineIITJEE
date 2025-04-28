import React, { useState, useEffect } from "react";
import axios from "axios";
import OrvlTopicForm from "./OrvlTopicForm.jsx";
import ORVLDynamicTable from "./ORVLDynamicTable.jsx";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";

const OrvlTopicCreation = () => {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);  
  const [loading, setLoading] = useState(false);  

  const handleAddTopicClick = () => {
    setShowForm(prev => !prev);
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
    console.log("✏️ Edit clicked for:", row);
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
      alert("Topic deleted successfully!");  // Show success message using alert
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

  return (
    <div>
     <div className={styles.pageHeading}>TOPIC CREATION</div>
     <div>
     <button onClick={handleAddTopicClick} className={styles.addbutton}>
        {showForm ? "Close Form" : "Add Topic"}
      </button>
     </div>
      {showForm && (
        <OrvlTopicForm
          topic={selectedTopic}  
          onSuccess={fetchTopics}
          onClose={handleClose}
        />
      )}

      {loading && <div className={styles.loading}>Loading...</div>}
      
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
