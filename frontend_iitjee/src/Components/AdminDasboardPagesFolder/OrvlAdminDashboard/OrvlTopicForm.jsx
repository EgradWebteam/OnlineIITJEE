import React from 'react';

const TopicForm = () => {
  return (
    <div>
      <h3>Create a New Topic</h3>
      <form>
        <input type="text" placeholder="Enter topic name" />
        
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TopicForm;
