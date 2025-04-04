import React from 'react'
import Styles from '../../../Styles/AdminLoginPage.module.css'

const AdminLoginPage = () => {
  return (
    <div className={Styles.AdminLoginPageContainer}>
    <div className={Styles.AdminLoginPage}>
        <h2 className={Styles.AdminLogin}>
            Admin Login
        </h2>
        <form className={Styles.AdminLoginForm}>
            <div className={Styles.AdminLableName}><label>Email Id:</label>
          <input type='text' placeholder='Entern Your Email Id here'/></div>
            <div className={Styles.AdminLableName}><label>Password:</label>
           <input type='text' placeholder='Enter Your Password here'/></div>
          <div className ={Styles.AdminLoginButton}> <button  type='submit'>Login</button></div>
        </form>
        <div className={Styles.AdminForgotPassword}>Forgot Password</div>
    </div>
    </div>
  )
}

export default AdminLoginPage