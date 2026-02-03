import axios from "axios";

const Base_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const AxiosInstance = axios.create({
  baseURL: Base_URL,
});

export default AxiosInstance;
