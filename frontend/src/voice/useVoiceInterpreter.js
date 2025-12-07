import axios from "axios";

// Create a local instance to handle auth headers automatically
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const interpret = async (text) => {
  try {
    // Use the configured API instance so it includes the token
    const res = await API.post("/ai/interpret", {
      text,
    });

    return res.data;
  } catch (err) {
    console.log("AI interpret error", err);
    // Return null to allow fallback processing (regex/simple commands) in App.js
    return null;
  }
};
