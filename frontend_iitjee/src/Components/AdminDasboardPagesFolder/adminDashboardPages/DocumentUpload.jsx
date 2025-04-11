import React, { useState, useEffect } from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import { BASE_URL } from "../../../../apiConfig";
import JSZip from "jszip";
import mammoth from "mammoth";

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
      const fetchSubjects = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/DocumentUpload/SectionNames/${selectedTest}/${selectedSubject}`
          );
          const data = await response.json();
          if (data.sectionName) {
            setSections(data.sectionName);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };

      fetchSubjects();
    }
  }, [selectedTest, selectedSubject]);

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleTestChange = (e) => {
    setSelectedTest(e.target.value);
  };
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
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
  const formatContent = (htmlContent) => {
    return htmlContent
      .split(/<p>|<\/p>/)
      .filter((line) => line.trim())
      .map((line) => {
        console.log("Processing line:", line); // Debugging

        const hasValidImageTag = (line) => {
          const imgMatch = line.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
          return imgMatch && imgMatch[1].trim() !== ""; // Ensures image src is not empty
        };

        // Ensure [Q] contains an image
        if (line.includes("[Q]")) {
          const hasImage =
            /<strong>.*?\[Q\].*?<img[^>]*>.*?<\/strong>/i.test(line) &&
            hasValidImageTag(line);
          if (!hasImage) {
            line = line.replace(
              "[Q]",
              "[Q]: <span style='color: red;'>(MISSING IMAGE)</span>"
            );
          }
        }

        // Ensure options (a), (b), (c), (d), and [soln] have images
        const optionTags = ["(a)", "(b)", "(c)", "(d)", "[soln]"];
        for (let i = 0; i < optionTags.length; i++) {
          const tag = optionTags[i];
          if (line.includes(tag)) {
            console.log(`Checking tag: ${tag} in line:`, line); // Debugging
            const hasImage = /<img[^>]*>/i.test(line) && hasValidImageTag(line);
            if (!hasImage) {
              line = line.replace(
                new RegExp(`\\(${tag.charAt(1)}\\)`, "g"), // Ensures (d) is captured correctly
                `${tag}: <span style='color: red;'>(MISSING IMAGE)</span>`
              );
            }
          }
        }

        // Ensure [qtype], [ans], [Marks], [sortid] are formatted correctly
        const textTags = ["qtype", "ans", "Marks", "sortid"];
        textTags.forEach((tag) => {
          if (line.includes(tag)) {
            const match = line.match(
              new RegExp(`\\[${tag.replace(/[\[\]]/g, "")}\\]\\s*(.*)`, "i")
            );
            const content = match ? match[1].trim() : "";

            if (!content) {
              line = `[${tag}] <span style="color: red;">(MISSING DATA)</span>`;
            } else {
              line = `[${tag}] ${content}<br />`;
            }
          }
        });

        return line;
      })
      .join("<br />");
  };
  const handleFileClick = (e) => {
    // Run validation before allowing file selection
    if (!selectedTest || !selectedSubject) {
      e.preventDefault(); // Prevent file selection popup
      alert("Please select a Test and Subject before uploading a file.");
      setValidateForm({
        ...validateForm,
        selectedTest: !selectedTest ? "Please select a Test.*" : "",
        selectedSubject: !selectedSubject ? "Please select a Subject.*" : "",
      });
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
          const formattedContent = formatContent(htmlContent, images);
          setTestPaperContent(formattedContent);
          setIsDocumentVisible(true);
          const errors = []; // Add validation errors later if needed
          setValidationErrors(errors);
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

    // If there are validation errors, do not proceed
    if (validationErrors.length > 0 || !testPaperContent) {
      alert("Please fix validation errors before uploading.");
      return;
    }

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
        console.error("Upload failed:", response.statusText);
        alert("Failed to upload the document. Please try again.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };
  return (
    <div className={styles.dashboardContent}>
      <h2>DOCUMENT UPLOAD</h2>

      {!showForm && (
        <button className={styles.uploadButton} onClick={handleButtonClick}>
          Upload Test Paper
        </button>
      )}
      {showForm && (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.DocumentUploadForm}>
            <div>
              <label>Select Test:</label>
              <select
                name="test"
                value={selectedTest}
                onChange={handleTestChange}
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

            <div>
              <label>Select Subject:</label>
              <select
                name="subject"
                value={selectedSubject}
                onChange={handleSubjectChange}
                required
                disabled={!selectedTest} // Disable if no test selected
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
                onChange={handleSectionChange}
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
                accept=".png,.jpg,.jpeg,.pdf,.docx"
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
              <div>
                {validationErrors.length === 0 && testPaperContent && (
                  <button onClick={handleSaveDocument}>Upload</button>
                )}
                <div>
                  {loading && (
                    <div>
                      <span>Uploading the test paper. Please wait...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default DocumentUpload;
