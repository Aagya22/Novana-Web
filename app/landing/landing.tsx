"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6">
        <Image
          src="/novacane.png"
          alt="Novana logo"
          width={120}
          height={100}
          className="object-contain"
          priority
        />

        <nav className="flex gap-4 text-sm font-medium">
          <Link href="#features" className="rounded-xl border px-4 py-2 hover:bg-gray-100">
            Features
          </Link>
          <Link href="/login" className="rounded-xl border px-4 py-2 hover:bg-gray-100">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#1a5d52] px-5 py-2 text-white font-semibold hover:bg-[#134740]"
          >
            Register
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 px-10 py-16 items-center max-w-7xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-6xl font-bold leading-tight">
            Mental <br />
            <span className="text-[#1a5d52]">Wellness</span>
          </h1>

          <p className="text-gray-600 text-lg max-w-md">
            Novana is your personal mental wellness companion. Track your moods,
            express yourself through journaling, and practice mindfulness exercises.
          </p>

          <Link
            href="/signup"
            className="inline-block bg-white border-2 border-[#1a5d52] text-[#1a5d52] px-8 py-3 rounded-full font-semibold hover:bg-[#1a5d52] hover:text-white transition"
          >
            LEARN MORE
          </Link>
        </div>

        <div className="flex justify-center">
          <Image
            src="/landd.png"
            alt="Wellness illustration"
            width={600}
            height={500}
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gradient-to-b from-white to-teal-50 py-20 px-10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">
            Everything You Need for Wellness
          </h3>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Thoughtfully designed tools to support your mental health journey.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            
            {/* Card 1 */}
            <div className="p-8 bg-white rounded-3xl border shadow-sm hover:shadow-2xl transition hover:-translate-y-2">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <div className="h-6 w-6 rounded bg-emerald-600" />
              </div>

              <h4 className="text-2xl font-bold mb-3">Daily Journaling</h4>
              <p className="text-gray-600 mb-5">
                Capture thoughts privately with guided prompts and free-form entries.
              </p>

              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Guided prompts</li>
                <li>• Private & secure</li>
                <li>• Reflect anytime</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-white rounded-3xl border shadow-sm hover:shadow-2xl transition hover:-translate-y-2">
              <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center mb-6">
                <div className="h-6 w-6 rounded bg-teal-600" />
              </div>

              <h4 className="text-2xl font-bold mb-3">Mood Tracking</h4>
              <p className="text-gray-600 mb-5">
                Log emotions daily and discover patterns that shape your wellbeing.
              </p>

              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Mood history</li>
                <li>• Emotional trends</li>
                <li>• Insightful summaries</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-white rounded-3xl border shadow-sm hover:shadow-2xl transition hover:-translate-y-2">
              <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center mb-6">
                <div className="h-6 w-6 rounded bg-cyan-600" />
              </div>

              <h4 className="text-2xl font-bold mb-3">Wellness Exercises</h4>
              <p className="text-gray-600 mb-5">
                Practice breathing and mindfulness exercises designed to calm the mind.
              </p>

              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Guided breathing</li>
                <li>• Mindfulness sessions</li>
                <li>• Stress relief tools</li>
              </ul>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <Link
              href="/register"
              className="inline-block bg-[#1a5d52] text-white px-10 py-4 rounded-full font-semibold hover:bg-[#134740] transition shadow-lg hover:scale-105"
            >
              Start Your Wellness Journey
            </Link>
            
          </div>
        </div>
      </section>

      
    </main>
  );
}
