// import React, { useEffect, useMemo, useState } from "react";
// import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
// import globalCSS from "../../../Styles/Global.module.css";
// import CourseCard from "../../LandingPagesFolder/CourseCards";
// import { BASE_URL } from "../../../../apiConfig";

// export default function StudentDashboard_BuyCourses() {
//   useEffect(() => {
//     console.log("buycourses");
//   }, []);
//   const studentId = 6; // Replace with actual ID from auth/session

//   const [structuredCourses, setStructuredCourses] = useState([]);
//   const [selectedExam, setSelectedExam] = useState("");
//   const razorpayKey = import.meta.env.key_id;

//   useEffect(() => {
//     const fetchCoursesInBuyCourses = async () => {
//       try {
//         const res = await fetch(
//           `${BASE_URL}/studentbuycourses/UnPurchasedcourses/${studentId}`
//         );
//         const data = await res.json();

//         if (Array.isArray(data)) {
//           setStructuredCourses(data);
//         } else {
//           console.error("Invalid data format:", data);
//         }
//       } catch (err) {
//         console.error("Error fetching unpurchased courses:", err);
//       }
//     };

//     fetchCoursesInBuyCourses();
//   }, []);

//   // Flatten the structured courses
//   const flatCourses = useMemo(() => {
//     const courses = [];

//     structuredCourses.forEach((portal) => {
//       Object.values(portal.exams).forEach((exam) => {
//         exam.courses.forEach((course) => {
//           courses.push({
//             ...course,
//             portal_id: portal.portal_id,
//             portal_name: portal.portal_name,
//             exam_id: exam.exam_id,
//             exam_name: exam.exam_name,
//           });
//         });
//       });
//     });

//     return courses;
//   }, [structuredCourses]);

//   // Extract unique exam names
//   const examNames = useMemo(() => {
//     return [...new Set(flatCourses.map((c) => c.exam_name))];
//   }, [flatCourses]);

//   // Set default selected exam when data is ready
//   useEffect(() => {
//     if (!selectedExam && examNames.length > 0) {
//       setSelectedExam(examNames[0]);
//     }
//   }, [examNames, selectedExam]);

//   // Filter courses based on selected exam
//   const filteredCourses = useMemo(() => {
//     return flatCourses.filter((c) => c.exam_name === selectedExam);
//   }, [flatCourses, selectedExam]);
//   const studentpaymentcreation = async (courseId, studentId) => {
//     try {
//       if (!courseId || !studentId) {
//         console.error("Invalid course ID or student ID:", {
//           courseId,
//           studentId,
//         });
//         return;
//       }
//       const response = await fetch(
//         `${BASE_URL}/studentbuycourses/studentpaymentcreation/${studentId}/${courseId}`
//       );
//       console.log("Response from payment creation:", response);
//       const data = await response.json();
//       const { student, course } = data;
//       console.log("Student:", student);
//       console.log("Course:", course);
//       if (!student || !course) {
//         console.error("Invalid student or course data:", { student, course });
//         return;
//       }
//       const { studentId, studentname, studentemail, studentphoneno } = student;
//       const { courseId, coursename, courseprice } = course;
//       if (!studentId || !studentname || !studentemail || !studentphoneno) {
//         console.error("Invalid student data:", {
//           studentId,
//           studentname,
//           studentemail,
//           studentphoneno,
//         });
//         return;
//       }
//       if (!courseId || !coursename || !courseprice) {
//         console.error("Invalid course data:", {
//           courseId,
//           coursename,
//           courseprice,
//         });
//         return;
//       }
//       const order = await fetch(`${BASE_URL}/razorpay/razorpay-create-order`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           amount: courseprice * 100, // Amount in paise
//           currency: "INR",
//         }),
//       });
//       const { orderData } = await order.json();
//       console.log("Order data:", orderData);
//       if (!orderData || !orderData.order) {
//         console.error("Invalid order data:", orderData);
//         return;
//       }
//       const options = {
//         key: razorpayKey, // Your Razorpay key ID
//         amount: orderData.amount, // Amount in paise
//         currency: orderData.currency,
//         name: "eGRADTutor",
//         description: `Payment for ${coursename}`,
//         order_id: orderData.id, // Use the order ID from Razorpay
//         handler: async function (response) {
//           // Make this function async
//           const paymenetsuccess = await fetch(
//             `${BASE_URL}/razorpay/paymentsuccess`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 email: studentemail,
//                 name: studentname,
//                 coursename: coursename,
//                 studentId: studentId,
//                 courseId: courseId,
//               }),
//             }
//           );
//           console.log("Payment success response:", paymenetsuccess);

//           // Handle successful payment here (e.g., update database, show success message)
//         },
//         prefill: {
//           name: studentname,
//           email: studentemail,
//           contact: studentphoneno,
//         },
//         notes: {
//           address:
//             "Corporate Office, eGRADTutor(eGATETutor Academy), R.K Nivas,2nd Floor,Shivam Road,New Nallakunta, Hyderabad - 500044",
//         },
//         theme: {
//           color: "#3399cc",
//         },
//       };

