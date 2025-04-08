import React, { useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { FaUser } from "react-icons/fa6";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import styles from "../../../Styles/StudentDashboardCSS/StudentDashboard_AccountSettings.module.css";

const StudentDashboard_AccountSettings = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return (
    <div className={styles.studetnDashboard_SettingsHomePage}>
      <div className={styles.StdAccountPwdContainer}>
      <div className={styles.StudentAccountProfile}>
        <div className={styles.StudentAccountProfile2}>
        <FaUser />
        </div>
        </div>
        <div className={styles.StudentAccountPwds}>
          <div
            className={`${styles.passwordsButton} ${
              activeSection === "profile" ? styles.active : ""
            }`}
            onClick={() => setActiveSection("profile")}
          >
            Profile Update
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
            <div className={styles.StudentDetails}>Name:</div>
            <div className={styles.StudentDetails}>Email:</div>
            <div className={styles.StudentDetails}>Mobile Number:</div>
          </div>
        )}
        {activeSection === "password" && (
          <form className={styles.StudentResetPassword}>
            <label className={styles.PasswordCreation}>
              Enter New Password
            </label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword.new ? "text" : "password"}
                className={styles.passwordInput}
                required
              />
              <span
                onClick={() => togglePasswordVisibility("new")}
                className={styles.eyeIcon}
              >
                {showPassword.new ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>

            <ul className={styles.listofMandatory}>
              <li>At least 8 characters.</li>
              <li>At least one uppercase letter.</li>
              <li>At least one lowercase letter.</li>
              <li>At least one number.</li>
              <li>At least one special character.</li>
            </ul>
            <label className={styles.PasswordCreation}>Confirm Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword.confirm ? "text" : "password"}
                className={styles.passwordInput}
                required
              />
              <span
                onClick={() => togglePasswordVisibility("confirm")}
                className={styles.eyeIcon}
              >
                {showPassword.confirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>
            <button className={styles.ChangewPwdButton}>Change Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard_AccountSettings;
