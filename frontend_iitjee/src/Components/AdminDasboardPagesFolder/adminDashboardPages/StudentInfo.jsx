import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/apiConfig.js";
import styles from "../../../Styles/AdminDashboardCSS/StudentInfo.module.css";

const StudentInfo = () => {
  const [isPopUp, setIsPopUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState({});

  const handleAddStudent = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(validationErrors).length > 0) {
        setErrors((prevErrors) => ({
            ...prevErrors
          }));
       alert("Enter valid email")
        return;
      }

      const stdData = {
        name,
        email,
        mobileNumber,
      };
    try {
      
      const response = await axios.post(
        `${BASE_URL}/students/StudentInfo`,
        stdData
      );
      alert(response.data.message);
      setName("");
      setEmail("");
      setMobileNumber("");
    } catch (error) {
      console.error("error adding student:", error);
      alert("Email already exists");
    }
  };
  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) { // Allow only numbers and up to 10 digits
      setMobileNumber(value);
    }
  };
  const handleNameChange = (e) => {
    const value = e.target.value;

    // Ensure name length is within 40 characters
    if (/^[A-Za-z\s]*$/.test(value) && value.length <= 40) {
      setName(value);
    }
  };

  return (
    <div className={styles.AddedstudentsHomePage}>
      <button className={styles.Addedstudent}onClick={() => setIsPopUp(true)}>Add students</button>
      {isPopUp && (
        <div className={styles.PopUPContainer}>
          <div className={styles.PopUP}>
            <h3 className={styles.HedaingForAddStudents}>Added Student</h3>
            <form className={styles.PopUPForm} onSubmit={handleAddStudent}>
              <div className={styles.InboxesForForm}>
                <label>Name:</label>
                <input
                  onChange={handleNameChange}
                  type="text"
                  placeholder="Enter your Name"
                  className={styles.PopUPInput}
                  value={name}
                />
              </div>
              <div className={styles.InboxesForForm}>
                <label>Email:</label>
                <input
                  type="text"
                  placeholder="Enter your Mail"
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.PopUPInput}
                />
              </div>
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
              <div className={styles.InboxesForForm}>
                <label>Mobile Number:</label>
                <input
                  type="text"
                  placeholder="Enter your Number"
                  onChange={handleMobileChange}
                  value={mobileNumber}
                  className={styles.PopUPInput}
                />
              </div>
              {errors.mobileNumber && (
                <p className={styles.errorText}>{errors.mobileNumber}</p>
              )}
              <button className={styles.BtnsForPopUp}>Submit</button>
              <button
                className={styles.BtnsForPopUp}
                onClick={() => setIsPopUp(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInfo;