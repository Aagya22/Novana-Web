import { z } from "zod";

/* -------------------- LOGIN -------------------- */
export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Enter your full name" }),

  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),

  email: z
    .string()
    .email({ message: "Enter a valid email" }),

  phoneNumber: z
    .string()
    .min(10, { message: "Enter a valid phone number" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),

  confirmPassword: z
    .string()
    .min(8, { message: "Confirm password is required" }),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type RegisterData = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  }
).refine(
  (data) => {
    // If newPassword is provided, confirmPassword must match
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// User type (matches your backend response)
export interface User {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  role: "user" | "admin";
  imageUrl?: string | null;
}






