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
    <div className="min-h-screen w-full bg-[] flex items-center justify-center px-4 font-sans">

      {/* 🔹 SMALLER, CLEANER CARD */}
      <div className="w-full max-w-lg md:max-w-5xl bg-white rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.18)] overflow-hidden md:flex">

        {/* IMAGE */}
        <div className="relative hidden md:block md:w-1/2">
          <Image
            src="/medd.jpeg"
            alt="Meditation"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* FORM */}
        <div className="w-full md:w-1/2 px-6 py-8 sm:px-8">

          <button
            onClick={() => router.push("/")}
            className="mb-5 inline-flex items-center rounded-full bg-[#1a4d3f] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#134237]"
          >
            ← Back
          </button>

       
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a4d3f]">
            Welcome!
          </h1>
          <p className="mb-5 text-sm text-gray-500">
            Sign up to continue
          </p>

          {error && (
            <p className="mb-3 text-xs text-red-500">{error}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <Input label="Full Name" placeholder="Type your name" register={register("fullName")} error={errors.fullName?.message} />
            <Input label="Username" placeholder="Choose a username" register={register("username")} error={errors.username?.message} />
            <Input label="E-mail" type="email" placeholder="Type your e-mail" register={register("email")} error={errors.email?.message} />
            <Input label="Phone Number" placeholder="Enter phone number" register={register("phoneNumber")} error={errors.phoneNumber?.message} />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
              register={register("password")}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
            />

            <PasswordInput
              label="Repeat Password"
              placeholder="Repeat your password"
              register={register("confirmPassword")}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword?.message}
            />

          
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-full bg-[#1a4d3f] py-2.5 text-sm font-semibold text-white
                         transition hover:bg-[#134237] active:scale-[0.98]"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#1a4d3f] hover:underline">
              Login
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