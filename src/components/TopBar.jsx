import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import debounce from "lodash.debounce";
import {
  AppBar,
  Toolbar,
  TextField,
  List,
  ListItem,
  ListItemButton,
  Typography,
  CircularProgress,
  Paper,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import IntegratedStoryViewer from "./storiesSection";

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const rawStories = await axios.get("http://localhost:5000/stories", {
          withCredentials: true,
        });
        setStories(rawStories.data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const fetchUsernames = async (query) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/searchuser",
        { SearchUser: query },
        { withCredentials: true }
      );
      setResults(response.data.usernames);
    } catch (error) {
      console.error("Error fetching usernames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchUsernames = debounce(fetchUsernames, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetchUsernames(value);
  };

  const handleUsernameClick = (username) => {
    navigate(`/userprofile/${username}`);
    setSearchQuery("");
    setResults([]);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMenuClick = async(option) => {
    setMenuOpen(false); // Close menu on selection
    if (option === "Edit Profile") {
      navigate("/editprofile");
    } else if (option === "Sign Out") {
      
      try {
        await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
        navigate("/signin"); // Redirect to login page
      } catch (error) {
        console.error("Logout failed:", error);
      } // Replace with actual sign-out logic
    } else if (option === "FundMe") {
      navigate("/fundme");
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#fff", boxShadow: "none", p: 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Box sx={{ mr: 12 }}>
            <img
              src="/logo.png"
              alt="Sundone Logo"
              style={{ height: 40, cursor: "pointer" }}
              onClick={() => navigate(`/`)}
            />
          </Box>

          {/* Story Viewer */}
          <IntegratedStoryViewer stories={stories} />

          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <Box sx={{ position: "relative", width: "250px" }}>
              <TextField
                variant="outlined"
                placeholder="Search Users"
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
                sx={{
                  backgroundColor: "#f1f1f1",
                  borderRadius: 2,
                  "& .MuiInputBase-input": { textAlign: "center" },
                }}
              />
              {searchQuery && (
                <Paper
                  elevation={3}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    mt: 1,
                    zIndex: 10,
                    backgroundColor: "#fff",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ display: "block", mx: "auto", my: 2 }} />
                  ) : (
                    <List>
                      {results.map((user) => (
                        <ListItem key={user} disablePadding>
                          <ListItemButton onClick={() => handleUsernameClick(user)}>
                            <Typography variant="body1" color="primary">{user}</Typography>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              )}
            </Box>

            {/* Hamburger Menu */}
            <IconButton sx={{ ml: 2 }} onClick={toggleMenu}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Menu */}
      {menuOpen && (
        <>
          {/* Background Overlay (Click to Close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          />

          {/* Animated Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "250px",
              height: "100vh",
              backgroundColor: "#fff",
              boxShadow: "-5px 0 10px rgba(0, 0, 0, 0.1)",
              zIndex: 1100,
              display: "flex",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            {/* Close Button */}
            <IconButton onClick={toggleMenu} sx={{ alignSelf: "flex-end", mb: 2 }}>
              <CloseIcon />
            </IconButton>

            {/* Menu Options with Separators */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center", pb: 1 }}
                onClick={() => handleMenuClick("Edit Profile")}
              >
                Edit Profile
              </Typography>
              <Divider sx={{ backgroundColor: "gray" }} />
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center", pb: 1 }}
                onClick={() => handleMenuClick("Sign Out")}
              >
                Sign Out
              </Typography>
              <Divider sx={{ backgroundColor: "gray" }} />
              <Typography
                variant="h6"
                sx={{ cursor: "pointer", textAlign: "center" }}
                onClick={() => handleMenuClick("FundMe")}
              >
                FundMe
              </Typography>
            </Box>
          </motion.div>
        </>
      )}
    </>
  );
};

export default TopBar;
