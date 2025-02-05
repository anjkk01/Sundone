import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Home, Search, Notifications, AddCircle, Chat, AccountCircle } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        const paths = ["/", "/searchuser", "/notifications", "/upload", "/messages", "/profile"];
        navigate(paths[newValue]);
      }}
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: "#fff",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <BottomNavigationAction label="Home" icon={<Home />} />
      <BottomNavigationAction label="Search" icon={<Search />} />
      <BottomNavigationAction label="Notifications" icon={<Notifications />} />
      <BottomNavigationAction label="Create" icon={<AddCircle />} />
      <BottomNavigationAction label="Messages" icon={<Chat />} />
      <BottomNavigationAction label="Profile" icon={<AccountCircle />} />
    </BottomNavigation>
  );
}
