import React, { useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setResponse(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("⚠️ Please select a file to upload.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://ec2-34-239-0-254.compute-1.amazonaws.com:8000/upload-audio-s3/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1581091012184-7c7096af0eaa')",
      }}
    >
      <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🎧 Upload Audio File
        </h1>

        <div className="space-y-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 focus:outline-indigo-500"
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-2 px-4 rounded-md font-semibold transition ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600 font-medium">
            {error}
          </div>
        )}

        {response && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md text-sm">
            <p><strong>✅ Upload Success</strong></p>
            <p><strong>Call ID:</strong> {response.call_id}</p>
            <p><strong>Duration:</strong> {response.call_duration} sec</p>
            <p className="truncate">
              <strong>S3 URL:</strong>{" "}
              <a
                href={response.s3_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {response.s3_url}
              </a>
            </p>
            <p className="mt-2">
              <strong>Transcript:</strong>{" "}
              {response.transcription?.transcript?.slice(0, 150)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
