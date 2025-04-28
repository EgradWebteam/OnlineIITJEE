import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from "../../../Styles/Global.module.css";
import CourseCard from "../../LandingPagesFolder/CourseCards.jsx";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";

export default function StudentDashboard_BuyCourses({
  setActiveSection,
  studentId,
}) {
  const [structuredCourses, setStructuredCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedPortal, setSelectedPortal] = useState("Online Test Series");
  const [loading, setLoading] = useState(true);
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    const fetchCoursesInBuyCourses = async () => {
      try {
        setLoading(true); // Start loading
        const res = await fetch(
          `${BASE_URL}/studentbuycourses/UnPurchasedcourses/${studentId}`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          setStructuredCourses(data);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("Error fetching unpurchased courses:", err);
      }
      finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchCoursesInBuyCourses();
  }, []);

  // Extract unique portal names dynamically from structuredCourses
  const portalNames = useMemo(() => {
    const names = structuredCourses.map((portal) => portal.portal_name);
    return [...new Set(names)];
  }, [structuredCourses]);

  // Set default portal name to the first portal in the list
  useEffect(() => {
    if (portalNames.length > 0) {
      setSelectedPortal(portalNames[0]);
    }
  }, [portalNames]);

  // Flatten the structured courses
  const flatCourses = useMemo(() => {
    const courses = [];

    structuredCourses.forEach((portal) => {
      Object.values(portal.exams).forEach((exam) => {
        exam.courses.forEach((course) => {
          courses.push({
            ...course,
            portal_id: portal.portal_id,
            portal_name: portal.portal_name,
            exam_id: exam.exam_id,
            exam_name: exam.exam_name,
          });
        });
      });
    });

    return courses;
  }, [structuredCourses]);

  // Extract unique exam names
  const examNames = useMemo(() => {
    const names = flatCourses
      .filter((c) => c.portal_name === selectedPortal)
      .map((c) => c.exam_name);

    return [...new Set(names)];
  }, [flatCourses, selectedPortal]);

  // Set default selected exam when data is ready
  useEffect(() => {
    if (examNames.length > 0) {
      setSelectedExam((prevExam) =>
        examNames.includes(prevExam) ? prevExam : examNames[0]
      );
    } else {
      setSelectedExam("");
    }
  }, [examNames, selectedPortal]);

  // Filter courses based on selected exam
  const filteredCourses = useMemo(() => {
    return flatCourses.filter(
      (c) => c.portal_name === selectedPortal && c.exam_name === selectedExam
    );
  }, [flatCourses, selectedExam, selectedPortal]);

  const studentpaymentcreation = async (courseId, studentId) => {
    // console.log("Payment creation started...");

    try {
      if (!courseId || !studentId)
        return console.error("Invalid course ID or student ID.");

      const response = await fetch(
        `${BASE_URL}/studentbuycourses/studentpaymentcreation/${studentId}/${courseId}`
      );
      const data = await response.json();
      const { student, course } = data;

      if (!student || !course)
        return console.error("Invalid student or course data.");

      const { student_registration_id, candidate_name, email_id, mobile_no } =
        student;
      const { course_creation_id, course_name, total_price } = course;

      const orderRes = await fetch(
        `${BASE_URL}/razorpay/razorpay-create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total_price * 100,
            currency: "INR",
          }),
        }
      );

      const { orderData } = await orderRes.json();
      if (!orderData?.id)
        return console.error("Invalid order data:", orderData);

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "eGRADTutor",
        description: `Payment for ${course_name}`,
        order_id: orderData.id,

        handler: async function (response) {
          try {
            const paymentsuccess = await fetch(
              `${BASE_URL}/razorpay/paymentsuccess`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  email: email_id,
                  name: candidate_name,
                  course_name: course_name,
                  studentId: student_registration_id,
                  courseId: course_creation_id,
                }),
              }
            );
            // console.log("Payment success response", paymentsuccess);
            setActiveSection("myCourses"); // Navigate to My Courses section
          } catch (error) {
            console.error("Error processing payment success:", error);
          }
          // SUCCESS HANDLER
        },

        prefill: {
          name: candidate_name,
          email: email_id,
          contact: mobile_no,
        },

        notes: {
          address:
            "Corporate Office, eGRADTutor(eGATETutor Academy), Hyderabad",
        },

        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", async function (response) {
        try {
          const paymentfailure = await fetch(
            `${BASE_URL}/razorpay/paymentfailure`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: email_id,
                name: candidate_name,
                course_name: course_name,
                studentId: student_registration_id,
                courseId: course_creation_id,
              }),
            }
          );
          console.error("Payment failed");
          // console.log("Payment failure response", paymentfailure);
        } catch (error) {
          console.error("Error processing payment failure:", error);
        }
      });

      paymentObject.open();
    } catch (error) {
      console.error("Error creating payment session:", error);
    }
  };

  return (
    <div className={styles.StudentDashboardBuyCoursesMainDiv}>
      <div className={globalCSS.stuentDashboardGlobalHeading}>
        <h3>Buy Courses</h3>
      </div>
      {/* Toggle Portal Buttons */}
      <div className={styles.toggleTypeButtons}>
        {portalNames.map((portal, idx) => (
          <button
            key={idx}
            className={`${styles.toggleBtn} ${
              selectedPortal === portal ? styles.active : ""
            }`}
            onClick={() => setSelectedPortal(portal)}
          >
            {portal}
          </button>
        ))}
      </div>

      {/* Exam Filter Buttons */}
      <div className={globalCSS.examButtonsDiv} style={{margin:"0rem 1rem"}}>
        {examNames.map((exam, idx) => (
          <button
            key={idx}
            className={`${globalCSS.examButtons} ${
              selectedExam === exam ? globalCSS.examActiveBtn : ""
            }`}
            onClick={() => setSelectedExam(exam)}
          >
            {exam}
          </button>
        ))}
      </div>
      {loading ? (
  <div className={globalCSS.loadingContainer}>
    <p className={globalCSS.loadingText}>Loading courses...</p>
  </div>
) : filteredCourses.length > 0 ? (
  <div className={styles.StduentDashboardRightSideBarForBggg}>
  <div className={globalCSS.cardHolderOTSORVLHome}>
    {filteredCourses.map((course) => (
      <CourseCard
        key={`${course.portal_id}-${course.course_creation_id}`}
        title={course.course_name}
        cardImage={course.card_image}
        price={course.total_price}
        context="buyCourses"
        onBuy={() => {
          const courseId = course.course_creation_id;
          if (!courseId) {
            console.error("Course ID is missing:", course);
            return;
          }
          studentpaymentcreation(courseId, studentId);
        }}
        onGoToTest={() =>
          console.log("Go to Test:", course.course_creation_id)
        }
      />
    ))}
  </div>
  </div>
) : (
  <div className={globalCSS.noCoursesContainer}>
    <p className={globalCSS.noCoursesMsg}>
      No courses available at the moment.
    </p>
  </div>
)}

    </div>
  );
}
