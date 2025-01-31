import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router";
import debounce from "lodash.debounce";

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

  // Function to fetch usernames from the API (sending body with GET)
  const fetchUsernames = async (username) => {
    if (!username.trim()) return; // Don't make a request if the query is empty
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/searchuser", // change https to http if needed
        { SearchUser: username },
        { withCredentials: true }
      );
      setResults(response.data.usernames); // Assuming the API returns a list of usernames
    } catch (error) {
      console.error("Error fetching usernames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchUsernames = debounce(fetchUsernames, 500); // Debounce for 500ms

  const handleUsernameClick = (username) => {
    console.log(`Clicked on username: ${username}`);
    navigate(`/userprofile/${username}`); // Navigate to user profile page
  };

  // Trigger search query on input change
  const handleChange = (e) => {
    setValue("username", e.target.value); // Update form value
    debouncedFetchUsernames(e.target.value); // Call the debounced function
  };

  // Clear results when the component mounts (search query is empty initially)
  useEffect(() => {
    setResults([]);
  }, []);

  return (
    <div className="p-4">
      <form>
        <input
          type="text"
          {...register("username")}
          placeholder="Search for a username"
          className="border p-2 rounded w-full"
          onChange={handleChange} // Trigger search on input change
        />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
      </form>

      {isLoading && <p>Loading...</p>}

      <ul className="mt-2">
        {results.map((user) => (
          <li key={user} className="mt-1">
            <button
              onClick={() => handleUsernameClick(user)}
              className="text-blue-600 hover:underline"
            >
              {user}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
