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

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

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
      setError(result.message || "Login failed");
      return;
    }

    const user = result.data;
    const token = result.token;

    await setAuthToken(token);

    // ✅ Map backend response to UserData format (include imageUrl if present)
    const mappedUser = {
      _id: user.id, // Map 'id' to '_id'
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

    // Broadcast to client UI: write to localStorage and dispatch event so header updates immediately
    try {
      if (typeof window !== "undefined") {        window.localStorage.setItem("token", token);        window.localStorage.setItem("user_data", JSON.stringify(mappedUser));
        window.dispatchEvent(new CustomEvent("user_data_updated", { detail: mappedUser }));
      }
    } catch (e) {
      // non-fatal
      console.warn("Could not broadcast user_data after login", e);
    }

    if (user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/home");
    }
  } catch {
    setError("Login failed");
  }
};


  return (
    <div className="relative w-full max-w-md rounded-[28px] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      <button
        onClick={() => router.push("/")}
        className="absolute left-6 top-6 rounded-full bg-[#1a4d3f] px-4 py-2 text-xs font-medium text-white hover:bg-[#134237] transition"
      >
        ← Back
      </button>

      <div className="mb-8 text-center mt-6">
        <div className="mb-5 flex justify-center">
          <Image
            src="/novacane.png"
            alt="Novana logo"
            width={120}
            height={80}
            priority
          />
        </div>

        <h1 className="text-[26px] font-semibold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-[14px] text-gray-500">
          Continue your wellness journey with Novana
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-full border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full rounded-full border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-[11px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
       <p className="text-right text-sm text-gray-600 mt-2">
        <Link href="/request-password-reset" className="text-900 font-semibold hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="mt-8 text-center text-sm text-gray-700">
        Don’t have an account?{" "}
        <Link href="/register" className="font-medium text-[#1a4d3f]">
          Sign up
        </Link>
      </p>
    </div>
  );
}
