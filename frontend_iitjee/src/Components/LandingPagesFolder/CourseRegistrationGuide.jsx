import React from "react";
import styles from "../../Styles/LandingPageCSS/CourseRegistrationGuide.module.css";

const CourseRegistrationGuide = () => {
  return (
    <div className={styles.courseGuideWrapper}>
      <div className={styles.generalGuideSection}>
        <div className={styles.headingWrapper}>
          <h4 className={styles.mainHeading}>General Registration Guide</h4>
        </div>
        <div className={styles.stepsWrapper}>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 1:</h5>
            <p className={styles.stepText}>Click on the "Login" button on the course page.</p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 2:</h5>
            <p className={styles.stepText}>If you are new here, click on the "Register" button.</p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 3:</h5>
            <p className={styles.stepText}>Fill in the required details on the registration page.</p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 4:</h5>
            <p className={styles.stepText}>
              Click on the "Submit" button to complete the registration process. A password will be sent to your registered email.
            </p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 5:</h5>
            <p className={styles.stepText}>
              Login with your registered email and password to access the student dashboard, where you can find your courses under "My Courses" and explore more in "Buy Courses".
            </p>
          </div>
        </div>
      </div>

      <div className={styles.purchaseGuideSection}>
        <div className={styles.headingWrapper}>
          <h4 className={styles.mainHeading}>Course Registration and Purchase</h4>
        </div>
        <div className={styles.stepsWrapper}>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 1:</h5>
            <p className={styles.stepText}>
              Select the course you want to purchase from the course landing page to navigate to the respective course home page.
            </p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 2:</h5>
            <p className={styles.stepText}>Choose the exams you wish to enroll in for the selected course.</p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 3:</h5>
            <p className={styles.stepText}>
              Browse through the available courses and click on "Buy Now" for your preferred course.
            </p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 4:</h5>
            <p className={styles.stepText}>
              Fill in the required details and click on the "Pay Now" button to register and proceed to the payment page. A password will be sent to your registered email.
            </p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 5:</h5>
            <p className={styles.stepText}>
              Complete the transaction. You will be redirected to the login page.
            </p>
          </div>
          <div className={styles.step}>
            <h5 className={styles.stepHeading}>Step 6:</h5>
            <p className={styles.stepText}>
              Log in with your registered email and password to access the student dashboard. Your purchased course will be available under "My Courses."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationGuide;
