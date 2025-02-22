import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Button, Typography, TextField, Avatar, IconButton, Stack, CircularProgress } from "@mui/material";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const PostPage = () => {
  const { post_id } = useParams();
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch post data when the component mounts
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/postpage/${post_id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        setPostData(data.post);
        setIsLiked(data.is_Liked);
        setLikeCount(data.post?.like_count || 0);
        setComments(data.rawComments || []);
        setUsername(data.username || "Unknown User");
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [post_id]);

  // Handle like toggle
  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      await axios.get(`http://localhost:5000/likeaction/${post_id}`, { withCredentials: true });
    } catch (error) {
      console.error("Error handling like action:", error);
    }
  };

  // Handle new comment
  const handleComment = async () => {
    if (comment.trim() === "") return;
    try {
      const newComment = await axios.post(
        "http://localhost:5000/createcomment",
        { post_id, comment },
        { withCredentials: true }
      );

      const newCommentData = {
        text: comment,
        created_at: new Date().toISOString(),
        id: newComment.data?.id || Date.now(),
        user: newComment.data?.username || "Unknown User",
      };

      setComments([newCommentData, ...comments]);
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return <Typography align="center"><CircularProgress /></Typography>;
  }

  // Show error if post data is missing
  if (!postData) {
    return <Typography align="center">Post not found.</Typography>;
  }

  return (
    <Box maxWidth="lg" margin="auto" padding={2} bgcolor="white" borderRadius={2} boxShadow={3}>
      {/* User Info */}
      <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
        <Avatar src="https://via.placeholder.com/40" alt="User Avatar" />
        <Link to={`/userprofile/${username}`} className="font-semibold text-blue-600 hover:underline">
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
          {isLiked ? <AiFillHeart color="red" size="24px" /> : <AiOutlineHeart size="24px" />}
        </IconButton>
        <Typography variant="body2" color="textSecondary" fontWeight="bold">
          {likeCount}
        </Typography>
        <IconButton>
          <FaRegComment size="24px" />
        </IconButton>
        <Typography variant="body2">{comments.length}</Typography>
      </Stack>

      {/* Add Comment Section */}
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

      {/* Comments Section */}
      <Typography variant="h6" marginTop={2}>Comments</Typography>
      <Box padding={2} bgcolor="gray.100" borderRadius={2}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.id} marginBottom={2} padding={2} bgcolor="white" borderRadius={2} boxShadow={1}>
              <Link to={`/userprofile/${comment.user}`} className="font-semibold text-blue-600 hover:underline">
                {comment.user}
              </Link>
              <Typography variant="body2" color="textSecondary">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </Typography>
              <Typography marginTop={1}>{comment.text}</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No comments yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PostPage;
