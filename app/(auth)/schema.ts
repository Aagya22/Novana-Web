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
