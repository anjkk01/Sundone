import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Box,
  Stack,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";

// Axios Interceptor to Use Credentials
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MediaDisplay = ({ mediaUrl }) => {
  if (!mediaUrl) return null;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  return (
    <CardMedia
      component={isVideo ? "video" : "img"}
      src={mediaUrl}
      alt="Post Media"
      controls={isVideo}
      sx={{ height: 280, borderRadius: 2 }}
    />
  );
};

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Get logged-in user from Redux store
  const loggedInUser = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${username}`,
          { withCredentials: true }
        );
        setUser(response.data);
        setIsFollowing(response.data.IsFriend);
      } catch (err) {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [username, loggedInUser]);

  const handleFollowToggle = async () => {
    if (!user) return;
  
    const newFollowState = !isFollowing;
    const followerChange = newFollowState ? 1 : -1;
  
    // Optimistically update UI once
    setIsFollowing(newFollowState);
    setUser((prevUser) => ({
      ...prevUser,
      followers: prevUser.followers + followerChange,
    }));
  
    try {
      await axios.post(
        `http://localhost:5000/togglefollow/`,
        { Followerusername: username },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error updating follow status:", err);
  
      // Revert UI only if API request fails
      setIsFollowing((prev) => !prev);
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers - followerChange,
      }));
    }
  };
  

  if (loading)
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );

  if (error)
    return (
      <Typography variant="h6" color="error" textAlign="center" mt={4}>
        {error}
      </Typography>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Profile Header */}
      <Box display="flex" alignItems="center" gap={3} mb={4}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
          {user.username[0].toUpperCase()}
        </Avatar>
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.description || "No description available"}
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mt={1}>
            <Typography variant="body2">
              <strong>{user.followers}</strong> Followers
            </Typography>
            <Typography variant="body2">
              <strong>{user.followed_by}</strong> Following
            </Typography>
            {/* Conditionally Render Follow Button */}
            {loggedInUser && loggedInUser.username !== username && (
            <Button
  variant={isFollowing ? "outlined" : "contained"}
  color={isFollowing ? "secondary" : "primary"}
  onClick={handleFollowToggle}
>
  {isFollowing ? "Following" : "Follow"}
          </Button>

            )}
          </Box>
        </Stack>
      </Box>

      {/* Posts Grid */}
      <Grid container spacing={3}>
        {user.posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card
              sx={{ borderRadius: 3, boxShadow: 3, cursor: "pointer" }}
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <MediaDisplay mediaUrl={post.link} />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {formatDistanceToNow(new Date(post.created_at))} ago
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UserProfile;
