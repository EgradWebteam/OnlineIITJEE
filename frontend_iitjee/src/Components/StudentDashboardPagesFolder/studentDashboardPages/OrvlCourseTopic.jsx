import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../../config/apiConfig'; // Import the base URL from config
import LectureExerciseList from './LectureExerciseList';
import Popup from './Popup'; // Assuming Popup component is the same
import globalCSS from '../../../Styles/Global.module.css'

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
    <div className={globalCSS.OrvlCourseTopicContainer}>
      <div className={globalCSS.OrvlCourseTopicbtn}>
      <button onClick={onBack}>Back</button>
      </div>
      <div className={globalCSS.OrvlCourseTopicHeader}>
      <div>{courseData.orvl_topic_name}</div>
      </div>
      <div className={globalCSS.OrvlCourseTopicContent}>
      <LectureExerciseList
        lectures={courseData.lectures}
        onLectureClick={handleLectureClick}
        onExerciseClick={handleExerciseClick}
      />
</div>
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
