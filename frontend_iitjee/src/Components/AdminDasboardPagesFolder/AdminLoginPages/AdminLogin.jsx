import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import Styles from '../../../Styles/AdminDashboardCSS/AdminLogin.module.css';

const AdminLoginForm = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset form state
  const resetForm = () => {
    setEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPassword("");
    setIsForgotPassword(false);
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
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
        setSuccessMessage("Login successful.");
        navigate("/admin-dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle forgot password form submission (Email submission)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }
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
        setSuccessMessage("Password reset instructions have been sent.");
        setIsForgotPassword("code");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setLoading(false);
      setError("Something went wrong.");
    }
  };

  // Handle reset code and new password submission
  const handleVerifyCodeAndSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      setError("Please enter the reset code, new password, and confirm password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setSuccessMessage("Password changed successfully. You can now log in.");
        resetForm();
      } else {
        setError(data.message || "Invalid reset code.");
      }
    } catch (error) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  // Input field component for reusability
  const InputField = ({ label, type, value, onChange, name }) => (
    <div className={Styles.AdminLableName}>
      <label>{label}:</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );

  // Handle Forgot Password click
  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPassword(true);
    handleForgotPassword(e); // Trigger forgot password action
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError(''); 
    setSuccessMessage(''); 
    const fieldMapping = {
        email: setEmail,
        password: setPassword,
        resetCode: setResetCode,
        newPassword: setNewPassword,
        confirmPassword: setConfirmPassword,
    };
    fieldMapping[name]?.(value);
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
              <InputField label="Email Id" type="email" value={email} onChange={handleInputChange} name="email" />
              <InputField label="Password" type="password" value={password} onChange={handleInputChange} name="password" />
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
                <InputField label="Email Id" type="email" value={email} onChange={handleInputChange} name="email" />
                <div className={Styles.AdminLoginButton}>
                  {loading ? <div>Loading...</div> : <button type="submit">Send Reset Code</button>}
                </div>
              </>
            ) : (
              <>
                <InputField label="Reset Code" type="text" value={resetCode} onChange={handleInputChange} name="resetCode" />
                <InputField label="New Password" type="password" value={newPassword} onChange={handleInputChange} name="newPassword" />
                <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={handleInputChange} name="confirmPassword" />
                <div className={Styles.AdminLoginButton}>
                  {loading ? <div>Loading...</div> : <button type="submit">Submit New Password</button>}
                </div>
              </>
            )
          )}
        </form>

        {error && <div className={Styles.errorMessage}>{error}</div>}
        {successMessage && <div className={Styles.successMessage}>{successMessage}</div>}

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
