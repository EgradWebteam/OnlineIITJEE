import React, { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../../../Styles/StudentDashboardCSS/Student.module.css";
import { Link } from "react-router-dom";

export default function StudentLoginFormeGradTutor({
  isForgotPassword,
  isResetPassword,
  username,
  password,
  newPassword,
  confirmPassword,
  resetCode,
  setUsername,
  setPassword,
  setNewPassword,
  setConfirmPassword,
  setResetCode,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  setIsForgotPassword,
  setIsResetPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const resetCodeRef = useRef(null);

  const getButtonText = () => {
    if (isForgotPassword) {
      return isResetPassword ? "Save Password" : "Send Reset Code";
    } else {
      return "Login";
    }
  };

  const isButtonDisabled = () => {
    if (isForgotPassword) {
      return isResetPassword
        ? !isPasswordValid(passwordCriteria) || newPassword !== confirmPassword
        : false;
    } else {
      return false;
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

  // This function checks if we need to show the next validation message dynamically
  const getValidationMessages = () => {
    const messages = [];

    if (!passwordCriteria.length) messages.push("At least 8 characters.");
    if (!passwordCriteria.uppercase) messages.push("At least one uppercase letter.");
    if (!passwordCriteria.lowercase) messages.push("At least one lowercase letter.");
    if (!passwordCriteria.number) messages.push("At least one number.");
    if (!passwordCriteria.specialChar) messages.push("At least one special character.");

    return messages;
  };

  return (
    <form
      onSubmit={
        isForgotPassword
          ? isResetPassword
            ? handleResetPassword
            : handleForgotPassword
          : handleLogin
      }
    >
      {/* Email input for login and forgot password */}
      {!isResetPassword && (
        <div className={styles.studentLoginFormInput}>
          <label>Email ID:</label>
          <input
            type="email"
            placeholder="Enter your email here"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            ref={emailRef} // Use ref here
            required
          />
        </div>
      )}

      {/* Password input for login */}
      {!isForgotPassword && !isResetPassword && (
        <div className={styles.studentLoginFormInput}>
          <label>Password:</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="Enter your password here"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordRef} // Use ref here
              required
            />
            <span
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
      )}

      {/* Reset Code and New Password fields for reset */}
      {isResetPassword && (
        <>
          <div className={styles.studentLoginFormInput}>
            <label>Reset Code:</label>
            <input
              type="text"
              placeholder="Enter the reset code sent to your email"
              name="resetCode"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              ref={resetCodeRef} // Use ref here
              required
            />
          </div>
          <div className={styles.studentLoginFormInput}>
            <label>New Password:</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"} // Toggle password visibility
                placeholder="Enter your new password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                ref={newPasswordRef} // Use ref here
                onFocus={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
                required
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowNewPassword(!showNewPassword)} // Toggle new password visibility
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {/* Password criteria list */}
            {touched.newPassword && (
              <ul className={styles.listofMandatory}>
                {getValidationMessages().map((message, index) => (
                  <li key={index} className={styles.invalid}>
                    {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.studentLoginFormInput}>
            <label>Confirm Password:</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                ref={confirmPasswordRef}
                onFocus={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                required
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {/* Display error if new password and confirm password do not match */}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className={styles.passwordError}>Passwords do not match</p>
            )}
          </div>
        </>
      )}

      {/* Submit button */}
      <div className={styles.studentLoginFormSubmit}>
        <button type="submit" disabled={isButtonDisabled()}>
          {getButtonText()} {/* Dynamic button text */}
        </button>
      </div>
      {(isForgotPassword || isResetPassword) && (
        <div className={styles.backToLogin}>
          <button
            className={styles.backToLoginButton}
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setIsResetPassword(false);
            }}
          >
            Back to Login
          </button>
        </div>
      )}
    </form>
  );
}
