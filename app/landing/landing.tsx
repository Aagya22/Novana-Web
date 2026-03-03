"use client";

import Image from "next/image";
import Link from "next/link";

const features = [
  {
    iconColor: "bg-emerald-600",
    bg: "bg-emerald-100",
    title: "Daily Journaling",
    desc: "Capture thoughts privately with guided prompts and free-form entries to process your emotions.",
    points: ["Guided & free-form prompts", "Private & secure entries", "Reflect anytime"],
  },
  {
    iconColor: "bg-teal-600",
    bg: "bg-teal-100",
    title: "Mood Tracking",
    desc: "Log emotions daily and discover meaningful patterns that shape your overall wellbeing.",
    points: ["Daily mood logging", "Trend visualisation", "Insightful summaries"],
  },
  {
    iconColor: "bg-cyan-600",
    bg: "bg-cyan-100",
    title: "Wellness Exercises",
    desc: "Practice breathing and mindfulness exercises scientifically designed to calm the mind.",
    points: ["Guided breathing", "Mindfulness sessions", "Stress relief tools"],
  },
  {
    iconColor: "bg-lime-600",
    bg: "bg-lime-100",
    title: "Smart Reminders",
    desc: "Stay on track with personalised reminders that gently nudge you toward your wellness goals.",
    points: ["Custom schedules", "Habit building", "Gentle notifications"],
  },
  {
    iconColor: "bg-sky-600",
    bg: "bg-sky-100",
    title: "Wellness Calendar",
    desc: "Plan and review your wellness activities with an intuitive calendar view.",
    points: ["Activity planning", "Progress overview", "Monthly summaries"],
  },
  {
    iconColor: "bg-violet-600",
    bg: "bg-violet-100",
    title: "Private & Secure",
    desc: "Your data is encrypted end-to-end and never shared. Your mental health is yours alone.",
    points: ["End-to-end encryption", "No data selling", "Full privacy control"],
  },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up in seconds — no credit card required." },
  { num: "02", title: "Set your intentions", desc: "Tell Novana your wellness goals and preferred check-in frequency." },
  { num: "03", title: "Track daily", desc: "Log moods, write journal entries, and complete exercises every day." },
  { num: "04", title: "Grow & reflect", desc: "Review your progress over time and celebrate how far you've come." },
];


export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Image
            src="/novacane.png"
            alt="Novana logo"
            width={110}
            height={90}
            className="object-contain"
            priority
          />
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="#features" className="px-4 py-2 rounded-lg text-gray-600 hover:text-[#1a5d52] hover:bg-teal-50 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="px-4 py-2 rounded-lg text-gray-600 hover:text-[#1a5d52] hover:bg-teal-50 transition">
              How it works
            </Link>
            <Link href="/login" className="ml-4 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-[#1a5d52] hover:text-[#1a5d52] transition">
              Log in
            </Link>
            <Link href="/register" className="ml-2 px-5 py-2 rounded-lg bg-[#1a5d52] text-white hover:bg-[#134740] transition shadow-sm">
              Get started
            </Link>
          </nav>
          {/* Mobile menu placeholder */}
          <Link href="/register" className="md:hidden px-4 py-2 rounded-lg bg-[#1a5d52] text-white text-sm font-semibold">
            Get started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-teal-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 py-24 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-[#1a5d52] text-xs font-semibold px-4 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1a5d52]" />
              Your mental wellness companion
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Take care of your{" "}
              <span className="text-[#1a5d52] relative">
                mind
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q100 0 200 6" stroke="#1a5d52" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4"/>
                </svg>
              </span>
              , every day.
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
              Novana is your safe space to track moods, journal freely, and build resilience — one day at a time.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#1a5d52] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#134740] transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Get started
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>


          </div>

          <div className="relative flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md w-full">
              <Image
                src="/landd.png"
                alt="Wellness illustration"
                width={560}
                height={480}
                className="object-contain w-full"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-[#1a5d52] text-sm font-semibold tracking-widest uppercase">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Everything you need for wellness
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Thoughtfully designed tools that meet you where you are and grow with you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <div className={`h-5 w-5 rounded-md ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1a5d52] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-teal-50/60 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-[#1a5d52] text-sm font-semibold tracking-widest uppercase">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Simple steps, big changes
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Getting started with Novana takes less than two minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex flex-col items-center text-center gap-4">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-0 h-px border-t-2 border-dashed border-teal-200" />
                )}
                <div className="h-14 w-14 rounded-2xl bg-[#1a5d52] text-white flex items-center justify-center text-lg font-extrabold shadow-md z-10">
                  {s.num}
                </div>
                <h3 className="font-bold text-base">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── CTA Banner ── */}
      <section className="py-24 px-6 bg-[#1a5d52]">
        <div className="max-w-3xl mx-auto text-center space-y-7">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Your wellness journey starts today.
          </h2>
          <p className="text-teal-100 text-lg">
            Build healthier habits, one day at a time. Create your account and start your wellness journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#1a5d52] px-8 py-3.5 rounded-xl font-bold hover:bg-teal-50 transition shadow-lg hover:-translate-y-0.5"
            >
              Create an account
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <Image src="/novacane.png" alt="Novana" width={100} height={80} className="object-contain brightness-200" />
            <p className="text-sm leading-relaxed max-w-xs">
              Novana is your personal mental wellness companion — helping you build a calmer, healthier mind every day.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white transition">How it works</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Sign up</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition">Log in</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Novana. All rights reserved.</p>
          <p>Built with care for mental wellness.</p>
        </div>
      </footer>

    </main>
  );
}
