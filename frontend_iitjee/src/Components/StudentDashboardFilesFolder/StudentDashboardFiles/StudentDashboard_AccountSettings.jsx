import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logostudent from "../../../assets/OTSTestInterfaceImages/StudentImage.png";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard_AccountSettings.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";
const StudentDashboard_AccountSettings = ({ userData }) => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
const [studentProfile, setStudentProfile] = useState(logostudent);
  useEffect(() => {
    console.log("mysettings");
  }, []);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };
  const AZURE_STORAGE_BASE_URL = `https://${import.meta.env.VITE_AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${import.meta.env.VITE_AZURE_CONTAINER_NAME}`;
  const SAS_TOKEN = `?${import.meta.env.VITE_AZURE_SAS_TOKEN}`;
    useEffect(() => {
      if (userData?.uploaded_photo) {
        // Dynamically create the image URL
        const profileImageUrl = `${AZURE_STORAGE_BASE_URL}/${import.meta.env.VITE_AZURE_DOCUMENT_FOLDER}/${userData.uploaded_photo}${SAS_TOKEN}`;
        console.log("Generated Profile Image URL:", profileImageUrl); // Log the URL for debugging
  
        // Check if the URL is valid
        fetch(profileImageUrl, { method: 'HEAD' })
          .then((response) => {
            if (response.ok) {
              setStudentProfile(profileImageUrl); // Set the profile image if it's valid
            } else {
              console.error("Image URL is invalid or not accessible:", profileImageUrl);
            }
          })
          .catch((error) => {
            console.error("Error fetching the image URL:", error);
          });
      }
    }, [userData]);
  const studentName = userData?.candidate_name;
  const studentEmail = userData?.email_id;
  const studentContact = userData?.mobile_no;


  console.log("stuenttProfile:", studentProfile);
  
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
        setSuccessMessage("Password changed successfully.");
        setErrorMessage("");
  
        // ✅ Clear input fields after successful password change
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(data.message || "Failed to reset password. Please try again.");
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

  const passwordCriteria = checkPasswordCriteria(newPassword);

  

  return (
    <div className={styles.studetnDashboard_SettingsHomePage}>
      <div className={styles.StdAccountPwdContainer}>
        <div className={styles.StudentAccountProfile}>
          <div className={styles.StudentAccountProfile2}>
            {/* <FaUser /> */}
            <img src={studentProfile} alt="studentProfile"/>
          </div>
        </div>
        <div className={styles.StudentAccountPwds}>
          <div
            className={`${styles.passwordsButton} ${
              activeSection === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            Profile Info
          </div>
          <div
            className={`${styles.passwordsButton} ${
              activeSection === "password" ? styles.active : ""
            }`}
            onClick={() => setActiveSection("password")}
          >
            Change Password
          </div>
        </div>

        {activeSection === "profile" && (
          <div className={styles.StudentAccountDetails}>
            <div className={styles.StudentDetails}>Name: {studentName}</div>
            <div className={styles.StudentDetails}>Email: {studentEmail}</div>
            <div className={styles.StudentDetails}>Mobile Number: {studentContact}</div>
          </div>
        )}

        {activeSection === "password" && (
          <form className={styles.StudentResetPassword} onSubmit={handlePasswordChange}>
            <label className={styles.PasswordCreation}>Enter New Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword.new ? "text" : "password"}
                className={styles.passwordInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                onClick={() => togglePasswordVisibility("new")}
                className={styles.eyeIcon}
              >
                {showPassword.new ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>

            {/* <ul className={styles.listofMandatory}>
              <li>At least 8 characters.</li>
              <li>At least one uppercase letter.</li>
              <li>At least one lowercase letter.</li>
              <li>At least one number.</li>
              <li>At least one special character.</li>
            </ul> */}

            <ul className={styles.listofMandatory}>
              <li className={passwordCriteria.length ? styles.valid : ""}>
                At least 8 characters.
              </li>
              <li className={passwordCriteria.uppercase ? styles.valid : ""}>
                At least one uppercase letter.
              </li>
              <li className={passwordCriteria.lowercase ? styles.valid : ""}>
                At least one lowercase letter.
              </li>
              <li className={passwordCriteria.number ? styles.valid : ""}>
                At least one number.
              </li>
              <li className={passwordCriteria.specialChar ? styles.valid : ""}>
                At least one special character.
              </li>
            </ul>

            <label className={styles.PasswordCreation}>Confirm Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword.confirm ? "text" : "password"}
                className={styles.passwordInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                onClick={() => togglePasswordVisibility("confirm")}
                className={styles.eyeIcon}
              >
                {showPassword.confirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>

            {/* Display error or success message */}
            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

            <button type="submit" className={styles.ChangewPwdButton}>
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard_AccountSettings;
