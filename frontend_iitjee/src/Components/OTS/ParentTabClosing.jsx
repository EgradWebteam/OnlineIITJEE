import { useEffect } from 'react';
import { BASE_URL } from "../../ConfigFile/ApiConfigURL.js";
const ResumeTestBroadcastHandler = ({ realStudentId, realTestId }) => {
  useEffect(() => {
    const bc = new BroadcastChannel('test_channel');

    bc.onmessage = async (event) => {
      if (event.data.action === 'resumeAndClose') {
        const { timeLeft } = event.data;

        try {
          const response = await fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${realStudentId}/${realTestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              studentId: realStudentId,
              testCreationTableId: realTestId,
              timeleft: timeLeft || ""
            })
          });

          if (!response.ok) {
            console.error("Failed to update resume status.");
          } else {
            console.log("Resume test API called successfully from child.");
          }

        } catch (err) {
          console.error("API error:", err);
        } finally {
          localStorage.removeItem('OTS_FormattedTime');
          window.close();
          bc.close(); // Close channel after use
        }
      }
    };

    return () => {
      bc.close(); 
    };
  }, [realStudentId, realTestId]);

  return null; 
};

export default ResumeTestBroadcastHandler;
