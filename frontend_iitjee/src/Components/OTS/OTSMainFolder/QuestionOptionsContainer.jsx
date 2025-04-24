import React, {  useEffect, useRef } from 'react';
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
    const inputElement = inputRef.current;
    if (!inputElement) return;
  
    inputElement.focus(); // Ensure focus
  
    let currentValue = natValue;
    let cursorPos = inputElement.selectionStart;
  
    if (val === "ClearAll") {
      setNatValue("");
      onSelectOption("");
      return;
    }
  
    if (val === "BackSpace") {
      if (cursorPos > 0) {
        currentValue = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
        setNatValue(currentValue);
        onSelectOption(currentValue);
  
        setTimeout(() => {
          inputElement.setSelectionRange(cursorPos - 1, cursorPos - 1);
        }, 0);
      }
      return;
    }
  
    if (val === "-") {
      // Only allow "-" at beginning
      if (!currentValue.includes("-") && cursorPos === 0) {
        currentValue = "-" + currentValue;
        setNatValue(currentValue);
        onSelectOption(currentValue);
        setTimeout(() => {
          inputElement.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }, 0);
      }
      return;
    }
  
    if (val === ".") {
      const numericPart = currentValue.startsWith("-") ? currentValue.slice(1) : currentValue;
      if (numericPart.includes(".")) return;
  
      // Prevent inserting dot before minus (e.g., .-29)
      if (currentValue.startsWith("-") && cursorPos <= 0) return;
  
      // Also block dot if it's inserted before minus
      const minusIndex = currentValue.indexOf("-");
      if (minusIndex !== -1 && cursorPos <= minusIndex) return;
  
      // Handle special cases
      if (currentValue === "" || currentValue === "-") {
        val = "0.";
      }
    }

    // Insert at cursor position
    const updatedValue = currentValue.slice(0, cursorPos) + val + currentValue.slice(cursorPos);
    const newCursorPos = cursorPos + val.length;
  
    setNatValue(updatedValue);
    onSelectOption(updatedValue);
  
    setTimeout(() => {
      inputElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const inputRef = useRef(null); // Ref to the NAT input field

  // Function to move the cursor position
  const handleArrowInput = (direction) => {
    const inputElement = inputRef.current;
    if (!inputElement) return;
  
    inputElement.focus();  // Make sure it's focused
  
    const currentPosition = inputElement.selectionStart;
  
    if (direction === "left" && currentPosition > 0) {
      inputElement.setSelectionRange(currentPosition - 1, currentPosition - 1);
    } else if (direction === "right" && currentPosition < inputElement.value.length) {
      inputElement.setSelectionRange(currentPosition + 1, currentPosition + 1);
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
                onChange={(e) =>
                  onSelectOption({
                    option_id: option.option_id,
                    option_index: option.option_index,
                  })
                }
                
              />
              <span className={styles.OptionIndex}>{getLabel(index, option.option_index)}</span>
              {/* {isImage ? ( */}
                <img src={option.optionImgName} alt={`Option ${option.option_index}`} className={styles.OptionImage} />
              {/* ) : (
                <span className={styles.OptionText}>{option.optionImgName}</span>
              )} */}
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
              {/* {isImage ? ( */}
                <img src={option.optionImgName} alt={`Option ${option.option_index}`} className={styles.OptionImage} />
              {/* ) : (
                <span className={styles.OptionText}>{option.optionImgName}</span>
              )} */}
            </label>
          </div>
        );
      })}

      {/* NAT */}
      {[5, 6].includes(questionTypeId) && (
        <div className={styles.NATInputHolder}>
          <label className={styles.NATLabel}>
            <input
              ref={inputRef} // Attach the ref to the input
              type="text"
              className={styles.NATInput}
              value={natValue}
              onChange={(e) => {
                setNatValue(e.target.value);
                onSelectOption(e.target.value);
              }}
            />
          </label>
          <div className={styles.backSpaceBtn}>
             <button onClick={() => handleCalculatorInput("BackSpace")}>BackSpace</button>
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
           <button onClick={() => handleArrowInput('left')}>&larr;</button>
           <button onClick={() => handleArrowInput('right')}>&rarr;</button>
          </div>

          <div className={styles.backSpaceBtn}>
            <button onClick={() => handleCalculatorInput("ClearAll")}>ClearAll</button>
          </div>
        </div>
      )}
    </div>
  );
}
