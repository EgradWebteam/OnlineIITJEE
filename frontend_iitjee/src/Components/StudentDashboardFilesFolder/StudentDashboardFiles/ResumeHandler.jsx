import { useEffect } from "react";
import { BASE_URL } from "../../../ConfigFile/ApiConfigURL";

// This is the centralized listener for the broadcast message
const ResumeTestHandler = ({ studentId, testCreationTableId }) => {
  useEffect(() => {
    // Create a new BroadcastChannel to listen for "resume_test" messages
    const channel = new BroadcastChannel('test_monitor_channel');

    // Define the handler for the message
    const handleMessage = async (event) => {
      const { action } = event.data;
      if (action === "resume_test") {
        const timeLeft = localStorage.getItem("OTS_FormattedTime") || "00:00:00";

        try {
          // Send the PUT request to the server to update the resume test status
          const response = await fetch(`${BASE_URL}/ResumeTest/updateResumeTest/${studentId}/${testCreationTableId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, testCreationTableId, timeleft: timeLeft })
          });

          if (response.ok) {
            console.log("Resume Test API Called");
          } else {
            console.error("Failed to call Resume Test API");
          }
        } catch (error) {
          console.error("Failed to update resume test:", error);
        } finally {
          // Close the window after the test is resumed
          window.close();
        }
      }
    };

    // Add the event listener for messages on the channel
    channel.addEventListener("message", handleMessage);

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close(); // Close the channel to prevent memory leaks
    };
  }, [studentId, testCreationTableId]);

  // This component doesn't render anything
  return null;
};

export default ResumeTestHandler;
