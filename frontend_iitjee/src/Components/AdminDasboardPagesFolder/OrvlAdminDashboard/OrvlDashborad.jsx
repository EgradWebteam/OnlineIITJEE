import React, { useState, useEffect } from 'react';
import AdminCards from '../AdminDashboardFiles/AdminCards.jsx';
import styles from '../../../Styles/AdminDashboardCSS/AdminDashboard.module.css'; 
import { FaClipboardList, FaFilm, FaBook } from 'react-icons/fa'; 
import { BASE_URL } from '../../../ConfigFile/ApiConfigURL.js'; 

const OrvlDashborad = () => {
    const [totalTopics, setTotalTopics] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0); 
    const [animatedTopics, setAnimatedTopics] = useState(0);
    const [animatedVideos, setAnimatedVideos] = useState(0);
    const [animatedCourses, setAnimatedCourses] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/admin/fetchOrvlCounts`); 
                const data = await response.json();
                if (response.ok) {
                    setTotalTopics(data.total_topics);
                    setTotalVideos(data.total_videos);
                    setTotalCourses(data.total_courses); 
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
        }, 300);
    };
    useEffect(() => {
        if (totalTopics > 0) animateNumber(totalTopics, setAnimatedTopics);
        if (totalVideos > 0) animateNumber(totalVideos, setAnimatedVideos);
        if (totalCourses > 0) animateNumber(totalCourses, setAnimatedCourses);
    }, [totalTopics, totalVideos, totalCourses]);
    const adminCardData = [
        { icon: <FaClipboardList />, label: "Total Topics", value: animatedTopics },
        { icon: <FaFilm />, label: "Total Videos", value: animatedVideos },
        {
          icon: <FaClipboardList />,
          label: "Total Courses",
          value: animatedCourses,
        },
      ];
    return (
        <div className={styles.dashboardContent}>
            <div className={styles.dashboardTitle}>DASHBOARD</div>
            <div className={styles.statGrid}>
            {adminCardData.map((item, index) => {
          return (
            <AdminCards
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          );
        })}
            </div>
        </div>
    );
};

export default OrvlDashborad;
