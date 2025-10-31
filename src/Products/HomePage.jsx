import React, { useState, useEffect } from "react";
import axios from "axios";

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  // New states for S3 bucket functionality
  const [s3Files, setS3Files] = useState([]);
  const [selectedS3Files, setSelectedS3Files] = useState([]);
  const [loadingS3Files, setLoadingS3Files] = useState(false);
  const [processingS3Files, setProcessingS3Files] = useState(false);
  const [s3Results, setS3Results] = useState(null);
  const [showS3Card, setShowS3Card] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError("");
    setResponses([]);
  };

  // Handle drag events
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("audio/")
    );
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setError("");
      setResponses([]);
    } else {
      setError("⚠️ Please drop only audio files.");
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("⚠️ Please select at least one audio file.");
      return;
    }

    setUploading(true);
    setError("");
    setResponses([]);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload-audio-s3/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResponses(res.data.processed_files || []);
    } catch (err) {
      console.error(err);
      setError("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Fetch S3 bucket files
  const fetchS3Files = async () => {
    setLoadingS3Files(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/list-recordings/");
      setS3Files(response.data.files || []);
      setShowS3Card(true);
    } catch (err) {
      console.error("Error fetching S3 files:", err);
      setError("❌ Failed to load S3 files");
    } finally {
      setLoadingS3Files(false);
    }
  };

  // Toggle S3 file selection
  const toggleS3FileSelection = (fileName) => {
    setSelectedS3Files(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(file => file !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  };

  // Select all S3 files
  const selectAllS3Files = () => {
    setSelectedS3Files(s3Files);
  };

  // Clear all S3 file selections
  const clearAllS3Files = () => {
    setSelectedS3Files([]);
  };

  // Process selected S3 files
  const processSelectedS3Files = async () => {
    if (selectedS3Files.length === 0) {
      setError("⚠️ Please select at least one file from S3 bucket");
      return;
    }

    setProcessingS3Files(true);
    setError("");
    setS3Results(null);

    try {
      console.log("Selected files:", selectedS3Files);
      
      const payload = selectedS3Files;

      console.log("Sending direct array payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "http://127.0.0.1:8000/process-selected-recordings/",
        payload,
        {
          headers: { 
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );
      
      console.log("✅ Backend response received:", response.data);
      
      // Just set a simple success flag instead of full results
      setS3Results({ status: "completed" });
      
    } catch (err) {
      console.error("❌ Error processing S3 files:", err);
      
      if (err.response) {
        console.error("📊 Response status:", err.response.status);
        console.error("📊 Response data:", err.response.data);
        
        if (err.response.status === 422) {
          const errorDetail = err.response.data.detail;
          if (Array.isArray(errorDetail)) {
            const errorMessages = errorDetail.map(e => 
              `${e.loc.join('.')}: ${e.msg}`
            ).join(', ');
            setError(`❌ Validation Error: ${errorMessages}`);
          } else {
            setError(`❌ Validation Error: ${JSON.stringify(errorDetail)}`);
          }
        } else {
          setError(`❌ Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.request) {
        setError("❌ No response from server. Please check if backend is running.");
      } else {
        setError(`❌ Request failed: ${err.message}`);
      }
    } finally {
      setProcessingS3Files(false);
    }
  };

  // Format file type badge
  const getFileTypeBadge = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['wav', 'mp3', 'm4a'].includes(extension)) {
      // return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"></span>;
    } else if (extension === 'vox') {
      // return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"></span>;
    }
    // return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"></span>;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
      style={{
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Advanced AI-powered audio analysis with multiple upload options
          </p>
        </div>

        {/* Cards Container - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card - Left Side */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 h-fit">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Upload Files
              </h2>
              <p className="text-gray-600 text-sm">
                Upload audio files from your computer
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 mb-4 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-105"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg
                className={`w-10 h-10 mx-auto mb-2 ${
                  isDragging ? "text-indigo-500" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 text-sm mb-2">
                {isDragging
                  ? "Drop your audio files here"
                  : "Drag & drop your audio files"}
              </p>
              <p className="text-xs text-gray-500 mb-3">or</p>

              <label className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Browse Files
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 animate-fade-in">
                <p className="font-medium text-green-700 text-sm mb-1">Selected Files:</p>
                <ul className="text-xs text-green-800 space-y-1 max-h-20 overflow-auto">
                  {files.map((f, i) => (
                    <li key={i}>• {f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm ${
                uploading || files.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              }`}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing Audio...
                </div>
              ) : (
                "Analyze Audio"
              )}
            </button>

            {/* Responses */}
            {responses.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {responses.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    {res.error ? (
                      <p className="text-red-600 text-xs">
                        ❌ {res.file}: {res.error}
                      </p>
                    ) : (
                      <>
                        <h3 className="font-semibold text-green-800 text-sm mb-1">
                          ✅ {res.call_id}
                        </h3>
                        <p className="text-xs text-gray-700">
                          Duration: {res.call_duration}s
                        </p>
                        {res.transcription?.transcript && (
                          <p className="text-xs text-gray-600 mt-1">
                            {res.transcription.transcript.slice(0, 80)}...
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* S3 Bucket Card - Right Side */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  S3 Bucket
                </h2>
                <p className="text-gray-600 text-sm">
                  Process files directly from cloud storage
                </p>
              </div>
              <button
                onClick={fetchS3Files}
                disabled={loadingS3Files}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md text-sm"
              >
                {loadingS3Files ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Load S3 Files
                  </>
                )}
              </button>
            </div>

            {showS3Card && (
              <div className="space-y-4">
                {/* File Selection Controls */}
                {s3Files.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">
                      {selectedS3Files.length} of {s3Files.length} files selected
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllS3Files}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllS3Files}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* S3 Files List */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {loadingS3Files ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs">Loading S3 files...</p>
                    </div>
                  ) : s3Files.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs">No files found in S3 bucket</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {s3Files.map((file, index) => (
                        <div
                          key={index}
                          className={`p-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedS3Files.includes(file) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => toggleS3FileSelection(file)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedS3Files.includes(file)}
                              onChange={() => toggleS3FileSelection(file)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                            />
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{file}</span>
                            </div>
                          </div>
                          {getFileTypeBadge(file)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Process Button */}
                {s3Files.length > 0 && (
                  <button
                    onClick={processSelectedS3Files}
                    disabled={processingS3Files || selectedS3Files.length === 0}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm ${
                      processingS3Files || selectedS3Files.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    }`}
                  >
                    {processingS3Files ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing {selectedS3Files.length} Files...
                      </div>
                    ) : (
                      `Process Selected Files (${selectedS3Files.length})`
                    )}
                  </button>
                )}

                {/* S3 Processing Results - SIMPLIFIED: Only shows "Processing Complete" */}
                {s3Results && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <h3 className="font-semibold text-green-800 text-sm mb-1 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Processing Complete
                    </h3>
                    <p className="text-xs text-green-600">
                      Your files have been processed successfully.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message - Centered below both cards */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-shake text-center max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;