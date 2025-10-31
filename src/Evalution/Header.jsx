// import { useState, useEffect } from "react";
 
// const Header = ({ callId, accessToken }) => {  // <-- Accept accessToken as prop
//   const [headerData, setHeaderData] = useState({
//     consultant: "Loading...",
//     callTime: new Date().toISOString(),
//     positive_score: 0,
//     neutral_score: 0,
//     negative_score: 0,
//   });
 
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
 
//   useEffect(() => {
//     const fetchHeaderDetails = async () => {
//       if (!callId) {
//         setError("No call ID provided.");
//         setLoading(false);
//         return;
//       }
 
//       try {
//         const response = await fetch("http://127.0.0.1:8000/header_fetch_details/", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             "Authorization": `Bearer ${accessToken}` // <-- Added here
//           },
//           body: `call_id=${encodeURIComponent(callId)}`,
//         });
 
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.detail ?? `HTTP error! Status: ${response.status}`);
//         }
 
//         const data = await response.json();
 
//         setHeaderData({
//   consultant: data.agent ?? "N/A",               // ✅ match backend response key
//   callTime: data.callTime ?? new Date().toISOString(), // ✅ fix key
//   positive_score: data.positive_score ?? 0,      // ✅ match exact key
//   neutral_score: data.neutral_score ?? 0,
//   negative_score: data.negative_score ?? 0,
// });


 
//         setError(null);
//       } catch (err) {
//         setError(err.message || "An unexpected error occurred.");
//         setHeaderData({
//           consultant: "Error",
//           callTime: new Date().toISOString(),
//           positive_score: 0,
//           neutral_score: 0,
//           negative_score: 0,
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
 
//     fetchHeaderDetails();
//   }, [callId, accessToken]); // re-run when accessToken changes
 
//   // rest of the component unchanged...
 
//   // Format call time and date using locale-specific settings
//   const formattedCallTime = new Date(headerData.callTime).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
 
//   const formattedCallDate = new Date(headerData.callTime).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
 
//   if (loading) {
//     return (
//       <header className="bg-white shadow-lg p-5 flex items-center justify-between rounded-xl w-[78%] mt-24 ml-[17rem] mb-8">
//         <div className="w-full text-center">Loading header data...</div>
//       </header>
//     );
//   }
 
//   if (error) {
//     return (
//       <header className="bg-white shadow-lg p-5 flex items-center justify-between rounded-xl w-[78%] mt-24 ml-[17rem] mb-8">
//         <div className="w-full text-center text-red-500">Error: {error}</div>
//       </header>
//     );
//   }
 
//   return (
//     <header className="bg-white shadow-lg p-5 flex items-center justify-between rounded-xl w-[78%] mt-24 ml-[17rem] mb-8">
//       {/* Left Section - Displays consultant name */}
//       <div className="flex-1 flex flex-col items-center space-y-1">
//         <div className="text-gray-700 font-bold text-sm">
//           Consultant - <span className="font-normal">{headerData.consultant}</span>
//         </div>
//       </div>
 
//       {/* Separator */}
//       <div className="w-1 h-12 bg-gray-300 opacity-50 rounded-full mx-5"></div>
 
//       {/* Center Section - Displays formatted call date and time */}
//       <div className="flex-1 flex flex-col items-center text-gray-700 text-sm">
//         <span>{formattedCallDate}</span>
//         <div className="font-normal">{formattedCallTime}</div>
//       </div>
 
//       {/* Separator */}
//       <div className="w-1 h-12 bg-gray-300 opacity-50 rounded-full mx-5"></div>
 
//       {/* Right Section - Displays overall sentiment scores */}
//       <div className="flex-1 flex items-center justify-center gap-3">
//         <span className="text-gray-700 font-semibold text-sm">Overall Sentiment -</span>
//         <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg shadow">
//           {headerData.positive_score.toFixed(2)}
//         </div>
//         <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg shadow">
//           {headerData.neutral_score.toFixed(2)}
//         </div>
//         <div className="px-3 py-1 bg-red-100 text-red-800 rounded-lg shadow">
//           {headerData.negative_score.toFixed(2)}
//         </div>
//       </div>
//     </header>
//   );
// };
 
// export default Header;
 