import React, { useState } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

export default function QuestionOptionsContainer({ options, optPatternId, questionTypeId }) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

  const getLabel = (index, optionIndex) => {
    if (optPatternId === 1) return `(${optionIndex.toUpperCase()})`; // (A), (B)
    if (optPatternId === 2) return `(${optionIndex.toLowerCase()})`; // (a), (b)
    if (optPatternId === 3) return `(${index + 1})`; // (1), (2)
    return `(${optionIndex})`; // fallback
  };

  const inputType =
    [1, 2].includes(questionTypeId) ? "radio" :
    [3, 4].includes(questionTypeId) ? "checkbox" :
    null;
    const [natValue, setNatValue] = useState(""); 
    const calculatorButtons = [
      '7', '8', '9', 
      '4', '5', '6', 
      '3', '2', '1', 
      '0', '.','-'
    ];
  
    const handleCalculatorInput = (val) => {
      if (val === "ClearAll") {
        setNatValue("");
      } else if (val === "BackSpace") {
        setNatValue(prev => prev.slice(0, -1));
      } else if (val === "←" || val === "→") {
        // Optional: Add caret logic if needed
      } else {
        setNatValue(prev => prev + val);
      }
    };
  
  return (
    <div className={styles.QuestionOptionsMainContainer}>
      {/* MCQ / MSQ */}
      {[1, 2, 3, 4].includes(questionTypeId) && options.map((option, index) => {
        const isImage = imageExtensions.some(ext =>
          option?.optionImgName?.toLowerCase().endsWith(ext)
        );

        return (
          <div key={option.option_id} className={styles.SingleOptionContainer}>
            <label className={styles.QuestionLabel}>
              <input type={inputType} name="option" value={option.option_index} />
              <span className={styles.OptionIndex}>
                {getLabel(index, option.option_index)}
              </span>
              {isImage ? (
                <img
                  src={`/path-to-images/${option.optionImgName}`}
                  alt={`Option ${option.option_index}`}
                  className={styles.OptionImage}
                />
              ) : (
                <span className={styles.OptionText}>{option.optionImgName}</span>
              )}
            </label>
          </div>
        );
      })}

      {/* NAT Input + Calculator */}
       {/* NAT Input + Calculator */}
       {[5, 6].includes(questionTypeId) && (
        <div className={styles.NATInputHolder}>
          <label className={styles.NATLabel}>
            <input
              type="text"
              className={styles.NATInput}
              value={natValue}
            />
          </label>
          <div className={styles.backSpaceBtn}>
            <button>
             BackSpace
            </button>
          </div>
          <div className={styles.CalculatorBox}>
            {calculatorButtons.map((btn, idx) => (
              <button
                key={idx}
                className={styles.CalcButton}
                onClick={() => handleCalculatorInput(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className={styles.arrowBtns}>
            <button>
              &larr;
            </button>
            <button>
              &rarr;
            </button>
          </div>
          <div className={styles.backSpaceBtn}>
            <button>
             Clearall
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
