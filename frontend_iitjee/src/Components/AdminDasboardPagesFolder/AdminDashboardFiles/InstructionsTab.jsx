import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../../Config/ApiConfig.js";
import styles from "../../../Styles/AdminDashboardCSS/Instruction.module.css";
import DynamicTable from "../AdminDashboardFiles/DynamicTable.jsx";

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
      setInstructionImage(data.instructionImg || null); // <-- new
      setSelectedExam(row.exam_id);
      setHeading(row.heading);
      setIsReadOnly(true);
    } catch (error) {
      console.error("Error opening edit form:", error);
    }
  };

  const handleToggle = (row) => console.log("Toggle", row);

  const data = instructionDetails?.instructions
    ? instructionDetails.instructions.map((instruction, index) => ({
        sno: index + 1,
        examName: instruction.exam_name,
        heading: instruction.instruction_heading,
        docName: instruction.document_name,
        isActive: true, // or use instruction.is_active if present
        instruction_id: instruction.instruction_id,
        exam_id: instruction.exam_id || null, // only if exam_id is needed
      }))
    : [];

  const instructionId = instructionDetails?.instructions?.[0]?.instruction_id;

  const handleUpdate = async () => {
    console.log("Updating instructionId:", instructionId);
    try {
      const formattedPoints = instructionPoints
        .filter((point) => point.trim() !== "")
        .map((point) => point)
        .join("\n");

      const payload = {
        exam_id: selectedExam,
        instruction_heading: heading,
        instruction_points: formattedPoints,
        instruction_img: instructionImage, // full base64 string
      };

      const res = await fetch(
        `${BASE_URL}/Instructions/UpdateInstruction/${instructionId}`,
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
        alert("Instruction updated successfully!");
        setIsReadOnly(true);
      } else {
        alert(result.message || "Failed to update instruction.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating.");
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
        // Refresh the data or filter it out from the current state
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
            setIsReadOnly(false); // enable inputs when manually adding
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
          <label>
            Select Exam:
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
          </label>

          <label>
            Instructions Heading:
            <input
              type="text"
              placeholder="Enter Heading"
              value={heading}
              onChange={handleHeadingChange}
              disabled={isReadOnly}
            />
          </label>

          {!isReadOnly && (
            <label>
              Instructions Document:
              <input type="file" onChange={handleFileChange} />
            </label>
          )}

          <div>
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

      <div style={{ marginTop: "20px" }}>
        <DynamicTable
        isOpen={isOpen}
          columns={columns}
          data={data}
          showEdit={false}
          onOpen={handleOpen}
          onDelete={handleDelete}
          // onToggle={handleToggle}
          showToggle={false}
        />
      </div>

      {instructionPoints.length > 0 && (
        <div className={styles.instructionPoints}>
          <h4>Instruction Points:</h4>

          {instructionImage && (
            <div className={styles.instructionImage}>
              <img
                src={`data:image/png;base64,${instructionImage}`}
                alt="Instruction"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  marginBottom: "1rem",
                }}
              />
            </div>
          )}

          <ol>
            {instructionPoints.map((point, index) => (
              <li key={index}>
                {isReadOnly ? (
                  point
                ) : (
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const updated = [...instructionPoints];
                      updated[index] = e.target.value;
                      setInstructionPoints(updated);
                    }}
                    style={{ width: "100%", height: "10rem" }}
                  />
                )}
              </li>
            ))}
          </ol>
          {!isReadOnly && (
            <div style={{ marginBottom: "1rem" }}>
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
                    setInstructionImage(reader.result); // full base64 string with mime
                  };
                  if (file) reader.readAsDataURL(file);
                }}
              />
            </div>
          )}
          {isReadOnly ? (
            <button
              onClick={() => setIsReadOnly(false)}
              className={styles.editBtn}
            >
              Edit
            </button>
          ) : (
            <button onClick={handleUpdate} className={styles.updateBtn}>
              Update
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructionsTab;
