import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Styles from '../../../Styles/AdminDashboardCSS/AdminLoginPage.module.css';
import { BASE_URL } from "../../../config/apiConfig.js";
const AdminLoginForm = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetCodeStage, setIsResetCodeStage] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

 
  const resetForm = () => {
    if (emailRef.current) emailRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    setResetCode('');
    setIsForgotPassword(false);
    setIsResetCodeStage(false);
  };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/adminLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);
 if (response.ok) {
        const loginAuth={
          token:data.token,
          adminName:data.name,
          adminEmail:data.email
        }
        localStorage.setItem("adminInfo", JSON.stringify(loginAuth));
        navigate('/AdminDashboard');
      }else {
        setMessage({ type: 'error', text: data.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  }, [navigate]);

  const handleForgotPassword = useCallback(async (e) => {
    e.preventDefault();
    const inputEmail = emailRef.current.value;
    if (!inputEmail) {
      setMessage({ type: 'error', text: 'Please enter your email to reset the password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/forgot-passwordadmin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setEmail(inputEmail);
        setMessage({ type: 'success', text: 'Password reset instructions have been sent.' });
        setIsForgotPassword(false);
        setIsResetCodeStage(true);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Something went wrong.' });
    }
  }, []);

  const handleVerifyCodeAndSubmitNewPassword = useCallback(async (e) => {
    e.preventDefault();

    const newPasswordValue = newPasswordRef.current.value;
    const confirmPasswordValue = confirmPasswordRef.current.value;

    if (!email || !resetCode || !newPasswordValue || !confirmPasswordValue) {
      setMessage({ type: 'error', text: 'Please enter all required fields.' });
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      setMessage({ type: 'error', text: 'Passwords do not match. Please try again.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/reset-passwordadmin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword: newPasswordValue }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully. You can now log in.' });
        resetForm();
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid reset code.' });
      }
    } catch (error) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  }, [resetCode, email]);

  const handleResetCodeChange = (e) => setResetCode(e.target.value);

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

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPassword(true);
    setIsResetCodeStage(false);
  };

  return (
    <div className={Styles.AdminLoginPageContainer}>
      <div className={Styles.AdminLoginPage}>
        <h2 className={Styles.AdminLogin}>
          {isResetCodeStage ? 'Reset Password' : !isForgotPassword ? 'Admin Login' : 'Forgot Password'}
        </h2>
        <form
          onSubmit={isResetCodeStage ? handleVerifyCodeAndSubmitNewPassword : isForgotPassword ? handleForgotPassword : handleLogin}
          className={Styles.AdminLoginForm}
        >
          {!isForgotPassword && !isResetCodeStage ? (
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
          ) : isResetCodeStage ? (
            <>
              <InputField label="Reset Code" type="text" value={resetCode} onChange={handleResetCodeChange} name="resetCode" autoFocus={true} />
              <InputField label="New Password" type="password" onChange={() => {}} name="newPassword" ref={newPasswordRef} />
              <InputField label="Confirm Password" type="password" onChange={() => {}} name="confirmPassword" ref={confirmPasswordRef} />
              <div className={Styles.AdminLoginButton}>
                {loading ? <div>Loading...</div> : <button type="submit">Submit New Password</button>}
              </div>
            </>
          ) : (
            <>
              <InputField label="Email Id" type="email" onChange={() => {}} name="email" autoFocus={true} ref={emailRef} />
              <div className={Styles.AdminLoginButton}>
                {loading ? <div>Loading...</div> : <button type="submit">Send Reset Code</button>}
              </div>
            </>
          )}
        </form>

        {message.text && <div className={message.type === 'error' ? Styles.errorMessage : Styles.successMessage}>{message.text}</div>}
      </div>
    </div>
  );
};

export default AdminLoginForm;
