import { LogIn } from "lucide-react";

export const API = {
  AUTH: {
    REGISTER: "http://localhost:5050/api/auth/register",
    LOGIN: "http://localhost:5050/api/auth/login",
    WHOAMI: "http://localhost:5050/api/auth/whoami",
    UPDATE_PROFILE: "http://localhost:5050/api/auth/update-profile",
    REQUEST_PASSWORD_RESET: 'http://localhost:5050/api/auth/request-password-reset',
    RESET_PASSWORD: (token: string) => `http://localhost:5050/api/auth/reset-password/${token}`,
  },
  JOURNALS: {
    LIST: "http://localhost:5050/api/journals",
    CREATE: "http://localhost:5050/api/journals",
    GET: (id: string) => `http://localhost:5050/api/journals/${id}`,
    UPDATE: (id: string) => `http://localhost:5050/api/journals/${id}`,
    DELETE: (id: string) => `http://localhost:5050/api/journals/${id}`,
  },
  EXERCISES: {
    LIST: "http://localhost:5050/api/exercises",
    CREATE: "http://localhost:5050/api/exercises",
    GET: (id: string) => `http://localhost:5050/api/exercises/${id}`,
    UPDATE: (id: string) => `http://localhost:5050/api/exercises/${id}`,
    DELETE: (id: string) => `http://localhost:5050/api/exercises/${id}`,
  },
  MOODS: {
    LIST: "http://localhost:5050/api/moods",
    CREATE: "http://localhost:5050/api/moods",
    GET: (id: string) => `http://localhost:5050/api/moods/${id}`,
    UPDATE: (id: string) => `http://localhost:5050/api/moods/${id}`,
    DELETE: (id: string) => `http://localhost:5050/api/moods/${id}`,
  },
  HABITS: {
    LIST: "http://localhost:5050/api/habits",
    CREATE: "http://localhost:5050/api/habits",
    GET: (id: string) => `http://localhost:5050/api/habits/${id}`,
    UPDATE: (id: string) => `http://localhost:5050/api/habits/${id}`,
    DELETE: (id: string) => `http://localhost:5050/api/habits/${id}`,
    COMPLETE: (id: string) => `http://localhost:5050/api/habits/${id}/complete`,
  },
  REMINDERS: {
    LIST: "http://localhost:5050/api/reminders",
    CREATE: "http://localhost:5050/api/reminders",
    GET: (id: string) => `http://localhost:5050/api/reminders/${id}`,
    UPDATE: (id: string) => `http://localhost:5050/api/reminders/${id}`,
    DELETE: (id: string) => `http://localhost:5050/api/reminders/${id}`,
    TOGGLE: (id: string) => `http://localhost:5050/api/reminders/${id}/toggle`,
  },
  
};