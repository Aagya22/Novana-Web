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

    try {
      const journalToken = window.sessionStorage.getItem("journal_access_token");
      const expiresAtRaw = window.sessionStorage.getItem("journal_access_token_expires_at");
      const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : NaN;

      if (journalToken && Number.isFinite(expiresAt) && Date.now() < expiresAt) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("x-journal-access-token", journalToken);
        } else {
          (config.headers as Record<string, string>)["x-journal-access-token"] = journalToken;
        }
      } else if (journalToken) {
       
        window.sessionStorage.removeItem("journal_access_token");
        window.sessionStorage.removeItem("journal_access_token_expires_at");
      }
    } catch {
      // ignore sessionStorage errors
    }
  }

  return config;
});

export default AxiosInstance;
