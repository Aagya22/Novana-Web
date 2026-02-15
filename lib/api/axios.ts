import axios, { AxiosHeaders } from "axios";

const Base_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const AxiosInstance = axios.create({
  baseURL: Base_URL,
});

AxiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

export default AxiosInstance;
