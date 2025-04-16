import React, { useEffect, useState } from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import ArrangeQuestions from "./ArrangeQuestion";
import ViewQuestions from "./ViewQuestions";
import ViewResults from "./ViewResults"; // Assuming ViewResults is another component
import { RxWidth } from "react-icons/rx";
import { encryptBatch } from '../../../utils/cryptoUtils.jsx';
import AssignToTest from "./AssignToTest";

const DynamicTable = ({
  columns,
  isOpen,
  data,
  type, // "test" or "course"
  onEdit,
  onOpen,
  onDelete,
  onToggle,
  onAssign,
  onDownload,
  showEdit = true,
  showToggle = true,
  tableType, // Pass a tableType to differentiate between multiple tables
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupType, setPopupType] = useState(""); // "arrange", "viewQuestions", or "viewResults"

  useEffect(() => {
    console.log("Selected Row", selectedRow); // This will log selected row whenever it changes
  }, [selectedRow]);

  const handleOptionSelect = (e, row) => {
    const selectedOption = e.target.value;

    switch (selectedOption) {
      case "edit":
        onEdit?.(row);
        break;
      case "addDocx":
        alert("Add DOCX clicked");
        break;
      case "viewQuestions":
        setSelectedRow(row);
        setPopupType("viewQuestions");
        break;
      case "arrangeQuestions":
        setSelectedRow(row);
        setPopupType("arrange");
        break;
      case "viewResults":
        setSelectedRow(row);
        setPopupType("viewResults");
        break;
      case "takeTest":
        handleTakeTest(row);
        break;
      case "assignTest":
        setSelectedRow(row);
        setPopupType("assignTest");
        break;
     
      case "deleteTest":
        onDelete?.(row);
        break;
      default:
        break;
    }
  };
  const handleTakeTest = async (row) => {
    try {
      const testId = row.test_creation_table_id;
  
      // Encrypt only the testId
      const encryptedArray = await encryptBatch([testId]);
      const encryptedTestId = encodeURIComponent(encryptedArray[0]);
  
      // Optional: Session token to protect route
      sessionStorage.setItem("navigationToken", "valid");
  
      // Get full screen dimensions
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
  
      // Build URL with only test ID
      const url = `/GeneralInstructions/${encryptedTestId}`;
      const features = `width=${screenWidth},height=${screenHeight},top=0,left=0`;
  
      // Open in new tab
      window.open(url, "_blank", features);
    } catch (err) {
      console.error("Encryption failed:", err);
    }
  };
  
  
  const handleClosePopup = () => {
    setPopupType("");
    setSelectedRow(null);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => <th key={i}>{col.header}</th>)}
            <th>Action</th>
            {showToggle && type !== "document" && (
              <th>{type === "test" ? "Test Activation" : "Course Activation"}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className={styles.noData}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri}>
                {columns.map((col, ci) => (
                  <td key={ci}>
                    {col.render ? col.render(row, ci) : row[col.accessor]}
                  </td>
                ))}
                <td className={styles.actions}>
                  {type === "test" ? (
                    <div className={styles.dropdownWrapper}>
                      <select
                        className={styles.dropdownMenu}
                        onChange={(e) => handleOptionSelect(e, row)}
                      >
                        <option value="Action">Actions ▼</option>
                        <option value="edit">Edit Test</option>
                        <option value="viewQuestions">View Questions</option>
                        <option value="arrangeQuestions">⇅ Arrange Questions</option>
                        <option value="viewResults">View Results</option> 
                        <option value="takeTest" onClick={handleTakeTest}>Take Test</option>
                        <option value="assignTest">📌 Assign to Test</option>
                        <option value="deleteTest">🗑️ Delete Test</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      {isOpen && (
                        <button className={styles.onOpen} onClick={() => onOpen(row)}>
                          Open
                        </button>
                      )}
                      {onEdit && (
                        <button className={styles.editBtn} onClick={() => onEdit?.(row)}>
                          ✏️
                        </button>
                      )}
                      <button className={styles.deleteBtn} onClick={() => onDelete(row)}>
                        🗑️
                      </button>
                    </>
                  )}
                </td>
                {showToggle && type !== "document" && (
                  <td>
                    <button
                      className={`${styles.toggleBtn} ${
                        type === "test"
                          ? row.test_activation === "active"
                            ? styles.deactivate
                            : styles.activate
                          : row.active_course === "active"
                          ? styles.deactivate
                          : styles.activate
                      }`}
                      onClick={() => {
                        console.log("Toggle clicked for row:", row);
                        onToggle(row);
                      }}
                    >
                      {type === "test"
                        ? row.test_activation
                        === "active"
                          ? "Deactivate Test"
                          : "Activate Test"
                        : row.active_course === "active"
                        ? "Deactivate Course"
                        : "Activate Course"
                      }
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Popup handler */}
      {popupType === "arrange" && selectedRow && (
        <div className={styles.popupWrapper}>
          <ArrangeQuestions data={selectedRow} onClose={handleClosePopup} />
        </div>
      )}

      {popupType === "viewQuestions" && selectedRow && (
        <div className={styles.popupWrapper}>
          <ViewQuestions data={selectedRow} onClose={handleClosePopup} />
        </div>
      )}

      {popupType === "viewResults" && selectedRow && (
        <div className={styles.popupWrapper}>
          <ViewResults
            testCreationTableId={selectedRow.test_creation_table_id}
            data={selectedRow}
            onClose={handleClosePopup}
          />
        </div>
      )}
 {popupType === "assignTest" && selectedRow && (
        <div className={styles.popupWrapper}>
          <AssignToTest data={selectedRow} onClose={handleClosePopup} />
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
