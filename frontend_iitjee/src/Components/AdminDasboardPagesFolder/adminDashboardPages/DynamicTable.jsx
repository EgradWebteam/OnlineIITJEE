import React from 'react';
import styles  from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling


const DynamicTable = ({ columns, data, onEdit, onDelete, onToggle }) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => <th key={i}>{col.header}</th>)}
            <th>Action</th>
            <th>Course Activation</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className={styles.noData}>No data available</td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri}>
                {columns.map((col, ci) => (
                  <td key={ci}>{row[col.accessor]}</td>
                ))}
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(row)}>✏️</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(row)}>🗑️</button>
                </td>
                <td>
                  <button
                    className={`${styles.toggleBtn} ${row.isActive ? styles.deactivate : styles.activate}`}
                    onClick={() => onToggle(row)}
                  >
                    {row.isActive ? 'Deactivate Course' : 'Activate Course'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
