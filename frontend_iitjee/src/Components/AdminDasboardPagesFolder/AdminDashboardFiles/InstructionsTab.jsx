import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import styles from "../../../Styles/AdminDashboardCSS/Instruction.module.css";
import DynamicTable from "../AdminDashboardFiles/DynamicTable.jsx";
import { FaSearch } from 'react-icons/fa';

const InstructionsTab = () => {
  const isOpen=true
  const [showForm, setShowForm] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [heading, setHeading] = useState("");
  const [file, setFile] = useState(null);
  const [instructionDetails, setInstructionDetails] = useState(null);
  const [instructionPoints, setInstructionPoints] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showInstructionPoints, setShowInstructionPoints] = useState(false); 
 const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const columns = [
    { header: "S.NO", accessor: "sno" },
    { header: "Exam Name", accessor: "examName" },
    { header: "Instructions Heading", accessor: "heading" },
    { header: "Document Name", accessor: "docName" },
   
  ];

  // Fetch exam list
  useEffect(() => {
    fetch(`${BASE_URL}/Instructions/InstructionsFormData`)
      .then((response) => response.json())
      .then((data) => {
        setExams(data.exams || []);
      })
      .catch((error) => console.error("Error fetching exams:", error));
  }, []);

  // Fetch instruction table data
  useEffect(() => {
    const fetchInstructionDetails = async () => {
  
      try {
        const res = await fetch(
          `${BASE_URL}/Instructions/GetInstructionDetails`
        );
        const data = await res.json();
        setInstructionDetails(data);
      } catch (err) {
        console.error("Error fetching instruction details:", err);
      }
    };
    fetchInstructionDetails();
  }, []);

  const handleExamChange = (e) => setSelectedExam(e.target.value);
  const handleHeadingChange = (e) => setHeading(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleUpload = async () => {
    if (!selectedExam || !heading || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("exam_id", selectedExam);
    formData.append("instruction_heading", heading);
    formData.append("document", file);

    try {
      const res = await fetch(`${BASE_URL}/Instructions/UploadInstructions`, {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response: ${text}`);
      }

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Instruction uploaded successfully!");
        setShowForm(false);
        window.location.reload(); // Refresh data after upload
      } else {
        alert(result.message || "Failed to upload instruction.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    }
  };

  const [instructionImage, setInstructionImage] = useState(null);

  const handleOpen = async (row) => {
 
    try {
      const res = await fetch(
        `${BASE_URL}/Instructions/GetInstructionPoints/${row.instruction_id}`
      );
      if (!res.ok) throw new Error("Failed to fetch instruction points");
      const data = await res.json();
      setInstructionPoints(data.points || []);
      setInstructionImage(data.instructionImg || null); 
    
      setSelectedExam(row.exam_id);
      setHeading(row.heading);
      setIsReadOnly(true);
    } catch (error) {
      console.error("Error opening edit form:", error);
    }
  };


  const data = instructionDetails?.instructions
    ? instructionDetails.instructions.map((instruction, index) => ({
        sno: index + 1,
        examName: instruction.exam_name,
        heading: instruction.instruction_heading,
        docName: instruction.document_name,
        isActive: true, 
        instruction_id: instruction.instruction_id,
        exam_id: instruction.exam_id || null, // only if exam_id is needed
      }))
    : [];
    const filteredInstructions = data.filter(data => {
      return Object.values(data).some(value => 
        value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredInstructions.slice(indexOfFirstItem, indexOfLastItem);


  const handleUpdate = async (pointId, updatedPointText) => {
    try {
      const payload = {
        exam_id: selectedExam,
        instruction_heading: heading,
        instruction_points:String(updatedPointText),  // Send the updated point's text
        instruction_img: instructionImage,
      };
 
      const res = await fetch(
        `${BASE_URL}/Instructions/UpdateInstruction/${pointId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      const result = await res.json();
      if (res.ok) {
        alert("Instruction point updated successfully!");
        setIsReadOnly(true);
      } else {
        alert(result.message || "Failed to update instruction point.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating instruction point.");
    }
  };
  
  

  const handleDelete = async (row) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this instruction?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${BASE_URL}/Instructions/DeleteInstruction/${row.instruction_id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Instruction deleted successfully");
        setInstructionDetails((prev) => ({
          ...prev,
          instructions: prev.instructions.filter(
            (item) => item.instruction_id !== row.instruction_id
          ),
        }));
      } else {
        alert(result.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting");
    }
  };

  return (
    <div className={styles.InstructionContainer}>
   
      <div className={styles.pageHeading}>INSTRUCTION PAGE</div>

      <div className={styles.addButtonContainer}>
        <button
          className={styles.addButton}
          onClick={() => {
            setShowForm(!showForm);
            setIsReadOnly(false); 
            setSelectedExam("");
            setHeading("");
            setFile(null);
            setInstructionPoints([]);
          }}
        >
          {showForm && !isReadOnly ? "Close Form" : "Add Instruction"}
        </button>
      </div>
 
      {showForm && (
        <div className={styles.uploadForm}>
          <div className={styles.UploadFormLabels}>
          <label>
            Select Exam:
            </label>
            <select
              onChange={handleExamChange}
              value={selectedExam}
              disabled={isReadOnly}
            >
              <option value="" disabled>
                Select Exam
              </option>
              {exams.map((exam) => (
                <option key={exam.exam_id} value={exam.exam_id}>
                  {exam.exam_name}
                </option>
              ))}
            </select>
        </div>
        <div className={styles.UploadFormLabels}>
          <label>
            Instructions Heading:</label>
            <input
              type="text"
              placeholder="Enter Heading"
              value={heading}
              onChange={handleHeadingChange}
              disabled={isReadOnly}
            />
          </div>

          {!isReadOnly && (
             <div className={styles.UploadFormLabels}>
            <label>
              Instructions Document: </label>
              <input type="file" onChange={handleFileChange} />
           </div>
          )}

          <div  className={styles.UploadFormBtns}>
            <button
              className={styles.cancelBtn}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            {!isReadOnly && (
              <button className={styles.uploadBtn} onClick={handleUpload}>
                Upload
              </button>
            )}
          </div>
        </div>
      )}
<div className={styles.searchBarContainer}>
       <FaSearch className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search instructions..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange} 
        />
   

      </div>
      <div style={{ marginTop: "20px" }}>
        <DynamicTable
        isOpen={isOpen}
          columns={columns}
          data={currentData}
          showEdit={false}
          onOpen={handleOpen}
          onDelete={handleDelete}
          showToggle={false}
            setShowInstructionPoints={setShowInstructionPoints} 
  tableType="instruction"
        
        />
      </div>
    <div className={styles.pagination}>
  {Array.from({ length: Math.ceil(filteredInstructions.length / itemsPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={currentPage === i + 1 ? styles.pageButtonActive : styles.pageButton}
    >
      {i + 1}
    </button>
  ))}
</div>
      {showInstructionPoints && (
        <div className={styles.modalBackdrop} onClick={() => setShowInstructionPoints(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.InstructionTabHeadandbtn}>
            <h4>Instruction Points:</h4>

            {/* Close button to hide the section */}
            <button
              className={styles.closeFormBtn}
              onClick={() => setShowInstructionPoints(false)} // Close the modal
            >
               ❌
            </button>
            </div>
            {instructionImage && (
              <div className={styles.instructionImage}>
                <img
                  src={`data:image/png;base64,${instructionImage}`}
                  alt="Instruction"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    marginBottom: '1rem',
                  }}
                />
              </div>
            )}

<ol className={styles.listsInstructionpageContainer}>
  {instructionPoints.map((point, index) => (
    <li key={point.id} className={styles.listsInstructionpage}>
      {/* Show the point text if it's in read-only mode */}
      {isReadOnly ? (
        <>
        <p>
          {point.point} 
          </p>
          <button 
            onClick={() => setIsReadOnly(false)} 
            style={{  }}
            className={styles.EditBtnForInstructions}
          >
            Edit
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={point.point}
            onChange={(e) => {
              const updated = [...instructionPoints];
              updated[index].point = e.target.value;
              setInstructionPoints(updated);
            }}
            style={{ width: '100%', height: '10rem' }}
          />
          <button  className={styles.SaveBtnForInstrctionpage}
            onClick={() => handleUpdate(point.id, point.point)}  
            style={{ marginTop: '10px', cursor: 'pointer' }}
          >
            Save
          </button>
        </>
      )}
    </li>
  ))}
</ol>




            {!isReadOnly && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="imageUpload">
                  <strong>Upload New Instruction Image:</strong>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setInstructionImage(reader.result);
                    };
                    if (file) reader.readAsDataURL(file);
                  }}
                />
              </div>
            )}

          
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructionsTab;
