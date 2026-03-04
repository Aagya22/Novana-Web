"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import { useState } from "react";
import { handleLogin } from "@/lib/actions/auth-action";
import { setAuthToken, setUserData } from "@/lib/cookie";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
  setError("");
  try {
    const result = await handleLogin(data, { persist: false });
    if (!result.success) {
      toast.error(result.message || "Login failed");
      return;
    }

    toast.success("Login successful!");

    const user = result.data;
    const token = result.token;

    await setAuthToken(token);

    const mappedUser = {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: user.imageUrl || undefined,
    };

    await setUserData(mappedUser);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", token);
        window.localStorage.setItem("user_data", JSON.stringify(mappedUser));
        try {
          window.sessionStorage.removeItem("journal_access_token");
          window.sessionStorage.removeItem("journal_access_token_expires_at");
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent("user_data_updated", { detail: mappedUser }));
      }
    } catch (e) {
      console.warn("Could not broadcast user_data after login", e);
    }

    if (user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/home");
    }
  } catch {
    toast.error("Login failed");
  }
};

  return (
    <div className="min-h-screen w-full flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a4d3f] flex-col justify-between p-12">
        <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain brightness-0 invert" priority />
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-snug">
            Welcome back.<br />Your wellness journey continues here.
          </h2>
          <p className="text-teal-200 text-base leading-relaxed max-w-sm">
            Log in to track your moods, review your journal, and keep building healthy habits.
          </p>
        </div>
        <p className="text-teal-400 text-xs">&copy; {new Date().getFullYear()} Novana. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain" priority />
          </div>

          <button
            onClick={() => router.push("/")}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4d3f] transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </button>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Log in</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your credentials to continue.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20 transition"
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a4d3f]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/request-password-reset" className="text-xs text-[#1a4d3f] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white hover:bg-[#134237] transition disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#1a4d3f] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
