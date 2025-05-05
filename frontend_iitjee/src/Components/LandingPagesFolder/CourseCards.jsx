import React,{useEffect} from "react";
import styles from "../../Styles/CourseCards.module.css";
import { frontEndURL } from "../../ConfigFile/ApiConfigURL";
const CourseCard = React.memo(
  ({ title, cardImage, price, context, onBuy, onGoToTest, portalId, type }) => {
    console.log("CourseCard rendered",cardImage); // Log when the component is rendered
    // Show Buy Now if on OTS/ORVL landing or Buy Courses page
    const showBuySection =
      context === "buyCourses" ||
      context === "OTSHomePage" ||
      context === "ORVLHomePage";

    // Show Go to Test only on My Courses page
    const showGoToTestSection = context === "myCourses";
    const testButtonLabel = portalId === 3 ? "Start Lecture" : "Go to Test";
    useEffect(() => {
      if (
        !document.querySelector(
          "script[src='https://checkout.razorpay.com/v1/checkout.js']"
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }, []);
    return (
      <div>
        <div className={styles.cardMain}>
          <div className={styles.courseCardHeaderDivvv}>
          <h3 className={styles.Cardheader}>{title}</h3>
          </div>
          
          <div className={styles.imageSectionCard}>
            <img  src={`${frontEndURL}/OtsCourseCardImages/${cardImage}`} alt={title} />
          </div>

          {showBuySection ? (
            <div className={styles.cardBottom}>
              <div className={styles.CardpriceSection}>
                <p>Price:</p>
                <p>₹{price}/-</p>
              </div>
              <div className={styles.buyNowContainer}>
                <button
                  className={`${styles.buyButton} ${styles.cardBtnColor}`}
                  onClick={onBuy}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ) : showGoToTestSection ? (
            <div className={styles.cardBottomGototest}>
              <button className={styles.testButton} onClick={onGoToTest}>
                {testButtonLabel} <span>&raquo;</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

export default React.memo(CourseCard);
