import React, { useState, useEffect } from 'react';
import AdminCards from './AdminCards.jsx';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; // Importing CSS module for styling
import { FaBook, FaFileAlt, FaUserGraduate, FaQuestionCircle } from 'react-icons/fa';
import { BASE_URL } from '../../../config/apiConfig.js';

const DashBoard = () => {
    console.log("Dashboard called");

    // State variables to store the values from the API
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalTests, setTotalTests] = useState(0);
    const [totalUsersRegistered, setTotalUsersRegistered] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalQuestionsUploaded, setTotalQuestionsUploaded] = useState(0);

    // State for animating the numbers
    const [animatedCourses, setAnimatedCourses] = useState(0);
    const [animatedTests, setAnimatedTests] = useState(0);
    const [animatedUsers, setAnimatedUsers] = useState(0);
    const [animatedQuestions, setAnimatedQuestions] = useState(0);
    const [animatedQuestionsUploaded, setAnimatedQuestionsUploaded] = useState(0);

    // Fetch data from the API using fetch() method
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/admin/fetchTotalData`); 
                const data = await response.json();
                
                // Make sure the data is correctly returned
                if (response.ok) {
                    setTotalCourses(data.total_courses);
                    setTotalTests(data.total_tests);
                    setTotalUsersRegistered(data.total_users_registered);
                    setTotalQuestions(data.total_questions);
                    setTotalQuestionsUploaded(data.total_questions_uploaded);
                } else {
                    console.error("Failed to fetch data:", data);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);
    const animateNumber = (value, setState) => {
        let count = 0;
        const interval = setInterval(() => {
            count += Math.ceil(value / 100); 
            if (count >= value) {
                clearInterval(interval);
                setState(value);
            } else {
                setState(count);
            }
        }, 30);
    };
    useEffect(() => {
        if (totalCourses > 0) animateNumber(totalCourses, setAnimatedCourses);
        if (totalTests > 0) animateNumber(totalTests, setAnimatedTests);
        if (totalUsersRegistered > 0) animateNumber(totalUsersRegistered, setAnimatedUsers);
        if (totalQuestions > 0) animateNumber(totalQuestions, setAnimatedQuestions);
        if (totalQuestionsUploaded > 0) animateNumber(totalQuestionsUploaded, setAnimatedQuestionsUploaded);
    }, [totalCourses, totalTests, totalUsersRegistered, totalQuestions, totalQuestionsUploaded]);

    return (
        <div className={styles.dashboardContent}>
            <div className={styles.dashboardTitle}>DASHBOARD</div>
            <div className={styles.statGrid}>
                <AdminCards icon={<FaBook />} label="Total Courses" value={animatedCourses} />
                <AdminCards icon={<FaFileAlt />} label="Total Tests" value={animatedTests} />
                <AdminCards icon={<FaUserGraduate />} label="User Registrations" value={animatedUsers} />
                <AdminCards icon={<FaQuestionCircle />} label="Total Questions" value={animatedQuestions} />
                <AdminCards icon={<FaQuestionCircle />} label="Questions Uploaded" value={animatedQuestionsUploaded} />
            </div>
        </div>
    );
};

export default DashBoard;
