import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as z from "zod";

// Define the validation schema
const signInSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(20, { message: "Password must be less than 20 characters" }),
});

const SignInPage = () => {
  const navigate = useNavigate();

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const { username, password } = data;
      const response = await axios.post(
        `http://localhost:5000/signin`,
        { username, password },
        { withCredentials: true } // Enable sending cookies
      );
      // Assume the backend sets cookies for authentication
      navigate("/"); // Redirect to the homepage
    } catch (error) {
      alert("Sign-in failed. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username Input */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username")}
              className={`mt-1 p-2 w-full border rounded-md ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={`mt-1 p-2 w-full border rounded-md ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>

        {/* Navigate to Sign Up */}
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Go to Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
