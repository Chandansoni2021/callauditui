import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaTimes } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router-dom";

const UploadDocumentsPopup = () => {
  const [file, setFile] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
  
    if (selectedFile) {
      // Check if the file type is PDF
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setFile(selectedFile);
    }
  };
  

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("folder_name", selectedTeam);
    formData.append("file", file);

    try {
      const response = await fetch("http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);
        setSuccess(true);
      } else {
        console.error("Upload failed:", response.statusText);
        alert("File upload failed!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [success, navigate]);

  const handleClose = () => {
    setFile(null);
    navigate("/dashboard");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] z-50">
      {!success ? (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl h-[24rem] relative">
          {/* Close Button */}
          <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800" onClick={handleClose}>
            <FaTimes className="w-6 h-6" />
          </button>

          {/* Dropdown - Team Selection */}
          <div className="absolute top-4 left-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All</option>
              <option value="sales">Sales Team</option>
              <option value="dynamic">Dynamic Teams</option>
              <option value="finance">Finance Team</option>
            </select>
          </div>

          {/* Explanation Text */}
          <p className="text-gray-600 text-sm mt-12 text-center px-4">
            Upload your call-related documents in PDF format for auditing sales and customer interactions.
            This helps us ensure that customer queries are handled professionally and responses are accurate.
          </p>

          {/* Upload Section */}
          <div className="flex flex-col items-center mt-4">
            {!file ? (
              <label className="cursor-pointer flex flex-row justify-center items-center gap-4 bg-blue-500 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-blue-600 transition duration-300">
                <FaCloudUploadAlt className="w-8 h-8" />
                <span className="text-lg font-semibold">Upload Data</span>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <>
                <div className="flex items-center bg-gray-100 px-6 py-4 rounded-lg w-full justify-between shadow-md">
                  <div className="flex items-center">
                    <FaFileAlt className="w-6 h-6 text-blue-500 mr-3" />
                    <span className="text-gray-700 font-medium">{file.name}</span>
                  </div>
                  <button
                    className="cursor-pointer text-red-500 hover:text-red-700"
                    onClick={() => setFile(null)}
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
                <button
                  className="cursor-pointer mt-6 bg-blue-500 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
                  onClick={handleSubmit}
                >
                  {loading ? "Uploading..." : "Submit"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md h-auto text-center flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Thank You!</h2>
          <p className="text-gray-700 mb-4">Your document has been successfully uploaded.</p>
          <DotLottieReact
            src="https://lottie.host/9dbd8303-3f0d-419b-84cf-674b2fcbbf4b/4eC3xWcGB2.lottie"
            loop
            autoplay
          />
        </div>
      )}
    </div>
  );
};

export default UploadDocumentsPopup;
