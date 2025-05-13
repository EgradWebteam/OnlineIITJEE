import { useEffect } from 'react';
import { BASE_URL } from "../../ConfigFile/ApiConfigURL.js";
const ResumeTestBroadcastHandler = ({ realStudentId, realTestId }) => {
  useEffect(() => {
    const bc = new BroadcastChannel('test_channel');

    bc.onmessage = async (event) => {
      if (event.data.action === 'resumeAndClose') {
        const { timeLeft, courseCreationId } = event.data;

        try {
          const response = await fetch(`${BASE_URL}/OTSExamSummary/updateTestStatus/${realStudentId}/${realTestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              test_status: "resumed",
              connection_status: "disconnected",
              timeleft: timeLeft || "",
              courseCreationId :courseCreationId 
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
