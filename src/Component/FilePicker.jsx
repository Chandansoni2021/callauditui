import React, { useState } from "react";
import { ReactOneDriveFilePicker } from "react-onedrive-filepicker";
// import cloud from "../Assest/cloud.png";
 
 
const KEY = "7cfac74e-8cc0-493e-965b-4d0c0723599e";
 
const FilePicker = ({ onFilePick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const handleSuccess = async (result) => {
    setIsLoading(false);
    setError(null);
 
    if (result?.value?.length > 0) {
      result.value.forEach(async (file) => {
        try {
          const fileName = file.name || "downloaded_file";
          const downloadUrl = file["@microsoft.graph.downloadUrl"];
          console.log("Download URL:", downloadUrl);
 
          if (!downloadUrl) {
            throw new Error(`No download URL found for file: ${fileName}`);
          }
 
          // Pass an object containing the URL and file name to the parent callback.
          if (onFilePick) {
            onFilePick({ url: downloadUrl, name: fileName });
          }
        } catch (err) {
          console.error("Error processing file:", err);
          setError(`Failed to process file: ${file.name || "unknown"}`);
        }
      });
    }
  };
 
  const handleError = () => {
    setIsLoading(false);
    setError("Failed to fetch files. Please try again.");
  };
 
  const handleClick = () => {
    setIsLoading(true);
    setError(null);
  };
 
  return (
    <div className="file-picker-container">
            {/* <h1 className="text-3xl font-bold mb-6">File Manager</h1> */}
      <div className="mainDiv">
        <ReactOneDriveFilePicker
          clientID={KEY}
          action="download" // Retrieve download URLs
          multiSelect={true}
          onSuccess={handleSuccess}
          onError={handleError}
        >
          <button onClick={handleClick} className="picker-button">
            {/* <img src={cloud} alt="OneDrive Logo" className="cloud-icon" /> */}
            {/* <p className="button-text">Upload Using OneDrive</p> */}
            {isLoading && <p className="loading-text"></p>}
          </button>
        </ReactOneDriveFilePicker>
      </div>
 
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
 
export default FilePicker;
 
 