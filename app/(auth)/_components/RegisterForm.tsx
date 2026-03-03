"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "../schema";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleRegister } from "@/lib/actions/auth-action";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setError("");
    const result = await handleRegister(data);
    if (result?.success) {
      toast.success("Registration successful!");
      router.push("/login");
    } else {
      toast.error(result?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a4d3f] flex-col justify-between p-12">
        <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain brightness-0 invert" priority />
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-snug">
            Start your wellness<br />journey today.
          </h2>
          <p className="text-teal-200 text-base leading-relaxed max-w-sm">
            Create an account to track your moods, journal your thoughts, and build mindful habits every day.
          </p>
        </div>
        <p className="text-teal-400 text-xs">© {new Date().getFullYear()} Novana. All rights reserved.</p>
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

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Fill in your details to get started.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Your full name" register={register("fullName")} error={errors.fullName?.message} />
              <Input label="Username" placeholder="Choose a username" register={register("username")} error={errors.username?.message} />
            </div>

            <Input label="Email" type="email" placeholder="you@example.com" register={register("email")} error={errors.email?.message} />
            <Input label="Phone Number" placeholder="e.g. +1 234 567 8900" register={register("phoneNumber")} error={errors.phoneNumber?.message} />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
              register={register("password")}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Repeat your password"
              register={register("confirmPassword")}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white hover:bg-[#134237] transition disabled:opacity-60 active:scale-[0.98]"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#1a4d3f] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



function Input({ label, placeholder, type = "text", register, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                   placeholder-gray-400 transition
                   focus:bg-white focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20
                   hover:border-gray-300"
      />
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function PasswordInput({ label, placeholder, register, show, toggle, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...register}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm
                     focus:bg-white focus:border-[#1a4d3f] focus:ring-2 focus:ring-[#1a4d3f]/20"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a4d3f]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}