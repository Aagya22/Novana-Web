"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequestPasswordResetFormData, requestPasswordResetSchema } from "../schema";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";


export default function RequestPasswordResetForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema)
  });

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onSubmit(data: RequestPasswordResetFormData) {
    setError("");
    setMessage("");
    try {
      const result = await handleRequestPasswordReset(data.email);
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Request failed");
      } else if (typeof err === "string") {
        setError(err || "Request failed");
      } else {
        setError("Request failed");
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
        Reset Password
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 border border-red-400 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 border border-green-400 text-green-700 p-3 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder="Enter your email"
              className="text-black w-full px-3 py-2.5 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-rose-900"
            />
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Remember your password?{" "}
        <Link href="/login" className="text-rose-900 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}