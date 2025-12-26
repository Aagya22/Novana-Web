"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "../schema";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    console.log("Register Data:", data);

    // Simulate backend success
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", data.email);

    router.push("/home");
  };

  return (
    <div className="w-full max-w-md rounded-[28px] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      {/* Logo */}
      <div className="mb-8 text-center">
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
          Welcome to Novana
        </h1>

        <p className="text-[14px] leading-6 text-gray-500">
          Your personal space for mindfulness, growth, and wellbeing
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1">
            Full Name
          </label>
          <input
            {...register("fullName")}
            type="text"
            placeholder="Enter your name"
            className="w-full rounded-full border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
            <p className="text-[11px] text-red-500 mt-1">
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
            <p className="text-[11px] text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white transition hover:bg-[#134237] disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Get Started"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#1a4d3f] hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