//       console.log("Payment session created:", data);
//       // Handle successful payment session creation (e.g., redirect to payment page)
//     } catch (error) {
//       console.error("Error creating payment session:", error);
//     }
//   };
//   return (
//     <div className={styles.StudentDashboardBuyCoursesMainDiv}>
//       <div className={globalCSS.stuentDashboardGlobalHeading}>
//         <h3>Buy Courses</h3>
//       </div>

//       {/* Exam Filter Buttons */}
//       <div className={globalCSS.examButtonsDiv}>
//         {examNames.map((exam, idx) => (
//           <button
//             key={idx}
//             className={`${globalCSS.examButtons} ${
//               selectedExam === exam ? globalCSS.examActiveBtn : ""
//             }`}
//             onClick={() => setSelectedExam(exam)}
//           >
//             {exam}
//           </button>
//         ))}
//       </div>

//       {/* Course Cards */}
//       <div className={globalCSS.cardHolderOTSORVLHome}>
//         {filteredCourses.length > 0 ? (
//           filteredCourses.map((course) => (
//             <CourseCard
//               key={`${course.portal_id}-${course.course_creation_id}`}
//               title={course.course_name}
//               cardImage={course.card_image}
//               price={course.total_price}
//               context="buyCourses"
//               onBuy={() => {
//                 studentpaymentcreation(course.course_creation_id, studentId);
//               }}
//               onGoToTest={() =>
//                 console.log("Go to Test:", course.course_creation_id)
//               }
//             />
//           ))
//         ) : (
//           <div className={globalCSS.noCoursesContainer}>
//             <p className={globalCSS.noCoursesMsg}>
//               No courses available at the moment.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard.module.css";
import globalCSS from "../../../Styles/Global.module.css";
import CourseCard from '../../LandingPagesFolder/CourseCards.jsx';
import { BASE_URL } from '../../../../apiConfig';

export default function StudentDashboard_BuyCourses({setActiveSection,studentId}) {
  useEffect(() => {
    console.log("buycourses");
  }, []);

console.log("Student ID:", studentId); // Check the student ID
  const [structuredCourses, setStructuredCourses] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
 

  useEffect(() => {
    const fetchCoursesInBuyCourses = async () => {
      try {
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
    };

    fetchCoursesInBuyCourses();
  }, []);

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
    return [...new Set(flatCourses.map((c) => c.exam_name))];
  }, [flatCourses]);

  // Set default selected exam when data is ready
  useEffect(() => {
    if (!selectedExam && examNames.length > 0) {
      setSelectedExam(examNames[0]);
    }
  }, [examNames, selectedExam]);

  // Filter courses based on selected exam
  const filteredCourses = useMemo(() => {
    return flatCourses.filter((c) => c.exam_name === selectedExam);
  }, [flatCourses, selectedExam]);

  const studentpaymentcreation = async (courseId, studentId) => {
    console.log("Payment creation started...");
  
    try {
      if (!courseId || !studentId) return console.error("Invalid course ID or student ID.");
  
      const response = await fetch(`${BASE_URL}/studentbuycourses/studentpaymentcreation/${studentId}/${courseId}`);
      const data = await response.json();
      const { student, course } = data;
  
      if (!student || !course) return console.error("Invalid student or course data.");
  
      const { student_registration_id, candidate_name, email_id, mobile_no } = student;
      const { course_creation_id, course_name, total_price } = course;
  
      const orderRes = await fetch(`${BASE_URL}/razorpay/razorpay-create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total_price * 100,
          currency: "INR",
        }),
      });
  
      const { orderData } = await orderRes.json();
      if (!orderData?.id) return console.error("Invalid order data:", orderData);
  
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "eGRADTutor",
        description: `Payment for ${course_name}`,
        order_id: orderData.id,
  
        handler: async function (response) {
          try{
            const paymentsuccess = await fetch(`${BASE_URL}/razorpay/paymentsuccess`, {
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
          });
          console.log("Payment success response", paymentsuccess);
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
          address: "Corporate Office, eGRADTutor(eGATETutor Academy), Hyderabad",
        },
  
        theme: { color: "#3399cc" },
      };
  
      const paymentObject = new window.Razorpay(options);
  
      paymentObject.on("payment.failed", async function (response) {
      try{
        const paymentfailure = await fetch(`${BASE_URL}/razorpay/paymentfailure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email_id,
            name: candidate_name,
            course_name: course_name,
            studentId: student_registration_id,
            courseId: course_creation_id,
          }),
        });
        console.error("Payment failed");
        console.log("Payment failure response", paymentfailure);
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

      {/* Exam Filter Buttons */}
      <div className={globalCSS.examButtonsDiv}>
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

      {/* Course Cards */}
      {/* Course Cards or No Courses Message */}
    {filteredCourses.length > 0 ? (
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
