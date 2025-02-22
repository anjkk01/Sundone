import React, { useState } from "react";
import axios from "axios";
import { Button, Card, CardContent, Typography, Box, CircularProgress, Snackbar, Alert, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { CloudUpload, Image, VideoLibrary } from "@mui/icons-material";

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadType, setUploadType] = useState("post");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType !== "image" && fileType !== "video") {
        setError("Only images and videos are allowed.");
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB.");
        setFile(null);
        return;
      }

      setError("");
      setFile(selectedFile);

      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUploadTypeChange = (event, newType) => {
    if (newType !== null) {
      setUploadType(newType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = uploadType === "post" ? "http://localhost:5000/upload" : "http://localhost:5000/createstory";

    try {
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setSuccessMessage(`File uploaded successfully as a ${uploadType}!`);
      console.log(response.data);
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error uploading file", error);
      setError("File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex justify-center items-center h-screen bg-gray-100">
      <Card sx={{ width: 400, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Upload Media
          </Typography>

          {/* Upload Type Selection */}
          <ToggleButtonGroup
            value={uploadType}
            exclusive
            onChange={handleUploadTypeChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="post">Upload as Post</ToggleButton>
            <ToggleButton value="story">Upload as Story</ToggleButton>
          </ToggleButtonGroup>

          {/* File Upload Input */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              fullWidth
              component="span"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ my: 2 }}
            >
              Choose File
            </Button>
          </label>

          {/* File Preview */}
          {preview && (
            <Box className="flex justify-center mb-4">
              {file.type.startsWith("image") ? (
                <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded" />
              ) : (
                <video src={preview} className="w-32 h-32 rounded" controls />
              )}
            </Box>
          )}

          {error && (
            <Typography color="error" fontSize="14px" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Upload Button */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={file ? (file.type.startsWith("image") ? <Image /> : <VideoLibrary />) : null}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : `Upload ${uploadType}`}
          </Button>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage("")}>        
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePost;
