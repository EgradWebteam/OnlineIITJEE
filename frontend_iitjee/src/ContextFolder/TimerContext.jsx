import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const TimerContext = createContext();
export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ testData, children }) => {
  const [timeLeft, setTimeLeft] = useState(null); // null until testData is ready
  const intervalRef = useRef(null);

  const totalDurationInSeconds = (testData?.TestDuration || 0) * 60;

  useEffect(() => {
    if (!testData || !testData.TestDuration) return;

    setTimeLeft(totalDurationInSeconds);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [testData]); // <-- Runs when testData is ready

  const timeSpent = timeLeft !== null ? totalDurationInSeconds - timeLeft : 0;

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  const remainingTime = totalDurationInSeconds - timeSpent;
  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        timeSpent,
        formattedTime: timeLeft !== null ? formatTime(timeLeft) : "Loading...",
        remainingTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
