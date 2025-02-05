import React from "react";// Ensure ChakraProvider is imported
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import SignupPage from "./components/SignUpPage";
import CreatePost from "./components/CreatePost";
import UserSearch from "./components/UserSearch";
import Feed from "./components/Feed";
import UserProfile from "./components/UserProfile";
import PostPage from "./components/PostPage";
import Navbar from "./components/Navbar";
const App = () => {
  return (
    // ChakraProvider should wrap your whole app to provide context to Chakra UI components
      <Router>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/upload" element={<CreatePost />} />
          <Route path="/searchuser" element={<UserSearch />} />
          <Route path="/userprofile/:username" element={<UserProfile />} />
          <Route path="/post/:post_id" element={<PostPage />} />
        </Routes>
        <Navbar />
      </Router>
  );
};

export default App;
