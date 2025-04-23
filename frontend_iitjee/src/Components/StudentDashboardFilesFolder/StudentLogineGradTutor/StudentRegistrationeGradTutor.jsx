import React, { useState, useEffect } from "react";
import Styles from "../../../Styles/StudentDashboardCSS/StudentRegistration.module.css";
import SRFormImage from "../../../assets/SRFormImage.jpg";
import MainHeader from "../../LandingPagesFolder/MainPageHeaderFooterFiles/MainHeader.jsx";
import MainFooter from "../../LandingPagesFolder/MainPageHeaderFooterFiles/MainFooter.jsx";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
import TermsAndConditions from "../../GlobalFiles/TermsAndConditions.jsx";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
const StudentRegistrationeGradTutor = () => {
  const [formData, setFormData] = useState({
    candidateName: "",
    dateOfBirth: "",
    gender: "",
    category: "",
    emailId: "",
    confirmEmailId: "",
    contactNo: "",
    fatherName: "",
    occupation: "",
    mobileNo: "",
    line1: "",
    state: "",
    districts: "",
    pincode: "",
    qualifications: "",
    nameOfCollege: "",
    passingYear: "",
    marks: "",
    uploadedPhoto: null,
    proof: null,
    termsAccepted: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { courseCreationId } = location.state || {};
  const [errors, setErrors] = useState({});
  const [openTermsAndConditions, setOpenTermsAndConditions] = useState(false);
  const [courseid, setCourseid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const photoInputRef = useRef(null); // at the top in your component

  console.log(courseid);

  const validateForm = () => {
    const validationErrors = {};

    // Check required fields
    const requiredFields = [
      "candidateName",
      "dateOfBirth",
      "gender",
      "category",
      "emailId",
      "confirmEmailId",
      "contactNo",
      "fatherName",
      "occupation",
      "mobileNo",
      "line1",
      "state",
      "districts",
      "pincode",
      "qualifications",
      "nameOfCollege",
      "passingYear",
      "marks",
      "uploadedPhoto",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        validationErrors[field] = `${field} is required.`;
      }
    });

    // Check if email and confirm email match
    if (formData.emailId !== formData.confirmEmailId) {
      validationErrors.confirmEmailId = "Email and Confirm Email must match.";
    }

    // Additional validations can be added here as needed

    return validationErrors;
  };

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/studentbuycourses/ActiveCourses/${courseCreationId}`
        );

        setCourseid(response.data); // Store data in state
      } catch (error) {
        console.error("Failed to fetch course data"); // Handle error
      }
    };

    fetchCourseData();
  }, []);
  // const validateForm = () => {
  //   const validationErrors = {};

  //   // Check required fields
  //   const requiredFields = [
  //     "candidateName",
  //     "dateOfBirth",
  //     "gender",
  //     "category",
  //     "emailId",
  //     "confirmEmailId",
  //     "contactNo",
  //     "fatherName",
  //     "occupation",
  //     "mobileNo",
  //     "line1",
  //     "state",
  //     "districts",
  //     "pincode",
  //     "qualifications",
  //     "nameOfCollege",
  //     "passingYear",
  //     "marks",
  //     "uploadedPhoto",
  //   ];

  //   requiredFields.forEach((field) => {
  //     if (!formData[field]) {
  //       validationErrors[field] = `${field} is required.`;
  //     }
  //   });

  //   // Check if email and confirm email match
  //   if (formData.emailId !== formData.confirmEmailId) {
  //     validationErrors.confirmEmailId = "Email and Confirm Email must match.";
  //   }

  //   // Additional validations can be added here as needed

  //   return validationErrors;
  // };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let error = "";

    if (type === "file") {
      const file = files[0];
      const fileSizeKB = file.size / 1024; // Convert size to KB
      let errorMessage = "";

      if (name === "uploadedPhoto") {
        if (fileSizeKB < 50 || fileSizeKB > 200) {
          errorMessage = "Uploaded Photo must be between 50KB and 200KB.";
          // Show custom popup message
          setPopupMessage(errorMessage);
          setShowPopup(true);

          // Clear formData for uploadedPhoto
          setFormData((prevData) => ({
            ...prevData,
            [name]: null, // Do not set the invalid file
          }));

          // Set error for this field
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: errorMessage,
          }));

          return; // STOP here, prevent updating formData with invalid file
        }
      }

      // Clear any previous error
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));

      // Update formData with valid file
      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));

      return;
    } else {
      switch (name) {
        case "candidateName":
        case "fatherName":
        case "occupation":
          if (!/^[A-Za-z\s]*$/.test(value)) {
            error = `${name} must only contain alphabets and spaces.`;
          } else if (value.length > 40) {
            error = `${name} cannot be more than 40 characters.`;
          }
          break;

        case "college name":
          if (!/^[A-Za-z\s]*$/.test(value)) {
            error = `${name} must only contain alphabets and spaces.`;
          } else if (value.length > 50) {
            error = `${name} cannot be more than 50 characters.`;
          }
          break;
        case "line1":
        case "state":
        case "districts":
          if (!/^[A-Za-z\s]*$/.test(value)) {
            error = `${name} must only contain alphabets and spaces.`;
          } else if (value.length > 30) {
            error = `${name} cannot be more than 30 characters.`;
          }
          break;

        case "contactNo":
        case "mobileNo":
          if (/[^0-9]/.test(value)) {
            error = "Only numbers are allowed for Contact number.";
          } else if (value.length > 10) {
            error = "Contact number must contain exactly 10 digits.";
          }
          break;

        case "pincode":
          if (/[^0-9]/.test(value)) {
            error = "Only numbers are allowed for Pincode.";
          } else if (value.length > 6) {
            error = "Pincode must be exactly 6 digits.";
          }
          break;

        case "passingYear":
          if (/[^0-9]/.test(value)) {
            error = "Only numbers are allowed for Passing Year.";
          } else if (value.length > 4) {
            error = "Passing Year must be exactly 4 digits.";
          }
          break;

        case "marks":
          if (value < 0 || value > 100 || isNaN(value) || value.length > 3) {
            error = "Percentage must be between 0 and 100.";
          }
          break;

        default:
          break;
      }

      if (!error) {
        setFormData({ ...formData, [name]: value });
      }
      return error;
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupMessage("");

    // Clear the file input visually
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }

    // Also clear the formData field
    setFormData((prevData) => ({
      ...prevData,
      uploadedPhoto: null,
    }));
    navigate("/LoginPage");
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   // Validate image size before submission
  //   if (formData.uploadedPhoto) {
  //     const fileSizeKB = formData.uploadedPhoto.size / 1024;
  //     if (fileSizeKB < 50 || fileSizeKB > 200) {
  //       setPopupMessage("Uploaded Photo must be between 50KB and 200KB.");
  //       setShowPopup(true);
  //       return; // Stop form submission if the file size is invalid
  //     }
  //   }

  //   // Step 1: Validate the form
  //   const validationErrors = validateForm();

  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);

  //     // Step 2: Create an error message showing missing fields
  //     let errorMessage = "Please fill in the following required fields:\n";
  //     Object.keys(validationErrors).forEach((key) => {
  //       errorMessage += `- ${key}\n`; // Append the field name that is missing
  //     });

  //     // Show an alert with the missing fields
  //     alert(errorMessage); // This will now list the fields that are not filled
  //     return; // Prevent form submission if validation errors exist
  //   } else {
  //     // Step 3: Proceed with form data submission
  //     const formDataToSend = new FormData();

  //     // Append form data
  //     formDataToSend.append("candidateName", formData.candidateName);
  //     formDataToSend.append("dateOfBirth", formData.dateOfBirth);
  //     formDataToSend.append("gender", formData.gender);
  //     formDataToSend.append("category", formData.category);
  //     formDataToSend.append("emailId", formData.emailId);
  //     formDataToSend.append("confirmEmailId", formData.confirmEmailId);
  //     formDataToSend.append("contactNo", formData.contactNo);
  //     formDataToSend.append("fatherName", formData.fatherName);
  //     formDataToSend.append("occupation", formData.occupation);
  //     formDataToSend.append("mobileNo", formData.mobileNo);
  //     formDataToSend.append("line1", formData.line1);
  //     formDataToSend.append("state", formData.state);
  //     formDataToSend.append("districts", formData.districts);
  //     formDataToSend.append("pincode", formData.pincode);
  //     formDataToSend.append("qualifications", formData.qualifications);
  //     formDataToSend.append("college_name", formData.nameOfCollege);
  //     formDataToSend.append("passingYear", formData.passingYear);
  //     formDataToSend.append("marks", formData.marks);

  //     // Append files (if any)
  //     // Append the uploaded photo if valid
  //     // Validate the image size before submission
  //     if (formData.uploadedPhoto) {
  //       const fileSizeKB = formData.uploadedPhoto.size / 1024;
  //       if (fileSizeKB < 50 || fileSizeKB > 200) {
  //         setPopupMessage("Uploaded Photo must be between 50KB and 200KB.");
  //         setShowPopup(true);
  //         return; // Stop form submission if the file size is invalid
  //       }
  //     }
  //     if (formData.proof) {
  //       formDataToSend.append("proof", formData.proof);
  //     }

  //     // Append termsAccepted as a string or boolean
  //     formDataToSend.append("termsAccepted", formData.termsAccepted.toString());

  //     // Step 4: Log the FormData object for debugging
  //     const formDataObject = Object.fromEntries(formDataToSend.entries());
  //     console.log("FormData Object:", formDataObject);

  //     // Step 5: Determine API endpoint
  //     // const apiEndpoint = courseCreationId
  //     //   ? '/studentbuycourses/studentRegistrationBuyCourses'
  //     //   : '/student/studentRegistration';

  //     try {
  //       // Step 6: Submit the form data using fetch
  //       const response = await fetch(
  //         `${BASE_URL}/student/studentRegistration`,
  //         {
  //           method: "POST",
  //           body: formDataToSend,
  //         }
  //       );
  //       const result = await response.json();

  //       if (result.success) {
  //         const studentId = result.studentId;
  //         const courseId = courseCreationId;
  //         if (courseCreationId) {
  //           try {
  //             if (!courseId || !studentId)
  //               return console.error("Invalid course ID or student ID.");

  //             const response = await fetch(
  //               `${BASE_URL}/studentbuycourses/studentpaymentcreation/${studentId}/${courseId}`
  //             );
  //             const data = await response.json();
  //             const { student, course } = data;

  //             if (!student || !course)
  //               return console.error("Invalid student or course data.");

  //             const {
  //               student_registration_id,
  //               candidate_name,
  //               email_id,
  //               mobile_no,
  //             } = student;
  //             const { course_creation_id, course_name, total_price } = course;

  //             const orderRes = await fetch(
  //               `${BASE_URL}/razorpay/razorpay-create-order`,
  //               {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify({
  //                   amount: total_price * 100,
  //                   currency: "INR",
  //                 }),
  //               }
  //             );

  //             const { orderData } = await orderRes.json();
  //             if (!orderData?.id)
  //               return console.error("Invalid order data:", orderData);

  //             const options = {
  //               key: razorpayKey,
  //               amount: orderData.amount,
  //               currency: orderData.currency,
  //               name: "eGRADTutor",
  //               description: `Payment for ${course_name}`,
  //               order_id: orderData.id,

  //               handler: async function (response) {
  //                 try {
  //                   const paymentsuccess = await fetch(
  //                     `${BASE_URL}/razorpay/paymentsuccess`,
  //                     {
  //                       method: "POST",
  //                       headers: { "Content-Type": "application/json" },
  //                       body: JSON.stringify({
  //                         razorpay_payment_id: response.razorpay_payment_id,
  //                         razorpay_order_id: response.razorpay_order_id,
  //                         email: email_id,
  //                         name: candidate_name,
  //                         course_name: course_name,
  //                         studentId: student_registration_id,
  //                         courseId: course_creation_id,
  //                       }),
  //                     }
  //                   );
  //                   console.log("Payment success response", paymentsuccess);
  //                 } catch (error) {
  //                   console.error("Error processing payment success:", error);
  //                 }
  //                 // SUCCESS HANDLER
  //               },

  //               prefill: {
  //                 name: candidate_name,
  //                 email: email_id,
  //                 contact: mobile_no,
  //               },

  //               notes: {
  //                 address:
  //                   "Corporate Office, eGRADTutor(eGATETutor Academy), Hyderabad",
  //               },

  //               theme: { color: "#3399cc" },
  //             };

  //             const paymentObject = new window.Razorpay(options);

  //             paymentObject.on("payment.failed", async function (response) {
  //               try {
  //                 const paymentfailure = await fetch(
  //                   `${BASE_URL}/razorpay/paymentfailure`,
  //                   {
  //                     method: "POST",
  //                     headers: { "Content-Type": "application/json" },
  //                     body: JSON.stringify({
  //                       email: email_id,
  //                       name: candidate_name,
  //                       course_name: course_name,
  //                       studentId: student_registration_id,
  //                       courseId: course_creation_id,
  //                     }),
  //                   }
  //                 );
  //                 console.error("Payment failed");
  //                 console.log("Payment failure response", paymentfailure);
  //               } catch (error) {
  //                 console.error("Error processing payment failure:", error);
  //               }
  //             });

  //             paymentObject.open();
  //           } catch (error) {
  //             console.error("Error creating payment session:", error);
  //           }
  //         }

  //         // Step 7: Handle the response
  //         if (!response.ok) {
  //           throw new Error("Network response was not ok");
  //         }

  //         console.log("Success:", result);

  //         // Step 8: Handle success (e.g., show a success message, redirect, etc.)
  //         alert(
  //           "Registration successful! Please check your email for further instructions."
  //         );
  //         navigate("/LoginPage");
  //       } // Redirect to login page after success
  //     } catch (error) {
  //       // Step 9: Handle errors during form submission
  //       console.error("Error:", error);
  //     }
  //   }

  //   // Log completion of form submission
  //   console.log("Form submitted successfully!");
  // };

  const handleEmailBlur = async (event) => {
    const emailId = event.target.value;  // Getting the value of the email field

    if (emailId) {
      try {
        // API request to check if email exists
        const response = await fetch(`${BASE_URL}/student/checkEmailExists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailId }),
        });

        const result = await response.json();

        if (result.message === "Your email already exists. Please use a different email.") {
          setPopupMessage(result.message); // Set the popup message
          setShowPopup(true); // Show the popup
        } else {
          setShowPopup(false); // Hide the popup if email doesn't exist
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate image size before submission
    if (formData.uploadedPhoto) {
      const fileSizeKB = formData.uploadedPhoto.size / 1024;
      if (fileSizeKB < 50 || fileSizeKB > 200) {
        setPopupMessage("Uploaded Photo must be between 50KB and 200KB.");
        setShowPopup(true);
        return;
      }
    }
  
    // Step 1: Validate the form
    const validationErrors = validateForm();
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      let errorMessage = "Please fill in the following required fields:\n";
      Object.keys(validationErrors).forEach((key) => {
        errorMessage += `- ${key}\n`;
      });
      alert(errorMessage);
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append("candidateName", formData.candidateName);
    formDataToSend.append("dateOfBirth", formData.dateOfBirth);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("emailId", formData.emailId);
    formDataToSend.append("confirmEmailId", formData.confirmEmailId);
    formDataToSend.append("contactNo", formData.contactNo);
    formDataToSend.append("fatherName", formData.fatherName);
    formDataToSend.append("occupation", formData.occupation);
    formDataToSend.append("mobileNo", formData.mobileNo);
    formDataToSend.append("line1", formData.line1);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("districts", formData.districts);
    formDataToSend.append("pincode", formData.pincode);
    formDataToSend.append("qualifications", formData.qualifications);
    formDataToSend.append("college_name", formData.nameOfCollege);
    formDataToSend.append("passingYear", formData.passingYear);
    formDataToSend.append("marks", formData.marks);
  
    if (formData.uploadedPhoto) {
      formDataToSend.append("uploadedPhoto", formData.uploadedPhoto);
    }
    if (formData.proof) {
      formDataToSend.append("proof", formData.proof);
    }
  
    formDataToSend.append("termsAccepted", formData.termsAccepted.toString());
  
    console.log("FormData Object:", Object.fromEntries(formDataToSend.entries()));
  
    try {
      const response = await fetch(`${BASE_URL}/student/studentRegistration`, {
        method: "POST",
        body: formDataToSend,
      });
  
      const result = await response.json();
  
      if (result.message && result.message === "Your email already exists.") {
        setPopupMessage(result.message); 
        setShowPopup(true); 
    
        return; 
      }
  
      if (result.success) {
        const studentId = result.studentId;
  
        if (courseCreationId) {
          try {
            const courseId = courseCreationId;
            if (!courseId || !studentId)
              return console.error("Invalid course ID or student ID.");
  
            const response = await fetch(
              `${BASE_URL}/studentbuycourses/studentpaymentcreation/${studentId}/${courseId}`
            );
            const data = await response.json();
  
            const { student, course } = data;
            if (!student || !course)
              return console.error("Invalid student or course data.");
  
            const {
              student_registration_id,
              candidate_name,
              email_id,
              mobile_no,
            } = student;
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
            if (!orderData?.id) {
              return console.error("Invalid order data:", orderData);
            }
  
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
                  console.log("Payment success response", paymentsuccess);
                } catch (error) {
                  console.error("Error processing payment success:", error);
                }
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
                console.log("Payment failure response", paymentfailure);
              } catch (error) {
                console.error("Error processing payment failure:", error);
              }
            });
  
            paymentObject.open();
          } catch (error) {
            console.error("Error creating payment session:", error);
          }
        }
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        console.log("Success:", result);
  
        alert(
          "Registration successful! Please check your email for further instructions."
        );
        navigate("/LoginPage");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again later.");
    }
  };
  
  const handleBackButtonClick = () => {
    if (courseCreationId) {
      navigate("/buycourses");
    } else {
      navigate("/LoginPage");
    }
  };

  return (
    <div className={Styles.SRMainFormDiv}>
      <MainHeader />
      <div className={Styles.SRMainSubFormDiv}>
        <div className={Styles.RegistrationParentDiv}>
          <h2 className={Styles.RegistrationHeading}>
            Student Registration Page
          </h2>
          {courseid && (
            <div className={Styles.CourseDetails}>
              <p>
                <strong>Course Name:</strong>
              </p>
              <div> {courseid[0].course_name}</div>
              <p>
                <strong>Duration:</strong>
              </p>
              <div>
                {" "}
                {courseid[0].course_duration} to {courseid[0].course_end_date}
              </div>
            </div>
          )}
          <div className={Styles.RegistrationBackbtnDiv}>
            <button
              onClick={handleBackButtonClick}
              className={Styles.SRBackbtn}
            >
              Back
            </button>
          </div>
          <form className={Styles.SRForm} onSubmit={handleSubmit}>
            <div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Personal Details</h1>
                <div>
                  <label>
                    Candidate Name:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    placeholder="Candidate Name"
                    value={formData.candidateName}
                    onChange={handleChange}
                    required
                  />
                  {errors.candidateName && (
                    <p className={Styles.error}>{errors.candidateName}</p>
                  )}
                </div>

                <div>
                  <label>
                    Date of Birth:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                  {errors.dateOfBirth && (
                    <p className={Styles.error}>{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label>
                    Gender:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        onChange={handleChange}
                        required
                      />
                      <label>Male</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        onChange={handleChange}
                        required
                      />
                      <label>Female</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        onChange={handleChange}
                        required
                      />
                      <label>Other</label>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className={Styles.error}>{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label>
                    Category:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs}>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="General"
                        onChange={handleChange}
                        required
                      />
                      <label>General</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="OBC"
                        onChange={handleChange}
                        required
                      />
                      <label>OBC</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="category"
                        value="SC/ST"
                        onChange={handleChange}
                        required
                      />
                      <label>SC/ST</label>
                    </div>
                  </div>
                  {errors.category && (
                    <p className={Styles.error}>{errors.category}</p>
                  )}
                </div>

                <div>
                  <label>
                    Email ID:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    autoComplete="off"
                    placeholder="Email ID"
                    value={formData.emailId}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    required
                  />
                  {errors.emailId && (
                    <p className={Styles.error}>{errors.emailId}</p>
                  )}
                </div>

                <div>
                  <label>
                    Confirm Email ID:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="email"
                    name="confirmEmailId"
                    placeholder="Confirm Email ID"
                    value={formData.confirmEmailId}
                    onChange={handleChange}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onBlur={handleEmailBlur}
                    required
                  />
                  {errors.confirmEmailId && (
                    <p className={Styles.error}>{errors.confirmEmailId}</p>
                  )}
                </div>

                <div>
                  <label>
                    Contact No:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    placeholder="Contact No"
                    value={formData.contactNo}
                    onChange={handleChange}
                    required
                  />
                  {errors.contactNo && (
                    <p className={Styles.error}>{errors.contactNo}</p>
                  )}
                </div>
              </div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Father's/ Guardian's Details</h1>
                <div>
                  <label>
                    Father/Mother/Guardian Name:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Father Name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                  />
                  {errors.fatherName && (
                    <p className={Styles.error}>{errors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label>
                    Occupation:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    placeholder="Occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                  />
                  {errors.occupation && (
                    <p className={Styles.error}>{errors.occupation}</p>
                  )}
                </div>

                <div>
                  <label>
                    Mobile No:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNo"
                    placeholder="Mobile No"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    required
                  />
                  {errors.mobileNo && (
                    <p className={Styles.error}>{errors.mobileNo}</p>
                  )}
                </div>
              </div>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Communication Details</h1>

                <div>
                  <label>
                    Line1:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="line1"
                    placeholder="Line1"
                    value={formData.line1}
                    onChange={handleChange}
                    required
                  />
                  {errors.line1 && (
                    <p className={Styles.error}>{errors.line1}</p>
                  )}
                </div>

                <div>
                  <label>
                    State:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  {errors.state && (
                    <p className={Styles.error}>{errors.state}</p>
                  )}
                </div>

                <div>
                  <label>
                    Districts:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="districts"
                    placeholder="Districts"
                    value={formData.districts}
                    onChange={handleChange}
                    required
                  />
                  {errors.districts && (
                    <p className={Styles.error}>{errors.districts}</p>
                  )}
                </div>

                <div>
                  <label>
                    Pincode:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                  {errors.pincode && (
                    <p className={Styles.error}>{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>
            <div className={Styles.SRFormSubDiv2}>
              <div className={Styles.SRSubField1}>
                <h1 className={Styles.SR_hTag}>Education Details</h1>
                <div>
                  <label htmlFor="">
                    Qualifications:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <div className={Styles.SRradioInputs2}>
                    <div className={Styles.SRQualificationDiv}>
                      <div>
                        <input
                          type="radio"
                          name="qualifications"
                          value="Appearing"
                          onChange={handleChange}
                          required
                        />
                        <label>Appearing XII</label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="qualifications"
                          value="Passed"
                          onChange={handleChange}
                          required
                        />
                        <label>Passed XII</label>
                      </div>
                    </div>
                  </div>
                  {errors.qualifications && (
                    <p className={Styles.error}>{errors.qualifications}</p>
                  )}
                </div>

                <div>
                  <label>
                    Name of College:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nameOfCollege"
                    placeholder="Name of College"
                    value={formData.nameOfCollege}
                    onChange={handleChange}
                    required
                  />
                  {errors.nameOfCollege && (
                    <p className={Styles.error}>{errors.nameOfCollege}</p>
                  )}
                </div>

                <div>
                  <label>
                    Passing Year:
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="passingYear"
                    placeholder="Passing Year"
                    value={formData.passingYear}
                    onChange={handleChange}
                    required
                  />
                  {errors.passingYear && (
                    <p className={Styles.error}>{errors.passingYear}</p>
                  )}
                </div>

                <div>
                  <label>
                    Marks(%):
                    <span className={Styles.SRImportantField}>*</span>
                  </label>
                  <input
                    type="text"
                    name="marks"
                    placeholder="Marks (%)"
                    value={formData.marks}
                    onChange={handleChange}
                    required
                  />
                  {errors.marks && (
                    <p className={Styles.error}>{errors.marks}</p>
                  )}
                </div>
              </div>

              <div className={Styles.SRSubField2}>
                <h1 className={Styles.SR_hTag}>Upload Image/Documents</h1>
                <div className={Styles.SRUploadPhotoDiv}>
                  <div>
                    <label>
                      Upload Photo:
                      <span className={Styles.SRImportantField}>*</span>
                    </label>
                    <div className={Styles.SRFormImage}>
                      <img src={SRFormImage} alt="no img" />
                    </div>
                    <input
                      type="file"
                      name="uploadedPhoto"
                      onChange={handleChange}
                      accept="image/png, image/jpeg"
                      ref={photoInputRef}
                      required
                    />

                    <p className={Styles.SRNotPoint}>
                      <strong> *Note : </strong>File size must be between 50KB
                      and 200KB. Only JPG, JPEG, or PNG allowed.{" "}
                    </p>
                  </div>
                </div>
              </div>
              {showPopup && (
                <div className={Styles.popupOverlay}>
                  <div className={Styles.popupContent}>
                    <p>{popupMessage}</p>
                    <button onClick={handleClosePopup}>Close</button>
                  </div>
                </div>
              )}

              <div className={Styles.SRSubField2}>
                <div className={Styles.termsAndConditions}>
                  <label>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      className={Styles.checkboxAgree}
                      checked={formData.termsAccepted}
                      onChange={() =>
                        setFormData((prevData) => ({
                          ...prevData,
                          termsAccepted: !prevData.termsAccepted,
                        }))
                      }
                    />
                    I accept all the{" "}
                    <span
                      onClick={() => setOpenTermsAndConditions(true)}
                      className={Styles.tcLink}
                    >
                      terms & conditions
                    </span>
                  </label>

                  {/* Display error message if terms are not accepted */}
                  {errors.termsAccepted && (
                    <p className={Styles.error}>{errors.termsAccepted}</p>
                  )}
                </div>
              </div>
              <div>
                {/* <button type="submit" className={Styles.buttonforStdReg}>
                  Pay Now
                </button> */}

                <div>
                  {courseCreationId ? (
                    <button
                      type="submit"
                      className={Styles.buttonforStdReg}
                      disabled={isSubmitting}
                    >
                      Pay Now
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={Styles.buttonforStdReg}
                      disabled={isSubmitting}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
          {openTermsAndConditions && (
            <TermsAndConditions setIsModalOpen={setOpenTermsAndConditions} />
          )}
        </div>
      </div>

      <MainFooter />
    </div>
  );
};

export default StudentRegistrationeGradTutor;
