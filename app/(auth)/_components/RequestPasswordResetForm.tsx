"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RequestPasswordResetFormData, requestPasswordResetSchema } from "../schema";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";


export default function RequestPasswordResetForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema)
  });

  async function onSubmit(data: RequestPasswordResetFormData) {
    try {
      const result = await handleRequestPasswordReset(data.email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      let errorMsg = "Request failed";
      if (err instanceof Error) {
        errorMsg = err.message || "Request failed";
      } else if (typeof err === "string") {
        errorMsg = err || "Request failed";
      }
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a4d3f] flex-col justify-between p-12">
        <Image src="/novacane.png" alt="Novana" width={110} height={80} className="object-contain brightness-0 invert" priority />
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-snug">
            Recover your account.<br />We&apos;ll get you back in.
          </h2>
          <p className="text-teal-200 text-base leading-relaxed max-w-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
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
            onClick={() => router.push("/login")}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4d3f] transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </button>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Forgot password?</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your email and we&apos;ll send you a reset link.</p>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#1a4d3f] py-3.5 text-sm font-semibold text-white hover:bg-[#134237] transition disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-[#1a4d3f] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}