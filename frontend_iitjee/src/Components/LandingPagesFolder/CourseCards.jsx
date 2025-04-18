import React from "react";
import styles from "../../Styles/CourseCards.module.css";

const CourseCard = React.memo(
  ({ title, cardImage, price, context, onBuy, onGoToTest,portalId,type }) => {
 
    // Show Buy Now if on OTS/ORVL landing or Buy Courses page
    const showBuySection =
      context === "buyCourses" || context === "OTSHomePage" || context === "ORVLHomePage";

    // Show Go to Test only on My Courses page
    const showGoToTestSection = context === "myCourses";
    const testButtonLabel = portalId === 3 ? "Start Lecture" : "Go to Test";
    return (
      <div>
        <div className={styles.cardMain}>
          <h3 className={styles.Cardheader}>{title}</h3>

          <div className={styles.imageSectionCard}>
            <img src={cardImage} alt={title} />
          </div>

          {showBuySection ? (
            <div className={styles.cardBottom}>
              <div className={styles.CardpriceSection}>
                <p>Price:</p>
                <p>₹{price}/-</p>
              </div>
              <div className={styles.buyNowContainer}>
                <button className={`${styles.buyButton} ${styles.cardBtnColor}`} onClick={onBuy}>
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
