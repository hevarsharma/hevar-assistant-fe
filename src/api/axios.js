import axios from "axios";

const api = axios.create({
  baseURL: "https://api.hevarassistantbackend.site",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
