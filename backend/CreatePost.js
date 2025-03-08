require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const {feedCache} = require("./CacheFeed");
const prisma = new PrismaClient();
const {getFollowers} = require("./FolloweeList");
// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for Temporary File Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temporary directory for storing files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// File Upload Controller
const uploadFile = async (req, res) => {
  try {
    // Ensure Multer has processed the file before proceeding
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract user_id from JWT middleware
    let user_id;
    if (req.user?.id) {
      user_id = req.user.id; // Extract from JWT middleware
    } else if (req.body.user_id) {
      user_id = parseInt(req.body.user_id, 10); // Extract from form-data and convert to number
    }
    // Validate user_id
    if (!user_id || isNaN(user_id)) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No valid user ID found' });
    }

    // Upload File to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Optional: Store files in a specific Cloudinary folder
    });

    // Delete the locally stored file after successful Cloudinary upload
    fs.unlinkSync(req.file.path);

    // Save Post to Database
    const newPost = await prisma.posts_table.create({
      data: {
        user_id: user_id, // Ensure it's an integer if needed
        link: cloudinaryResponse.secure_url, // Store Cloudinary URL
        created_at: new Date(), // Ensure timestamp is added
      },
    });
    const follower_ids = await getFollowers(user_id);
    for (const followerId of follower_ids) {
      feedCache.delete(followerId);
    }
    // Success Response
    res.status(200).json({
      success: true,
      message: 'File uploaded and post saved successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file or save post',
      error: error.message,
    });
  }
};

// Export Middleware + Controller as a Middleware Array
module.exports = [upload.single('file'), uploadFile];
