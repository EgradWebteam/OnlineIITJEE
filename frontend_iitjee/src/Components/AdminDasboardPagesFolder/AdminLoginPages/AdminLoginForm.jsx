import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Styles from "../../../Styles/AdminDashboardCSS/AdminLoginPage.module.css";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL.js";

const AdminLoginForm = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetCodeStage, setIsResetCodeStage] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [instructionsPopup, setInstructionsPopup] = useState("");
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || !password) {
        console.log(email,password)
        setMessage({
          type: "error",
          text: "Please enter both email and password.",
        });
        return;
      }
console.log(email,password)
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/admin/adminLogin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          const loginAuth = {
            token: data.token,
            role: data.role,
            adminName: data.name,
            admin_id: data.admin_id,
            adminEmail: data.email,
          };
          localStorage.setItem("adminInfo", JSON.stringify(loginAuth));
          setMessage({ type: "success", text: "Login successful." });
          navigate("/AdminDashboard");
        } else {
          setMessage({
            type: "error",
            text: data.message || "Login failed. Please try again.",
          });
        }
      } catch (error) {
        setLoading(false);
        setMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    },
    [navigate,email,password]
  );

  const handleForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email) {
        setMessage({
          type: "error",
          text: "Please enter your email to reset the password.",
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/admin/forgot-passwordadmin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          // setEmail(email);
          setInstructionsPopup("Password reset instructions have been sent");
          setShowInstructionsPopup(true);

          setIsForgotPassword(false);
          setIsResetCodeStage(true);
        } else {
          setMessage({ type: "error", text: data.message });
        }
      } catch (error) {
        setLoading(false);
        setMessage({ type: "error", text: "Something went wrong." });
      }
    },
    [email]
  );

  const handleVerifyCodeAndSubmitNewPassword = useCallback(
    async (e) => {
      e.preventDefault();
      if (!resetCode || !newPassword || !confirmPassword) {
        setMessage({
          type: "error",
          text: "Please enter all required fields.",
        });
        return; // Don't proceed with the API request if fields are missing
      }
      if (newPassword !== confirmPassword) {
        setMessage({
          type: "error",
          text: "Passwords do not match. Please try again.",
        });
        return; // Prevent submitting if passwords don't match
      }
  // Check password strength
  if (!isPasswordValid(passwordCriteria)) {
    setMessage({
      type: "error",
      text: "Password does not meet the required criteria.",
    });
    return;  // Stop form submission if password is invalid
  }

  // If all validations pass, proceed with password reset
  setLoading(true);
     
  
      try {
        const response = await fetch(`${BASE_URL}/admin/reset-passwordadmin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, resetCode, newPassword }),
        });
  
        const data = await response.json();
        setLoading(false);
  
        if (response.ok) {
          setPopupMessage("Password changed successfully!");
          setShowPopup(true);
        } else {
          setMessage({
            type: "error",
            text: data.message || "Invalid reset code.",
          });
        }
      } catch (error) {
        setLoading(false);
        setMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    },
    [resetCode, email, newPassword, confirmPassword]
  );
  
  const handleResetCodeChange = (e) => {
    setResetCode(e.target.value);
  };

  const togglePasswordVisibility = (field) => {
    if (field === "login") {
      setShowPassword((prev) => !prev);
    } else if (field === "new") {
      setShowNewPassword((prev) => !prev);
    } else if (field === "confirm") {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPassword(true);
    setIsResetCodeStage(false);
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
    <div className={Styles.AdminLoginPageContainer}>
      <div className={Styles.AdminLoginPage}>
        <h2 className={Styles.AdminLogin}>
          {isResetCodeStage
            ? "Reset Password"
            : !isForgotPassword
            ? "Admin Login"
            : "Forgot Password"}
        </h2>
        <form
          onSubmit={
            isResetCodeStage
              ? handleVerifyCodeAndSubmitNewPassword
              : isForgotPassword
              ? handleForgotPassword
              : handleLogin
          }
          className={Styles.AdminLoginForm}
        >
          {!isForgotPassword && !isResetCodeStage ? (
            <>
              <label>Email Id</label>
              <div className={Styles.adminInputBoxes}>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus={true}
                />
              </div>
              <label>Password</label>
              <div className={Styles.adminInputBoxes}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <span
                  onClick={() => {
                    togglePasswordVisibility("login");
                  }}
                  className={Styles.eyeIcon}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}{" "}
                  {/* Replace with proper icons if using a library like FontAwesome */}
                </span>
              </div>
              <div className={Styles.AdminLoginButton}>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <button type="submit" disabled={loading}>
  {loading ? "Loging..." : "Login"}
</button>

                )}
                </div>
              <a
                href="#"
                className={Styles.AdminForgotPassword}
                onClick={handleForgotPasswordClick}
              >
                Forgot Password
              </a>
            </>
          ) : isResetCodeStage ? (
            <>
              <label>Reset Code</label>
              <div className={Styles.adminInputBoxes}>
                <input
                  type="text"
                  value={resetCode}
                  onChange={handleResetCodeChange}
                  name="resetCode"
                  autoFocus={true}
                />
              </div>
              <label>New Password</label>
              <div className={Styles.adminInputBoxes}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, newPassword: true }));
                  }}
                  value={newPassword}
                  name="newPassword"
                />
                <span
                  onClick={() => {
                    togglePasswordVisibility("new");
                  }}
                  className={Styles.eyeIcon}
                >
                  {showNewPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}{" "}
                  {/* Replace with proper icons if using a library like FontAwesome */}
                </span>
              </div>
              {newPassword && (
                <ul className={Styles.listofMandatory}>
                  <li
                    className={
                      passwordCriteria.length
                        ? Styles.valid
                        : touched.newPassword
                        ? Styles.invalid
                        : Styles.hidden
                    }
                  >
                    At least 8 characters.
                  </li>
                  <li
                    className={
                      passwordCriteria.uppercase
                        ? Styles.valid
                        : touched.newPassword
                        ? Styles.invalid
                        : Styles.hidden
                    }
                  >
                    At least one uppercase letter.
                  </li>
                  <li
                    className={
                      passwordCriteria.lowercase
                        ? Styles.valid
                        : touched.newPassword
                        ? Styles.invalid
                        : Styles.hidden
                    }
                  >
                    At least one lowercase letter.
                  </li>
                  <li
                    className={
                      passwordCriteria.number
                        ? Styles.valid
                        : touched.newPassword
                        ? Styles.invalid
                        : Styles.hidden
                    }
                  >
                    At least one number.
                  </li>
                  <li
                    className={
                      passwordCriteria.specialChar
                        ? Styles.valid
                        : touched.newPassword
                        ? Styles.invalid
                        : Styles.hidden
                    }
                  >
                    At least one special character.
                  </li>
                </ul>
              )}
              <label>Confirm Password</label>
              <div className={Styles.adminInputBoxes}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  name="confirmPassword"
                />
                <span
                  onClick={() => {
                    togglePasswordVisibility("confirm");
                  }}
                  className={Styles.eyeIcon}
                >
                  {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}{" "}
                  {/* Replace with proper icons if using a library like FontAwesome */}
                </span>
              </div>
              <div className={Styles.AdminLoginButton}>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <button type="submit" disabled={loading}>
  {loading ? "Submitting..." : "Submit New Password"}
</button>

                )}
              </div>
            </>
          ) : (
            <div>
              <div className={Styles.adminInputBoxes}>
                <input
                  label="Email Id"
                  type="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  name="email"
                  autoFocus={true}
                />
              </div>
              <div className={Styles.AdminLoginButton}>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <button type="submit">Send Reset Code</button>
                )}
              </div>
            </div>
          )}
        </form>
        {(showInstructionsPopup || showPopup) && (
          <div className={Styles.adminPopupOverlay}>
            <div className={Styles.adminPopupContent}>
              <div className={Styles.adminPopupMessageContainer}>
                <div className={Styles.adminPopupMessage}>
                  {/* Conditionally render popup message */}
                  {showInstructionsPopup ? instructionsPopup : popupMessage}
                </div>
                <div className={Styles.adminCloseBtnForPopUp}>
                  <button
                    onClick={() => {
                      // Close the respective popups
                      setShowInstructionsPopup(false); // Close instructions popup
                      setShowPopup(false); // Close main popup

                      // Reset states only when closing showPopup
                      if (showPopup) {
                        setIsForgotPassword(false);
                        setIsResetCodeStage(false);
                        setPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setResetCode("");
                        setMessage({ type: "", text: "" });
                      }
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div
            className={
              message.type === "error"
                ? Styles.errorMessage
                : Styles.successMessage
            }
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginForm;
