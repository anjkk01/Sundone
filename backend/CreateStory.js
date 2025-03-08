require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { storyExpirationQueue } = require('./BullQueue');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Create Story Controller
const CreateStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Extract user_id from JWT middleware
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No valid user ID found' });
    }

    // Upload File to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
    });

    // Delete the locally stored file after successful Cloudinary upload
    fs.unlinkSync(req.file.path);

    // Save Story to Database
    const newStory = await prisma.stories.create({
      data: {
        user_id: user_id,
        url: cloudinaryResponse.secure_url,
        timestamp: new Date(),
        expires_at: new Date(Date.now() + 24*60*60*1000), // 24 hours from now
      },
    });

    // Schedule Story Expiration
    const storyId = newStory.story_id;

    await storyExpirationQueue.add('expire-story', { storyId }, {
      delay: 24*60*60*1000, // 24 hours delay
    });

    // Success Response
    res.status(200).json({
      success: true,
      message: 'Story uploaded and scheduled for expiration',
      story: newStory,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload story or schedule expiration',
      error: error.message,
    });
  }
};

// Export Middleware + Controller as a Middleware Array
module.exports = [upload.single('file'), CreateStory];