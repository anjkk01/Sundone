import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router";
import debounce from "lodash.debounce";
import {
  TextField,
  List,
  ListItem,
  ListItemButton,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";

// Define the Zod schema for validation
const usernameSchema = z.object({
  username: z.string().min(1, "Username cannot be empty"),
});

const UserSearch = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { register, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(usernameSchema),
  });
  const navigate = useNavigate();

  // Function to fetch usernames from the API
  const fetchUsernames = async (username) => {
    if (!username.trim()) return; // Prevent empty request
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/searchuser",
        { SearchUser: username },
        { withCredentials: true }
      );
      setResults(response.data.usernames); // Assuming API returns a list of usernames
    } catch (error) {
      console.error("Error fetching usernames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchUsernames = debounce(fetchUsernames, 500);

  const handleUsernameClick = (username) => {
    navigate(`/userprofile/${username}`);
  };

  // Trigger search query on input change
  const handleChange = (e) => {
    setValue("username", e.target.value);
    debouncedFetchUsernames(e.target.value);
  };

  useEffect(() => {
    setResults([]); // Clear results on mount
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 400,
        mx: "auto",
        mt: 4,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <form>
        <TextField
          fullWidth
          variant="outlined"
          label="Search for a username"
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
      </form>

      {isLoading && <CircularProgress size={24} sx={{ display: "block", mx: "auto", my: 2 }} />}

      <List>
        {results.map((user) => (
          <ListItem key={user} disablePadding>
            <ListItemButton onClick={() => handleUsernameClick(user)}>
              <Typography variant="body1" color="primary">
                {user}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserSearch;
