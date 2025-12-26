import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Enter your full name" }),

  email: z
    .string()
    .email({ message: "Enter a valid email" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterData = z.infer<typeof registerSchema>;
