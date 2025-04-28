import React from "react";
import styles from "../../../Styles/AdminDashboardCSS/AdminDashboard.module.css";

const ORVLDynamicTable = ({ columns, data, onEdit, onDelete,course }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className={styles.noData}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri}>
                {columns.map((col, ci) => (
                  <td key={ci}>
                    {col.render ? col.render(row, ci) : row[col.accessor] || "N/A"}
                  </td>
                ))}
                <td className={styles.actions}>
                  {onEdit && (
                    <button className={styles.editBtn} onClick={() => onEdit(row)}>
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button className={styles.deleteBtn} onClick={() => onDelete(row)}>
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ORVLDynamicTable;
