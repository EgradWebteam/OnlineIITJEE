import React, { useState, useEffect } from 'react';
import styles from "../../../Styles/OTSCSS/OTSMain.module.css";

export default function QuestionOptionsContainer({
  options,
  optPatternId,
  questionTypeId,
  onSelectOption,
  savedAnswer,
  selectedOption,
  questionId,
  selectedOptionsArray,
  setSelectedOptionsArray,
  natValue,
  setNatValue
}) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

console.log("saved answer:", savedAnswer);
console.log("questionId", questionId);
  // Sync saved NAT answer when revisiting
  useEffect(() => {
    if ([5, 6].includes(questionTypeId) && savedAnswer?.natAnswer) {
      setNatValue(savedAnswer.natAnswer);
    }
  }, [questionTypeId, savedAnswer]);

  const getLabel = (index, optionIndex) => {
    if (optPatternId === 1) return `(${optionIndex.toUpperCase()})`;
    if (optPatternId === 2) return `(${optionIndex.toLowerCase()})`;
    if (optPatternId === 3) return `(${index + 1})`;
    return `(${optionIndex})`;
  };

  const calculatorButtons = ['7', '8', '9', '4', '5', '6', '3', '2', '1', '0', '.', '-'];

  const handleCalculatorInput = (val) => {
    if (val === "ClearAll") {
      setNatValue("");
      onSelectOption("");
    } else if (val === "BackSpace") {
      const updated = natValue.slice(0, -1);
      setNatValue(updated);
      onSelectOption(updated);
    } else {
      const updated = natValue + val;
      setNatValue(updated);
      onSelectOption(updated);
    }
  };


  return (
    <div className={styles.QuestionOptionsMainContainer}>
      {/* MCQ */}
      {[1, 2].includes(questionTypeId) && options.map((option, index) => {
        const isImage = imageExtensions.some(ext =>
          option?.optionImgName?.toLowerCase().endsWith(ext)
        );

        return (
          <div key={option.option_id} className={styles.SingleOptionContainer}>
            <label className={styles.QuestionLabel}>
              <input
                type="radio"
                name={`mcq-question-${questionId}`}  // unique group name
                value={option.option_index}
                // checked={savedAnswer?.optionIndex === option.option_index}
                // checked={
                //   selectedOption?.option_index === option.option_index ||
                //   savedAnswer?.optionIndex === option.option_index
                // }
                checked={
                  selectedOption?.option_index === option.option_index ||
                  (!selectedOption && savedAnswer?.optionIndex === option.option_index)
                }
                onChange={() =>
                  onSelectOption({
                    option_id: option.option_id,
                    option_index: option.option_index,
                  })
                }
              />
              <span className={styles.OptionIndex}>{getLabel(index, option.option_index)}</span>
              {isImage ? (
                <img src={`/path-to-images/${option.optionImgName}`} alt={`Option ${option.option_index}`} className={styles.OptionImage} />
              ) : (
                <span className={styles.OptionText}>{option.optionImgName}</span>
              )}
            </label>
          </div>
        );
      })}

      {/* MSQ */}
      {[3, 4].includes(questionTypeId) && options.map((option, index) => {
        const isImage = imageExtensions.some(ext =>
          option?.optionImgName?.toLowerCase().endsWith(ext)
        );

        const isChecked = selectedOptionsArray.includes(option.option_index);

        const toggleOption = () => {
          const updated = isChecked
            ? selectedOptionsArray.filter(val => val !== option.option_index)
            : [...selectedOptionsArray, option.option_index];
        
          setSelectedOptionsArray(updated);
          onSelectOption(updated);
        };

        return (
          <div key={option.option_id} className={styles.SingleOptionContainer}>
            <label className={styles.QuestionLabel}>
              <input
                type="checkbox"
                name={`msq-option-${option.option_index}`}
                value={option.option_index}
                checked={isChecked}
                onChange={toggleOption}
              />
              <span className={styles.OptionIndex}>{getLabel(index, option.option_index)}</span>
              {isImage ? (
                <img src={`/path-to-images/${option.optionImgName}`} alt={`Option ${option.option_index}`} className={styles.OptionImage} />
              ) : (
                <span className={styles.OptionText}>{option.optionImgName}</span>
              )}
            </label>
          </div>
        );
      })}

      {/* NAT */}
      {[5, 6].includes(questionTypeId) && (
        <div className={styles.NATInputHolder}>
          <label className={styles.NATLabel}>
            <input
              type="text"
              className={styles.NATInput}
              value={natValue}
              onChange={(e) => {
                setNatValue(e.target.value);
                onSelectOption(e.target.value);
              }}
            />
          </label>

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
            <button>&larr;</button>
            <button>&rarr;</button>
          </div>

          <div className={styles.backSpaceBtn}>
            <button onClick={() => handleCalculatorInput("BackSpace")}>BackSpace</button>
            <button onClick={() => handleCalculatorInput("ClearAll")}>ClearAll</button>
          </div>
        </div>
      )}
    </div>
  );
}
