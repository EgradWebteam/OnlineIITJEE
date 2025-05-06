import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const TimerContext = createContext();
export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ testData, resumeTime, children }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  const parseTimeToSeconds = (time) => {
    if (typeof time === "number") return time;
    if (typeof time === "string") {
      const [h, m, s] = time.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    }
    return 0;
  };

  const totalDurationInSeconds = parseTimeToSeconds( (testData?.TestDuration || 0) * 60);
  const resumeTimeInSeconds = resumeTime;
  const initialTimeLeft = parseTimeToSeconds(resumeTime ? resumeTimeInSeconds : totalDurationInSeconds  );;
console.log(resumeTimeInSeconds, initialTimeLeft )
  useEffect(() => {
    if (!testData || !testData.TestDuration) return;

    setTimeLeft(initialTimeLeft);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [testData, resumeTime]);

  const timeSpent = timeLeft !== null ? totalDurationInSeconds - timeLeft : 0;
  // useEffect(() => {
  //   if (timeLeft !== null) {
  //     const event = new CustomEvent("timerUpdate", {
  //       detail: {
  //         timeLeft: timeLeft,
  //         timeSpent: totalDurationInSeconds - timeLeft,
  //       },
  //     });
  //     window.dispatchEvent(event);
  //   }
  // }, [timeLeft]);
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        timeSpent,
        formattedTime: timeLeft !== null ? formatTime(timeLeft) : "Loading...",
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
