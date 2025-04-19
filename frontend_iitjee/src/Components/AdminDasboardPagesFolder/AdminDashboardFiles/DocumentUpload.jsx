import React, { useState, useEffect,useMemo } from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js';
import JSZip from "jszip";
import mammoth from "mammoth";
import DynamicTable from "./DynamicTable.jsx";

const DocumentUpload = () => {
  const [showForm, setShowForm] = useState(false);
  const [testDetails, setTestDetails] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [file, setFile] = useState(null);
  const [testPaperContent, setTestPaperContent] = useState("");
  const [isDocumentVisible, setIsDocumentVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [documentList, setDocumentList] = useState([]); // State to store documents
 
  // Fetch test details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/DocumentUpload/TestNameFormData`
        );
        const data = await response.json();
        if (data.testDetails) {
          setTestDetails(data.testDetails);
        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    fetchTestDetails();
  }, []);

  // Fetch documents for the table
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${BASE_URL}/DocumentUpload/getUploadedDocuments`);
        const data = await response.json();
        if (data.documents) {
          setDocumentList(data.documents[0]); // Store the fetched documents in state
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []); // Fetch documents when the component mounts

  const columns = useMemo(() => [
    {
      header: (
        <input
          type="checkbox"
          checked={
            documentList.length > 0 &&
            selectedRows.length === documentList.length
          }
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      accessor: "select",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.document_id)}
          onChange={() => handleSelectRow(row.document_id)}
        />
      ),
    },
    {
      header: "document_id",
      accessor: "document_id", // assuming you use this as serial number
    },
    {
      header: "Test Name",
      accessor: "test_name",
    },
    {
      header: "Document Name",
      accessor: "document_name",
    },
  ], [selectedRows, documentList]);
  
 
  // Fetch subjects based on selected test
  useEffect(() => {
    if (selectedTest) {
      const fetchSubjects = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/DocumentUpload/subject/${selectedTest}`
          );
          const data = await response.json();
          if (data.subjectName) {
            setSubjects(data.subjectName);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };

      fetchSubjects();
    }
  }, [selectedTest]); // Run this effect whenever the selectedTest changes

  useEffect(() => {
    if (selectedTest && selectedSubject) {
      const fetchSections = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/DocumentUpload/SectionNames/${selectedTest}/${selectedSubject}`
          );
          const data = await response.json();
          if (data.sectionName) {
            setSections(data.sectionName);
          }
        } catch (error) {
          console.error("Error fetching sections:", error);
        }
      };

      fetchSections();
    }
  }, [selectedTest, selectedSubject]);

// Toggle single row selection
const handleSelectRow = (documentId) => {
  setSelectedRows((prev) =>
    prev.includes(documentId)
      ? prev.filter((id) => id !== documentId)
      : [...prev, documentId]
  );
};
const handleOpen = (row) => {
  console.log("Open clicked for:", row);
  // Add logic to open your modal or do whatever you need with the `row`
};

const handleSelectAll = (isChecked) => {
  if (isChecked) {
    const allDocumentIds = documentList.map((doc) => doc.document_id);
    setSelectedRows(allDocumentIds);
  } else {
    setSelectedRows([]);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate if all fields are selected before submitting
    if (!selectedTest || !selectedSubject || !selectedSection) {
      alert("Please make sure all fields are filled.");
      return;
    }

    // Proceed with the form submission logic
    console.log("Form Submitted with Data: ", {
      test: selectedTest,
      subject: selectedSubject,
      section: selectedSubject,
    });
  };

  const handleFileClick = (e) => {
    // Run validation before allowing file selection
    if (!selectedTest || !selectedSubject) {
      e.preventDefault(); // Prevent file selection popup
      alert("Please select a Test and Subject before uploading a file.");
    }
  };

  const handleDocumentUpload = (event) => {
    setFile(event.target.files[0]);
    const file = event.target.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const zip = await JSZip.loadAsync(arrayBuffer);
          const images = {};
          await Promise.all(
            Object.keys(zip.files).map(async (filename) => {
              if (filename.startsWith("word/media/")) {
                const image = await zip.files[filename].async("base64");
                images[filename] = `data:image/${filename
                  .split(".")
                  .pop()};base64,${image}`;
              }
            })
          );
          const { value } = await mammoth.convertToHtml({ arrayBuffer });
          const htmlContent = typeof value === "string" ? value : "";
          setTestPaperContent(htmlContent);
          setIsDocumentVisible(true);
        } catch (error) {
          setTestPaperContent("<p>Error reading the document. Please try again.</p>");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("subjectId", selectedSubject);
      if (selectedSection !== null) {
        formData.append("sectionId", selectedSection);
      }
      formData.append("testCreationTableId", selectedTest);

      const response = await fetch(
        `${BASE_URL}/DocumentUpload/UploadTestPaperDocument`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Successfully uploaded Document");
        setIsDocumentVisible(false);
      } else {
        alert("Failed to upload the document. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className={styles.documentContent}>
      <h2>DOCUMENT UPLOAD</h2>

      {!showForm && (
        <div className={styles.flex}>
        <button className={styles.uploadButton} onClick={() => setShowForm(true)}>
          Upload Test Paper
        </button>
        </div>
      )}

{showForm && (
  <form className={styles.formContainer} onSubmit={handleSubmit}>
    {/* Header row with Close Button */}
    <div className={styles.formHeader}>
      <h3>Upload Test Paper Form</h3>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => setShowForm(false)}
      >
        ✖ Close
      </button>
    </div>

    <div className={styles.DocumentUploadForm}>
      <div>
        <label>Select Test:</label>
        <select
          name="test"
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
        >
          <option value="">Select Test</option>
          {testDetails.map((test) => (
            <option key={test.test_creation_table_id} value={test.test_creation_table_id}>
              {test.test_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Select Subject:</label>
        <select
          name="subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
          disabled={!selectedTest}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((subject) => (
            <option key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Select Section:</label>
        <select
          name="section"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          required
          disabled={!selectedSubject}
        >
          <option value="">-- Select Section --</option>
          {sections.map((section) => (
            <option key={section.section_id} value={section.section_id}>
              {section.section_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Upload Document:</label>
        <input
          type="file"
          onChange={handleDocumentUpload}
          onClick={handleFileClick}
          accept=".docx"
          required
        />
      </div>
    </div>

    {file && isDocumentVisible && (
      <div className={styles.DocumentContentDiv}>
        <h2>Test Paper Content:</h2>
        <div
          className={styles.TestPaperContent}
          dangerouslySetInnerHTML={{ __html: testPaperContent }}
        />
        {validationErrors.length === 0 && (
          <button onClick={handleSaveDocument}>Upload</button>
        )}
        {loading && <div>Uploading the test paper. Please wait...</div>}
      </div>
    )}
  </form>
)}



      {/* Render the table with the fetched documents */}
      <div style={{padding:"3%"}}>
      <DynamicTable
        columns={columns}
        data={documentList}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onEdit={false}
        onOpen={handleOpen}
        isOpen={true}
        type="document"
      />
      </div>
     
    </div>
  );
};

export default DocumentUpload;
