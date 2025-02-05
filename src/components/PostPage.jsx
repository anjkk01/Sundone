import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To get post_id from URL
import { Box, Button, Typography, TextField, Avatar, IconButton, Stack } from "@mui/material";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
const PostPage = () => {
  const { post_id } = useParams(); // Extract post_id from URL
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [username,setusername] = useState("");

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/postpage/${post_id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }, // Send post_id dynamically
          credentials: "include", // Ensure cookies are sent
        });
        const data = await res.json();
        setPostData(data.post);
        setIsLiked(data.is_Liked);
        setLikeCount(data.post.like_count);
        setComments(data.rawComments);
        setusername(data.username);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPostData();
  }, [post_id]); // Dependency array ensures this effect runs when post_id changes

  // Handle like toggle
  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      const newlikes = await axios.get(`http://localhost:5000/likeaction/${post_id}`,  
        { withCredentials: true } // Ensures cookies are sent
      );
    } catch (error) {
      console.error("Error handling like action:", error);
    }
  };
  

  // Handle new comment
  const handleComment = async () => {
    if (comment.trim() === "") return; // Ignore empty comments

    const newComment = { text: comment, created_at: new Date(Date.now()).toISOString()};
    setComments([ newComment,...comments]);
    setComment("");

    try {
      const newComment = await axios.post("http://localhost:5000/createcomment", 
        {post_id:post_id,comment:comment} , 
        { withCredentials: true } // Ensures cookies are sent
      );
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Show loading state if data is not fetched yet
  if (!postData) return <Typography>Loading...</Typography>;

  return (
    <Box maxWidth="lg" margin="auto" padding={2} bgcolor="white" borderRadius={2} boxShadow={3}>
      {/* User Info */}
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
        <Avatar src="https://via.placeholder.com/40" alt="User Avatar" />
        <Link 
            to={`/userprofile/${username}`} 
            className="font-semibold text-blue-600 hover:underline"
          >
            {username}
        </Link>
        <span className="ml-2 text-gray-500 text-sm">
            about {formatDistanceToNow(new Date(postData.created_at))} ago
          </span>
      </Stack>

      {/* Post Image */}
      <Box borderRadius={2} overflow="hidden" marginBottom={2}>
        <img src={postData.link} alt="Post Image" width="100%" />
      </Box>

      {/* Like & Comment Section */}
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton onClick={handleLike}>
          {isLiked ? (
            <AiFillHeart color="red" size="24px" />
          ) : (
            <AiOutlineHeart size="24px" />
          )}
        </IconButton>
        <Typography variant="body2" color="textSecondary" fontWeight="bold">
        {likeCount}
        </Typography>
        <IconButton>
          <FaRegComment size="24px" />
        </IconButton>
        <p className="ml-1">{comments.length}</p>
      </Stack>

      {/* Like Count */}

      {/* Comments */}
      <Stack direction="row" spacing={2} alignItems="center" marginTop={2}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleComment}>
          Post
        </Button>
      </Stack>
      <div className="mt-2 mb-2">Comments</div>

      <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 p-3 bg-white rounded-lg shadow-sm">
          {/* Username with Clickable Profile Link */}
          <Link 
            to={`/userprofile/${comment.user}`} 
            className="font-semibold text-blue-600 hover:underline"
          >
            {comment.user}
          </Link>
          
          {/* Time since comment was made */}
          <span className="ml-2 text-gray-500 text-sm">
            {formatDistanceToNow(comment.created_at)} ago
          </span>

          {/* Comment Text */}
          <p className="mt-2 text-gray-800">{comment.text}</p>
        </div>
      ))}
    </div>


      {/* <Stack spacing={2} marginTop={2}>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <Typography key={index} variant="body2" color="textSecondary">
                <div>{comment.user}</div>
                {comment.text}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No comments yet.
          </Typography>
        )}
      </Stack> */}

      {/* Add Comment */}
    </Box>
  );
};

export default PostPage;
