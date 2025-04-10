import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../Styles/LandingPageCSS/LandingPageIITJEE.module.css";
import globalCSS from "../../Styles/Global.module.css";
import otsBannerImg from "../../assets/PortalBanner.png";
import orvlBannerImg from "../../assets/PortalBanner.png";
import otsFeatureImg from "../../assets/TestSeriesDescription.png";
import orvlFeatureImg from "../../assets/TestSeriesDescription.png";
import cardImage from "../../assets/OtsCourseCardImages/iit_jee1.png"
import CourseCard from "./CourseCards";
const OTSandORVLBannerComponent = () => {
    const location = useLocation();
    const [selectedExam, setSelectedExam] = useState("JEE MAINS"); // Default selected

    const isOTS = location.pathname === "/OTSHomePage";
    const bannerData = isOTS
        ? {
            title: "Online Test Series",
            image: otsBannerImg,
            features: "Features of Online Test Series",
            featureImage: otsFeatureImg,
        }
        : {
            title: "Online Recorded Video Lectures",
            image: orvlBannerImg,
            features: "Features of Online Recorded Video Lectures",
            featureImage: orvlFeatureImg,
        };

    return (
        <div>
            {/* Main Banner */}
            <div className={styles.bannerContainer}>
                <div className={styles.imageSection}>
                    <img src={bannerData.image} alt={bannerData.title} />
                </div>
                <div className={styles.exploreCoursesHeader}>
                    <h3>{bannerData.title}</h3>
                </div>
            </div>

            {/* Exam Buttons */}
            <div className={styles.examButtonsDiv}>
                <button
                    className={`${globalCSS.examButtons} ${selectedExam === "JEE MAINS" ? globalCSS.examActiveBtn : ""
                        }`}
                    onClick={() => setSelectedExam("JEE MAINS")}
                >
                    JEE MAINS
                </button>
                <button
                    className={`${globalCSS.examButtons} ${selectedExam === "JEE ADVANCE" ? globalCSS.examActiveBtn : ""
                        }`}
                    onClick={() => setSelectedExam("JEE ADVANCE")}
                >
                    JEE ADVANCE
                </button>
            </div>
            {/* Course Cards Section */}
            <div className={styles.cardHolderOTSORVLHome}>
                <CourseCard
                    title="IIT JEE - 2025"
                    cardImage={cardImage}
                    price={1}
                    context="buyCourses" // or "OTSHomePage", "ORVLHomePage", "myCourses"
                    onBuy={() => console.log("Buying course...")}
                    onGoToTest={() => console.log("Navigating to test...")}
                />
            </div>


            {/* Features Section */}
            <div className={styles.bannerContainer}>
                <div className={styles.exploreCoursesHeader}>
                    <h3>{bannerData.features}</h3>
                </div>
                <div className={styles.FeatureimageSection}>
                    <img src={bannerData.featureImage} alt={bannerData.title} />
                </div>

            </div>
        </div>

    );
};

export default OTSandORVLBannerComponent;
