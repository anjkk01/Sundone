import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MediaDisplay = ({ mediaUrl }) => {
    if (!mediaUrl) return null; // If no media URL, return nothing
  
    // Check if it's a video by examining the file extension
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
    
    return (
      <div className="w-full max-w-md">
        {isVideo ? (
          <video controls className="w-full rounded-lg shadow-md">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={mediaUrl} alt="Media" className="w-full rounded-lg shadow-md" />
        )}
      </div>
    );
  };  


const UserProfile = () => {
  const { username } = useParams(); // Get username from URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/profile/${username}`);
        setUser(response.data);
      } catch (err) {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [username]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
        <div className="flex justify-between mt-2">
          <p className="text-gray-600">Followers: {user.followers}</p>
          <p className="text-gray-600">Following: {user.followed_by}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mt-6">Posts</h2>
      <div className="grid gap-4 mt-2">
        {user.posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg p-2">
            <MediaDisplay mediaUrl={post.link} />
            <div>
                <div>Likes : {post.like_count}</div>
                <div>Created at : {post.created_at}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
