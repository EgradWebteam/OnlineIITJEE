import React, { useState, useEffect, useMemo } from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import JSZip from "jszip";
import mammoth from "mammoth";
import DynamicTable from "./DynamicTable.jsx";
import { FaSearch } from 'react-icons/fa';

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
  const [currentPage, setCurrentPage] = useState(1);
   const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  
 
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


   const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/DocumentUpload/getUploadedDocuments`
        );
        const data = await response.json();
        if (data.documents) {
          setDocumentList(data.documents[0]); 
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    
  useEffect(() => {
    fetchDocuments();
  }, []); 

  const columns = useMemo(
    () => [
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
        accessor: "document_id", 
      },
      {
        header: "Test Name",
        accessor: "test_name",
      },
      {
        header: "Document Name",
        accessor: "document_name",
      },
    ],
    [selectedRows, documentList]
  );

  
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
  }, [selectedTest]); 

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSelectRow = (documentId) => {
    setSelectedRows((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };
  const handleOpen = (row) => {
    //console.log("Open clicked for:", row);
    
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
    if (!selectedTest || !selectedSubject || !selectedSection) {
      alert("Please make sure all fields are filled.");
      return;
    }
    // console.log("Form Submitted with Data: ", {
    //   test: selectedTest,
    //   subject: selectedSubject,
    //   section: selectedSubject,
    // });
  };

  const handleFileClick = (e) => {
    if (!selectedTest || !selectedSubject) {
      e.preventDefault(); // Prevent file selection popup
      alert("Please select a Test and Subject before uploading a file.");
    }
  };
  const handleDeleteDocument = async (row) => {
    const documentId = row.document_id; // ✅ Extract ID from the row
  
    const confirmDelete = window.confirm("Are you sure you want to delete this document and all its associated data?");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`${BASE_URL}/DocumentUpload/DeleteTestPaperDocument/${documentId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Document and related data deleted successfully.");
        setDocumentList(prev => prev.filter(doc => doc.document_id !== documentId));
        setSelectedRows(prev => prev.filter(id => id !== documentId));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete the document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("An unexpected error occurred while deleting the document.");
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
          setTestPaperContent(
            "<p>Error reading the document. Please try again.</p>"
          );
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();

    setLoading(true); 

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
         // Clear form fields
          setSelectedTest("");
          setSelectedSubject("");
          setSelectedSection("");
          setFile(null);
          setTestPaperContent("");
          setValidationErrors([]);
          setSubjects([]);
          setSections([]);
        setIsDocumentVisible(false);
        //  setShowForm(false);
        fetchDocuments();
      } else {
        alert("Failed to upload the document. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const filteredDocuments = documentList.filter(documentList => {
    return Object.values(documentList).some(value => 
      value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);

 
  return (
    <div className={styles.InstructionContainer}>
      <div className={styles.pageHeading}>DOCUMENT UPLOAD</div>

      {!showForm && (
        <div className={styles.flex}>
          <button
            className={styles.uploadButton}
            onClick={() => setShowForm(true)}
          >
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
            <div className={styles.DocumetnUploadSelectInputs}>
              <label>Select Test:</label>
              <select
                name="test"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                <option value="">Select Test</option>
                {testDetails.map((test) => (
                  <option
                    key={test.test_creation_table_id}
                    value={test.test_creation_table_id}
                  >
                    {test.test_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.DocumetnUploadSelectInputs}>
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

            <div className={styles.DocumetnUploadSelectInputs}>
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

            <div className={styles.DocumetnUploadSelectInputs}>
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
<div className={styles.searchBarContainer}>
                   <FaSearch className={styles.searchIcon} />
                    <input 
                      type="text" 
                      placeholder="Search Documents..." 
                      className={styles.searchInput}
                      value={searchTerm}
                      onChange={handleSearchChange} 
                    />
               
            
                  </div>
      {/* Render the table with the fetched documents */}
      <div style={{ padding: "3%" }}>
        <DynamicTable
          columns={columns}
          data={currentDocuments}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onEdit={false}
          onDelete={handleDeleteDocument}
          onOpen={handleOpen}
          isOpen={true}
          type="document"
       
        />
      </div>
      <div className={styles.pagination}>
  {Array.from({ length: Math.ceil(filteredDocuments.length / itemsPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={currentPage === i + 1 ? styles.pageButtonActive : styles.pageButton}
    >
      {i + 1}
    </button>
  ))}
</div>

      
    </div>
  );
};

export default DocumentUpload;
