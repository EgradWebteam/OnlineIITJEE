import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import Styles from '../../../Styles/LandingPageCSS/AdminLoginPage.module.css';

const AdminLoginForm = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Refs for email and password
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Reset form state
  const resetForm = () => {
    if (emailRef.current) emailRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setIsForgotPassword(false);
  };

  // Handle login form submission
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (!email || !password) {
      setMessage({ type: 'error', text: "Please enter both email and password." });
      return;
    }

    // Log the data being sent to the backend
    console.log("Sending login request with data:", { email, password });

    setLoading(true);
    try {
      const response = await fetch("/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setMessage({ type: 'success', text: "Login successful." });
        navigate("/admin-dashboard");
      } else {
        setMessage({ type: 'error', text: data.message || "Login failed. Please try again." });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: "Something went wrong. Please try again." });
    }
  }, [navigate]);

  // Handle forgot password form submission
  const handleForgotPassword = useCallback(async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    if (!email) {
      setMessage({ type: 'error', text: "Please enter your email to reset the password." });
      return;
    }

    // Log the data being sent to the backend
    console.log("Sending forgot password request with email:", { email });

    setLoading(true);
    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setMessage({ type: 'success', text: "Password reset instructions have been sent." });
        setIsForgotPassword("code");
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: "Something went wrong." });
    }
  }, []);

  // Handle reset code and new password submission
  const handleVerifyCodeAndSubmitNewPassword = useCallback(async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: "Please enter the reset code, new password, and confirm password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match. Please try again." });
      return;
    }

    // Log the data being sent to the backend
    console.log("Sending reset code and new password request with data:", { email: emailRef.current.value, resetCode, newPassword });

    setLoading(true);
    try {
      const response = await fetch("/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRef.current.value, resetCode, newPassword }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setMessage({ type: 'success', text: "Password changed successfully. You can now log in." });
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.message || "Invalid reset code." });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: "Something went wrong. Please try again." });
    }
  }, [resetCode, newPassword, confirmPassword]);

  // Handle input change
  const handleResetCodeChange = (e) => setResetCode(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // Input field component for reusability
  const InputField = ({ label, type, value, onChange, name, autoFocus, ref }) => (
    <div className={Styles.AdminLableName}>
      <label htmlFor={name}>{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        autoFocus={autoFocus}
        ref={ref}
        id={name}
      />
    </div>
  );

  // Handle Forgot Password click
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPassword(true);
  };

  return (
    <div className={Styles.AdminLoginPageContainer}>
      <div className={Styles.AdminLoginPage}>
        <h2 className={Styles.AdminLogin}>
          {isForgotPassword === "code" ? "Reset Password" : "Admin Login"}
        </h2>
        <form
          onSubmit={isForgotPassword === "code" ? handleVerifyCodeAndSubmitNewPassword : handleLogin}
          className={Styles.AdminLoginForm}
        >
          {!isForgotPassword ? (
            <>
              <InputField label="Email Id" type="email" onChange={() => {}} name="email" autoFocus={true} ref={emailRef} />
              <InputField label="Password" type="password" onChange={() => {}} name="password" ref={passwordRef} />
              <div className={Styles.AdminLoginButton}>
                {loading ? <div>Loading...</div> : <button type="submit">Login</button>}
              </div>
              <a href="#" className={Styles.AdminForgotPassword} onClick={handleForgotPasswordClick}>
                Forgot Password
              </a>
            </>
          ) : (
            isForgotPassword !== "code" ? (
              <>
                <InputField label="Email Id" type="email" onChange={() => {}} name="email" autoFocus={true} ref={emailRef} />
                <div className={Styles.AdminLoginButton}>
                  {loading ? <div>Loading...</div> : <button type="submit" onClick={handleForgotPassword}>Send Reset Code</button>}
                </div>
              </>
            ) : (
              <>
                <InputField label="Reset Code" type="text" value={resetCode} onChange={handleResetCodeChange} name="resetCode" autoFocus={true} />
                <InputField label="New Password" type="password" value={newPassword} onChange={handleNewPasswordChange} name="newPassword" />
                <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} name="confirmPassword" />
                <div className={Styles.AdminLoginButton}>
                  {loading ? <div>Loading...</div> : <button type="submit">Submit New Password</button>}
                </div>
              </>
            )
          )}
        </form>

        {message.text && <div className={message.type === 'error' ? Styles.errorMessage : Styles.successMessage}>{message.text}</div>}

        {isForgotPassword === "code" && (
          <div className={Styles.BackToLoginLink}>
            <a className={Styles.AdminForgotPassword} href="#" onClick={() => setIsForgotPassword(false)}>
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginForm;
