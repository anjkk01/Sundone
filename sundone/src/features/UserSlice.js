// src/features/UserSlice.js

import { createSlice } from "@reduxjs/toolkit";

// Initial state for the user slice
const initialState = {
  user: null, // Stores logged-in user data
  isAuthenticated: false, // Boolean to track authentication status
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

// Export the actions to be dispatched
export const { setUser, logoutUser } = userSlice.actions;

// Export the reducer to be used in the store
export default userSlice.reducer;
