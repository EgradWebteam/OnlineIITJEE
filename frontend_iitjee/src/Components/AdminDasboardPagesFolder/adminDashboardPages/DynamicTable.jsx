import React, { useState } from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";
import ArrangeQuestions from "./ArrangeQuestion";
import ViewQuestions from "./ViewQuestions";

const DynamicTable = ({
  columns,
  isOpen,
  data,
  type,
  onEdit,
  onOpen,
  onDelete,
  onToggle,
  onAssign,
  onDownload,
  showEdit = true,
  showToggle = true,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [popupType, setPopupType] = useState(""); // "arrange" or "viewQuestions"

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
        alert("View Results clicked");
        break;
      case "takeTest":
        alert("Take Test clicked");
        break;
      case "assignTest":
        onAssign?.(row);
        break;
      case "downloadPaper":
        onDownload?.(row);
        break;
      case "deleteTest":
        onDelete?.(row);
        break;
      default:
        break;
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
            {showToggle && <th>Course Activation</th>}
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
                  {type === "testCreation" ? (
                    <div className={styles.dropdownWrapper}>
                      <select
                        className={styles.dropdownMenu}
                        onChange={(e) => handleOptionSelect(e, row)}
                      >
                        <option value="Action">Actions ▼</option>
                        <option value="edit">Edit Test</option>
                        <option value="addDocx">Add Question DOCX</option>
                        <option value="viewQuestions">View Questions</option>
                        <option value="arrangeQuestions">⇅ Arrange Questions</option>
                        <option value="viewResults">View Results</option>
                        <option value="takeTest">Take Test</option>
                        <option value="assignTest">📌 Assign to Test</option>
                        <option value="downloadPaper">Download Paper</option>
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
                {showToggle && (
                  <td>
                    <button
                      className={`${styles.toggleBtn} ${row.test_activation === "active" ? styles.deactivate : styles.activate}`}
                      onClick={() => onToggle(row)}
                    >
                      {row.test_activation === "active" ? "Deactivate" : "Activate"}
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
          <ArrangeQuestions row={selectedRow} onClose={handleClosePopup} />
        </div>
      )}

      {popupType === "viewQuestions" && selectedRow && (
        <div className={styles.popupWrapper}>
          <ViewQuestions data={selectedRow} onClose={handleClosePopup} />
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
