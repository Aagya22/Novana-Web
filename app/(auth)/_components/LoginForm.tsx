"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    console.log("Login data:", data);

    // ✅ after login → dashboard
    router.push("/home");
  };

  return (
    <div className="relative w-full max-w-md rounded-[28px] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute left-6 top-6 rounded-full bg-[#1a4d3f] px-4 py-2 text-xs font-medium text-white hover:bg-[#134237] transition"
      >
        ← Back
      </button>

      {/* Logo */}
      <div className="mb-8 text-center mt-6">
        <div className="mb-5 flex justify-center">
          <Image
            src="/novacane.png"
            alt="Novana logo"
            width={120}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-[26px] font-semibold text-gray-900 mb-2">
          Welcome Back
        </h1>

        <p className="text-[14px] leading-6 text-gray-500">
          Continue your wellness journey with Novana
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-full border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          {errors.password && (
            <p className="mt-1 text-[11px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white transition hover:bg-[#134237]"
        >
          Log in
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-700">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#1a4d3f] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
