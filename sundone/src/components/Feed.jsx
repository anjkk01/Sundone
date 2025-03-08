import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconButton } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Media display component (image/video)
const MediaDisplay = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  return (
    <div className="w-full h-80 max-w-md">
      {isVideo ? (
        <video controls className="w-full h-full rounded-lg object-cover shadow-md">
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={mediaUrl}
          alt="Media"
          className="w-full h-full rounded-lg object-cover shadow-md"
        />
      )}
    </div>
  );
};

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For redirecting

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/feed", {
          withCredentials: true,
        });
        setPosts(response.data.feed || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId, liked) => {
    try {
      // API request to like/unlike the post
      const post_id = postId;
      const response = await axios.get(
        `http://localhost:5000/likeaction/${post_id}`,
        { withCredentials: true }
      );

      // If the response is successful, toggle the liked status
      const updatedPosts = posts.map((post) =>
        post.postId === postId // Use the correct key for matching
          ? {
              ...post,
              liked: !liked,  // Toggle the like state
              likeCount: liked ? post.likeCount - 1 : post.likeCount + 1, // Update the like count
            }
          : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleRedirect = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {posts.length === 0 ? (
        <div className="text-center text-xl font-semibold text-gray-600">No posts available.</div>
      ) : (
        posts.map((post) => (
          <div
            key={post.postId} // Ensure you're using the correct key here
            className="bg-white p-6 rounded-lg shadow-lg mb-6 flex flex-col border border-gray-200"
          >
            <div className="flex items-center mb-3">
              <span className="font-semibold text-lg text-gray-800 mr-2">{post.postUsername}</span>
              <span className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div
              className="mb-4 cursor-pointer"
              onClick={() => handleRedirect(post.postId)} // Ensure the correct field for post ID is used
            >
              <MediaDisplay mediaUrl={post.link} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent redirect when clicking like button
                    handleLike(post.postId, post.liked);
                  }}
                  color={post.liked ? "error" : "default"}
                  className="transition-transform transform hover:scale-125"
                >
                  {post.liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <span className="text-gray-700 font-medium">{post.likeCount} Likes</span>
              </div>
              <button onClick={() => handleRedirect(post.postId)} className="text-sm text-blue-500 font-semibold hover:underline">
                Comment
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedPage;
