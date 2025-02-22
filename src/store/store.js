// src/store/store.js

import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../features/UserSlice'; // Ensure the correct path and case sensitivity

const store = configureStore({
  reducer: {
    user: userReducer, // The reducer for the user slice
  },
});

export default store;
