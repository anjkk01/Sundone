// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const setupSocket = require('./socket'); // Import our Socket.io setup module

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const uploadFile = require("./CreatePost");
const { signup } = require("./Signup");
const { signin } = require("./Signin");
const { getFollowers } = require("./FolloweeList");
const { getFeed } = require("./getFeed");
const { searchuser } = require("./SearchUser");
const { profile } = require("./Profile");
const { CreateCommentAction } = require("./CreateCommentAction");
const { LikeAction } = require("./LikeAction");
const verifyJWT = require("./MiddlewareJWT");
const { postpage } = require("./postpage");
const { getuser } = require("./getuser");
const { ToggleFollow } = require("./ToggleFollow");
const CreateStory = require("./CreateStory");
const { Stories, ViewStoryAction } = require('./ViewStory');
const rateLimiter = require("./RateLimiter");
const { addToChat, getChatIds } = require('./ChatPage');

app.get("/getuser",rateLimiter, verifyJWT, getuser);
app.post("/upload",rateLimiter, verifyJWT, uploadFile);
app.post("/createstory",rateLimiter, verifyJWT, CreateStory);
app.get("/postpage/:post_id",rateLimiter, verifyJWT, postpage);
app.post("/signup",rateLimiter, signup);
app.post("/signin",rateLimiter, signin);
app.post("/createcomment",rateLimiter, verifyJWT, CreateCommentAction);
app.get("/likeaction/:post_id",rateLimiter, verifyJWT, LikeAction);
app.post("/searchuser",rateLimiter, searchuser);
app.get("/FolloweeList",rateLimiter, verifyJWT, getFollowers);
app.get('/feed',rateLimiter, verifyJWT, getFeed);
app.get('/stories', rateLimiter,verifyJWT, Stories);
app.get('/getchatids',rateLimiter,verifyJWT,getChatIds);
app.get('/profile/:username',rateLimiter, verifyJWT, profile);
app.post('/togglefollow',rateLimiter, verifyJWT, ToggleFollow);
app.post('/watchstory',rateLimiter, verifyJWT, ViewStoryAction);
app.post('/addchat',rateLimiter,verifyJWT,addToChat);
app.post('/logout', (req, res) => {
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: true });
  res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: true });
  return res.status(200).json({ message: "Logged out successfully" });
});

const server = http.createServer(app);

const io = setupSocket(server);

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');

  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = io;
