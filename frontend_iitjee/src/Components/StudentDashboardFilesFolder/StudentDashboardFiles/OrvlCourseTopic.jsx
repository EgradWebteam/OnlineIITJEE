import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../Config/ApiConfig.js'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup'; // Assuming Popup component is the same

const OrvlCourseTopic = ({ topicid, onBack }) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/OrvlTopics/CourseTopic/${topicid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }

        const data = await response.json();
        setCourseData(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [topicid]);

  const handleLectureClick = (lecture) => {
    setSelectedLecture(lecture);
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleClosePopup = () => {
    setSelectedLecture(null);
    setSelectedExercise(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h1>{courseData.orvl_topic_name}</h1>

      <LectureExerciseList
        lectures={courseData.lectures}
        onLectureClick={handleLectureClick}
        onExerciseClick={handleExerciseClick}
      />

      {(selectedLecture || selectedExercise) && (
        <Popup
          lecture={selectedLecture}
          exercise={selectedExercise}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default OrvlCourseTopic;
