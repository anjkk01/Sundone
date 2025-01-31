import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import SignupPage from "./components/SignUpPage"; // Ensure this file is imported
import CreatePost from "./components/CreatePost";
import UserSearch from "./components/UserSearch";
import Feed from "./components/Feed";
import UserProfile from "./components/UserProfile";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Feed/>}/>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/upload" element={<CreatePost />} />
        <Route path="/usersearch" element={<UserSearch />} />
        <Route path="/userprofile/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  );
};

export default App;