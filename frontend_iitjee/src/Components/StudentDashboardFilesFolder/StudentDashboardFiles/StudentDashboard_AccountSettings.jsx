import React, { useEffect, useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import defaultImage from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard_AccountSettings.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";

const StudentDashboard_AccountSettings = ({
  userData,
  setActiveSubSection,
  activeSubSection,
}) => {
  // const [activeSubSection, setActiveSubSection] = useState("profile");

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
const [popupMessage, setPopupMessage] = useState("");



  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  
  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const studentName = userData?.candidate_name;
  const studentEmail = userData?.email_id;
  const studentContact = userData?.mobile_no;
  const studentProfile = userData?.uploaded_photo || defaultImage;

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill out both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!isPasswordValid(passwordCriteria)) {
      setErrorMessage("Password does not meet the required criteria.");
      return;
    }
    const resetPasswordData = {
      email: studentEmail,
      newPassword: newPassword,
    };

    try {
      const response = await fetch(`${BASE_URL}/student/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetPasswordData),
      });

      const data = await response.json();

      if (response.ok) {
        setPopupMessage("Password changed successfully!"); // ✅ Set popup message
        setShowPopup(true); // ✅ Open popup
      
        setSuccessMessage("");
        setErrorMessage("");
      
        setNewPassword("");
        setConfirmPassword("");
      }
       else {
        setErrorMessage(
          data.message || "Failed to reset password. Please try again."
        );
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later.");
      setSuccessMessage("");
    }
  };

  const checkPasswordCriteria = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
  };
  const isPasswordValid = (criteria) => {
    return (
      criteria.length &&
      criteria.uppercase &&
      criteria.lowercase &&
      criteria.number &&
      criteria.specialChar
    );
  };
  const passwordCriteria = checkPasswordCriteria(newPassword);

 
  return (
    <div className={styles.studetnDashboard_SettingsHomePage}>
      <div className={styles.StdAccountPwdContainer}>
        <div className={styles.StudentAccountProfile}>
          <div className={styles.StudentAccountProfile2}>
            {/* <FaUser /> */}
            <img src={studentProfile} alt="studentProfile" />
          </div>
        </div>
        <div className={styles.StudentAccountPwds}>
          <div
            className={`${styles.passwordsButton} ${
              activeSubSection === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveSubSection("profile")}
          >
            Profile Info
          </div>
          <div
            className={`${styles.passwordsButton} ${
              activeSubSection === "password" ? styles.active : ""
            }`}
            onClick={() => setActiveSubSection("password")}
          >
            Change Password
          </div>
        </div>

        {activeSubSection === "profile" && (
          <div className={styles.StudentAccountDetails}>
            <div className={styles.StudentDetails}>Name: {studentName}</div>
            <div className={styles.StudentDetails}>Email: {studentEmail}</div>
            <div className={styles.StudentDetails}>
              Mobile Number: {studentContact}
            </div>
          </div>
        )}

        {activeSubSection === "password" && (
          <form
            className={styles.StudentResetPassword}
            onSubmit={handlePasswordChange}
          >
            <label className={styles.PasswordCreation}>
              Enter New Password
            </label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword.new ? "text" : "password"}
                className={styles.passwordInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={(e)=>{
                  e.preventDefault()
                  setIsNewPasswordFocused(true)}}
  onBlur={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
                required
              />
              {isNewPasswordFocused && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  togglePasswordVisibility("new")
                }}
                className={styles.eyeIcon}
              >
                {showPassword.new ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
)}
            </div>
            {newPassword&&(
              <ul className={styles.listofMandatory}>
                <li
                  className={
                    passwordCriteria.length
                      ? styles.valid
                      : (touched.newPassword 
                      ? styles.invalid
                      : styles.hidden)
                  }
                >
                  At least 8 characters.
                </li>
                <li
                  className={
                    passwordCriteria.uppercase
                      ? styles.valid
                      :(touched.newPassword 
                      ? styles.invalid
                      : styles.hidden)
                  }
                >
                  At least one uppercase letter.
                </li>
                <li
                  className={
                    passwordCriteria.lowercase
                      ? styles.valid
                      :(touched.newPassword 
                      ? styles.invalid
                      : styles.hidden)
                  }
                >
                  At least one lowercase letter.
                </li>
                <li
                  className={
                    passwordCriteria.number
                      ? styles.valid
                      : (touched.newPassword 
                      ? styles.invalid
                      : styles.hidden)
                  }
                >
                  At least one number.
                </li>
                <li
                  className={
                    passwordCriteria.specialChar
                      ? styles.valid
                      : (touched.newPassword 
                      ? styles.invalid
                      : styles.hidden)
                  }
                >
                  At least one special character.
                </li>
              </ul>
            )}
            <label className={styles.PasswordCreation}>Confirm Password</label>
            <div className={styles.passwordInputContainer}>
            <input
  type={showPassword.confirm ? "text" : "password"}
  className={styles.passwordInput}
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  onFocus={(e)=>{
    e.preventDefault()
    setIsNewPasswordFocused(true)}}
  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
  required
/>
{isNewPasswordFocused && (
              <span
                onClick={(e) => {
                  e.preventDefault()
                  togglePasswordVisibility("confirm")}}
                className={styles.eyeIcon}
              >
                {showPassword.confirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
)}
            </div>
            {touched.confirmPassword && newPassword && confirmPassword && newPassword !== confirmPassword && (
  <p className={styles.passwordError}>Passwords do not match</p>
)}

            {/* Display error or success message */}
            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}
           
           {showPopup && (
            <div className={styles.popup_overlay}>
              <div className={styles.popup_content}>
  <div className={styles.popupMessage_container}>
    <div className={styles.popupMessage}>
    {popupMessage}
    </div>
    <div className={styles.CloseBtnForPopUp}>
      <button onClick={()=> setShowPopup(false)}>Close</button>
    </div>
  </div>
  </div>
  </div>
)}

            <button
              type="submit"
              className={styles.ChangewPwdButton}
              disabled={
                !isPasswordValid(passwordCriteria) ||
                newPassword !== confirmPassword
              }
             
            >
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard_AccountSettings;
