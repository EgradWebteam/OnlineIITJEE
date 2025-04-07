import React from "react";
import styles from "../../Styles/CourseCards.module.css"; 

const CourseCard = ({ title, cardImage, price, context, onBuy, onGoToTest }) => {
  const showBuySection = context === "buyCourses" || context === "OTSHomePage" || context === "ORVLHomePage";

  return (
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
      ) : (
        <button className={styles.testButton} onClick={onGoToTest}>
          Go to Test <span>&raquo;</span>
        </button>
      )}
    </div>
  );
};

export default CourseCard;
