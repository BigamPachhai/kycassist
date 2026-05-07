import axios from "axios";

// Get API URL from environment, with fallback to localhost for development
const getAPIUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://your-backend-domain.vercel.app/api";
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getAPIUrl(),
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kycassist_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (res) => {
    console.log(`[API] ✅ ${res.status} ${res.config.url}`);
    return res;
  },
  (err) => {
    // Log error details for debugging
    console.error(`[API] ❌ Error:`, {
      status: err.response?.status,
      url: err.config?.url,
      message: err.message,
    });

    // Handle 401 Unauthorized - redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem("kycassist_token");
      localStorage.removeItem("kycassist_user");
      window.location.href = "/login";
    }

    // Handle network errors
    if (!err.response) {
      console.error("[API] Network Error - Backend unreachable");
      err.message = "Unable to connect to server. Check your connection.";
    }

    return Promise.reject(err);
  },
);

export default api;
