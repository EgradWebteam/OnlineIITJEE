// import { useEffect } from "react";

// const DisableKeysAndMouseInteractions = (excludeRef) => {
//   useEffect(() => {
//     const handleContextMenu = (e) => {
//       e.preventDefault();
//     };

//     // const handleKeyDown = (event) => {
//     //   event.preventDefault(); // Optionally, you can add specific logic here to disable specific keys.
//     //   event.stopPropagation();
//     // };
//     // const handleKeyDown = (event) => {
//     //     // Only allow keyboard events inside the excludeRef element (password field)
//     //     if (excludeRef.current && !excludeRef.current.contains(event.target)) {
//     //       event.preventDefault(); // Disable keyboard input for the whole page
//     //     }
//     //   };
//     const handleKeyDown = (event) => {
//       // Check if excludeRef is defined and has current property
//       if (excludeRef && excludeRef.current) {
//         // Allow keyboard input only in the excluded reference (if present)
//         if (!excludeRef.current.contains(event.target)) {
//           event.preventDefault(); // Disable keyboard input for the whole page
//         }
//       } else {
//         // If there's no excludeRef, prevent all keyboard input
//         event.preventDefault();
//       }
//     };

//     // Disable right-click context menu
//     document.addEventListener("contextmenu", handleContextMenu);

//     // Disable all keyboard interactions
//     document.addEventListener("keydown", handleKeyDown);

//     // Cleanup event listeners when the component unmounts
//     return () => {
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [excludeRef]); // Empty dependency array ensures that this effect runs only once
// };

// export default DisableKeysAndMouseInteractions;
