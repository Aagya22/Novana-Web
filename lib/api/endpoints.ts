import { LogIn } from "lucide-react";

export const API = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    WHOAMI: "/api/auth/whoami",
    UPDATE_PROFILE: "/api/auth/update-profile",
    REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },
  
};