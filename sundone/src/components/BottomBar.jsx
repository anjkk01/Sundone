import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNavigation, BottomNavigationAction, Box, CircularProgress } from "@mui/material";
import { Home, AddBox, Chat, AccountCircle } from "@mui/icons-material";
import { useSelector } from "react-redux";

const BottomBar = () => {
  const [navValue, setNavValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  // Wait until user data is available
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <Box>
      <BottomNavigation
        showLabels
        value={navValue}
        onChange={(event, newValue) => {
          setNavValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/");
              break;
            case 1:
              navigate("/upload");
              break;
            case 2:
              navigate("/messages");
              break;
            case 3:
              if (!loading && user?.username) {
                navigate(`/userprofile/${user.username}`);
              }
              break;
            default:
              break;
          }
        }}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50px",
          backgroundColor: "#fff",
          boxShadow: "0px -2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <BottomNavigationAction label="Home" icon={<Home fontSize="small" />} />
        <BottomNavigationAction label="Add" icon={<AddBox fontSize="small" />} />
        <BottomNavigationAction label="Messages" icon={<Chat fontSize="small" />} />
        <BottomNavigationAction
          label={loading ? <CircularProgress size={15} /> : "Profile"}
          icon={<AccountCircle fontSize="small" />}
          disabled={loading}
        />
      </BottomNavigation>
    </Box>
  );
};

export default BottomBar;
