import React, { useState } from 'react';
import styles from '../../../Styles/AdminDashboardCSS/Instruction.module.css';
import DynamicTable from './DynamicTable';

const Instruction = () => {
  const [showForm, setShowForm] = useState(false);

  const columns = [
    { header: 'S.NO', accessor: 'sno' },
    { header: 'Exam Name', accessor: 'examName' },
    { header: 'Instructions Heading', accessor: 'heading' },
    { header: 'Document Name', accessor: 'docName' },
  ];

  const data = [
    {
      sno: 1,
      examName: 'GATE',
      heading: 'GATE',
      docName: 'VITEEE.docx',
      isActive: true,
    }
  ];

  const handleEdit = (row) => console.log("Edit", row);
  const handleDelete = (row) => console.log("Delete", row);
  const handleToggle = (row) => console.log("Toggle", row);

  return (
    <div className={styles.InstructionContainer}>
      <div className={styles.pageHeading }>INSTRUCTION PAGE</div>

      <div className={styles.addButtonContainer}>
        <button className={styles.addButton} onClick={() => setShowForm(!showForm)}>
          Add Instruction
        </button>
      </div>

      {showForm && (
  <div className={styles.uploadForm}>
    <label>
      Select Exam:
      <select defaultValue="">
        <option value="" disabled>Select Exam</option>
       
      </select>
    </label>

    <label>
      Instructions Heading:
      <input type="text" placeholder="Enter Heading" defaultValue="" />
    </label>

    <label>
      Instructions:
      <input type="file" />
    </label>

    <div>
      <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
      <button className={styles.uploadBtn}>Upload</button>
    </div>
  </div>
)}

      <div style={{ marginTop: '20px' }}>
        <DynamicTable
          columns={columns}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default Instruction;
