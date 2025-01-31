import React, { useState } from "react";
import axios from "axios";

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Validate file type (image or video)
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType !== "image" && fileType !== "video") {
        setError("Only images and videos are allowed.");
        setFile(null); // Clear the file state
        return;
      }
      // Validate file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB.");
        setFile(null); // Clear the file state
        return;
      }
      setError("");
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      alert("File uploaded successfully.");
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("File upload failed.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-semibold text-center mb-4">Upload Media</h1>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block w-full text-gray-700 border border-gray-300 rounded-md mb-4 p-2"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Upload File
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
