"use client";

import Link from "next/link";

export default function RegisterForm() {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
          N
        </div>
        <h1 className="text-2xl font-semibold">Welcome to Novana</h1>
        <p className="text-sm text-gray-500">
          Your personal space for mindfulness, growth, and wellbeing
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-medium text-white hover:bg-emerald-800"
        >
          Get Started
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
