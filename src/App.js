import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import SignupPage from "./components/SignUpPage";
import CreatePost from "./components/CreatePost";
import UserSearch from "./components/UserSearch";
import Feed from "./components/Feed";
import UserProfile from "./components/UserProfile";
import PostPage from "./components/PostPage";
import axios from "axios";
import { setUser } from "./features/UserSlice";
import TopBar from "./components/TopBar";
import BottomBar from "./components/BottomBar";

const fetchUser = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get("http://localhost:5000/getuser", { withCredentials: true });
      dispatch(setUser(response.data.user));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
};

// Separate component to use `useLocation`
const Layout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Hide bars on specific pages
  const hideBars = ["/signin", "/signup"];
  const shouldShowBars = !hideBars.includes(location.pathname);

  return (
    <div>
      {shouldShowBars && <TopBar />}
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Feed />} />
        <Route path="/upload" element={<CreatePost />} />
        <Route path="/searchuser" element={<UserSearch />} />
        <Route path="/userprofile/:username" element={<UserProfile />} />
        <Route path="/post/:post_id" element={<PostPage />} />
      </Routes>
      {shouldShowBars && <BottomBar />}
    </div>
  );
};

// Wrap `Layout` inside `Router` in `App`
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout />
      </Router>
    </Provider>
  );
};

export default App;
