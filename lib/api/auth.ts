import axios from "./axios";
import { API } from "./endpoints";
import { getAuthToken } from "../cookie";

// Client-side helper to read auth token from document.cookie
function getAuthTokenClient(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + "auth_token" + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/* -------------------- REGISTER -------------------- */
export const register = async (registerData: any) => {
  try {
    const response = await axios.post(
      API.AUTH.REGISTER,
      registerData
    );
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Registration failed"
    );
  }
};

/* -------------------- LOGIN -------------------- */
export const login = async (loginData: any) => {
  try {
    const response = await axios.post(
      API.AUTH.LOGIN,
      loginData
    );
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Login failed"
    );
  }
};

/* -------------------- WHO AM I -------------------- */
export const whoAmI = async () => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(
      API.AUTH.WHOAMI,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch user data"
    );
  }
};

export const updateProfile = async (formData: FormData) => {
  try {
    // server-side call path (used by server actions)
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(API.AUTH.UPDATE_PROFILE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err: Error | any) {
    console.error("updateProfile (server) error:", err?.response || err);
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Failed to update profile"
    );
  }
};

// Client-side update - uses document.cookie to get token and calls backend directly
export const updateProfileClient = async (formData: FormData) => {
  try {
    const token = getAuthTokenClient();
    if (!token) throw new Error("No authentication token found (client)");

    const response = await axios.put(API.AUTH.UPDATE_PROFILE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err: any) {
    console.error("updateProfileClient error:", err?.response || err);
    // Attach status/code if available for better messages
    const serverMessage = err?.response?.data?.message;
    const status = err?.response?.status;
    const msg = serverMessage || err?.message || "Failed to update profile (client)";
    const e = new Error(msg) as any;
    if (status) e.status = status;
    throw e;
  }
  
};
export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(API.AUTH.REQUEST_PASSWORD_RESET, { email });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message?? error.message?? 'Request password reset failed');
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await axios.post(API.AUTH.RESET_PASSWORD(token), { newPassword: newPassword });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message ?? error.message?? 'Reset password failed');
    }
};
