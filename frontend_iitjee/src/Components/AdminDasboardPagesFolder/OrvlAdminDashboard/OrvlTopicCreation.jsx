import React, { useState } from 'react';
import OrvlTopicForm from './OrvlTopicForm.jsx'; // Make sure the path is correct

const OrvlTopicCreation = () => {
  const [showForm, setShowForm] = useState(false);

  const handleAddTopicClick = () => {
    setShowForm(prev => !prev);
  };

  return (
    <div>
      <h2>Topics</h2>
      <button onClick={handleAddTopicClick}>
        {showForm ? 'Close Form' : 'Add Topic'}
      </button>
      {showForm && <OrvlTopicForm />}
    </div>
  );
};

export default OrvlTopicCreation;
