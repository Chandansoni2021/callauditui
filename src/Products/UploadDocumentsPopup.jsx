import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaFileAlt, FaTimes, FaUsers, FaCheck } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router-dom";
 
const UploadDocumentsPopup = () => {
  const [file, setFile] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setFile(selectedFile);
    }
  };
 
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
 
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      alert("Please drop a PDF file only.");
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
      const response = await fetch("http://65.0.95.155:8000/upload/", {
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
 
  const teamOptions = [
    { value: "all", label: "All Teams", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { value: "sales", label: "Sales Team", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
    { value: "dynamic", label: "Dynamic Teams", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { value: "finance", label: "Finance Team", color: "bg-gradient-to-r from-orange-500 to-red-500" }
  ];
 
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      {!success ? (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              onClick={handleClose}
            >
              <FaTimes className="w-6 h-6" />
            </button>
           
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaCloudUploadAlt className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upload Documents</h2>
                <p className="text-white/80 text-sm">Add call-related PDFs for auditing</p>
              </div>
            </div>
 
            {/* Team Selection */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {teamOptions.map((team) => (
                <button
                  key={team.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTeam === team.value
                      ? `${team.color} text-white shadow-lg transform scale-105`
                      : "bg-white/20 text-white/90 hover:bg-white/30"
                  }`}
                  onClick={() => setSelectedTeam(team.value)}
                >
                  <FaUsers className="w-3 h-3" />
                  {team.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Content */}
          <div className="p-8">
            {/* Explanation Text */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Upload your call-related documents in <span className="font-semibold text-blue-600">PDF format</span> for auditing sales and customer interactions.
              This helps ensure professional handling of customer queries with accurate responses.
            </p>
 
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6 ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                  : file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaCloudUploadAlt className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {isDragging ? "Drop your PDF here" : "Upload your document"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Drag & drop your PDF file or click to browse
                  </p>
                 
                  <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium">
                    <FaCloudUploadAlt className="w-4 h-4" />
                    Choose PDF File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                    <FaFileAlt className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <FaFileAlt className="w-5 h-5 text-blue-500" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => setFile(null)}
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
 
            {/* Submit Button */}
            {file && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading Document...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FaCheck className="w-4 h-4" />
                    Process Document
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center border border-white/20">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <FaCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
            <p className="text-white/90">Your document has been processed</p>
          </div>
         
          <div className="p-8">
            <DotLottieReact
              src="https://lottie.host/9dbd8303-3f0d-419b-84cf-674b2fcbbf4b/4eC3xWcGB2.lottie"
              loop
              autoplay
              className="w-48 h-48 mx-auto -mt-4"
            />
            <p className="text-gray-600 mb-6">
              Redirecting to dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default UploadDocumentsPopup;
 