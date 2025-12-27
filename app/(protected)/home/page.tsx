"use client";

import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-white px-10 py-8">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <Image
            src="/novacane.png"
            alt="Novana logo"
            width={80}
            height={60}
            className="object-contain"
            priority
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>
        </div>

        <Link
          href="/login"
          className="rounded-full border px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Log out
        </Link>
      </header>

      {/* Welcome Card */}
      <section className="mb-12">
        <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome back 
          </h2>
          <p className="text-gray-600">
            Take a moment to check in with yourself today.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-8">
        
        {/* Journal */}
        <div className="rounded-3xl bg-white p-6 shadow hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Journal</h3>
          <p className="text-gray-600 mb-4">
            Write down your thoughts and reflect on your day.
          </p>
          <button className="text-sm font-medium text-emerald-700 hover:underline">
            Open Journal →
          </button>
        </div>

        {/* Mood */}
        <div className="rounded-3xl bg-white p-6 shadow hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Mood Tracker</h3>
          <p className="text-gray-600 mb-4">
            Log how you’re feeling and spot emotional patterns.
          </p>
          <button className="text-sm font-medium text-emerald-700 hover:underline">
            Track Mood →
          </button>
        </div>

        {/* Exercises */}
        <div className="rounded-3xl bg-white p-6 shadow hover:shadow-xl transition">
          <h3 className="text-xl font-semibold mb-2">Exercises</h3>
          <p className="text-gray-600 mb-4">
            Try breathing and mindfulness exercises.
          </p>
          <button className="text-sm font-medium text-emerald-700 hover:underline">
            Start Exercise →
          </button>
        </div>

      </section>

    

    </main>
  );
}
