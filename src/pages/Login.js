import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login as loginService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../config/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginService({ ...formData, loginSource: 'agent' });
      if (response.success) {
        // Get user data from response
        const userData = response.user || response.data;
        
        // Check if user type is agent
        if (userData?.UserType !== "agent") {
          toast.error("Access denied. This panel is only for agents.");
          setLoading(false);
          return;
        }

        // Store token if provided (check multiple possible field names)
        const token = response.token || response.authToken || response.userToken || userData?.token;
        if (token) {
          setAuthToken(token);
        }
        // Login user
        login(token, userData);
        toast.success("Login successful! Welcome back.");
        navigate("/dashboard");
      } else {
        // Email not verified: redirect to OTP verify page
        if (response.code === "EMAIL_NOT_VERIFIED" && response.email) {
          toast.info("Please verify your email first. Enter the OTP sent to your email.");
          navigate("/verify-account", { state: { email: response.email } });
          setLoading(false);
          return;
        }
        toast.error(response.message || "Login failed");
      }
    } catch (err) {
      const data = err.data || {};
      if (data.code === "EMAIL_NOT_VERIFIED" && (data.email || formData.email)) {
        toast.info("Please verify your email first. Enter the OTP sent to your email.");
        navigate("/verify-account", { state: { email: data.email || formData.email } });
        setLoading(false);
        return;
      }
      toast.error(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-primary/20 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">MADADGAAR</h1>
          <p className="text-gray-600">Agent Panel - Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
