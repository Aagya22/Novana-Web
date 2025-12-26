import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold text-teal-600">Novana</h1>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="#features">Features</Link>
          <Link href="/login">Login</Link>
          <Link
  href="/register"
  className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-800"
>
  Get Started
</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-10 px-10 py-20 items-center">
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Your Mental Wellness, <br />
            <span className="text-teal-600">Reimagined</span>
          </h2>

          <p className="text-gray-600 text-lg mb-8">
            Novana helps you track moods, write journals, and practice guided
            wellness exercises — all in one calm, secure space.
          </p>

          <div className="flex gap-4">
            <Link
              href="/signup"
              className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-semibold"
            >
              Start Your Journey
            </Link>

            <Link
              href="#features"
              className="border border-gray-300 px-6 py-3 rounded-2xl"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative h-[420px]">
          <Image
            src="/bg.png"
            alt="Wellness illustration"
            fill
            className="object-contain"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20 px-10">
        <h3 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Wellness
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-2xl">
            <h4 className="font-semibold text-xl mb-3">📓 Journaling</h4>
            <p className="text-gray-600">
              Express your thoughts privately with guided and free-form journals.
            </p>
          </div>

          <div className="p-6 border rounded-2xl">
            <h4 className="font-semibold text-xl mb-3">😊 Mood Tracking</h4>
            <p className="text-gray-600">
              Track your emotions daily and discover meaningful patterns.
            </p>
          </div>

          <div className="p-6 border rounded-2xl">
            <h4 className="font-semibold text-xl mb-3">🧘 Exercises</h4>
            <p className="text-gray-600">
              Breathing, mindfulness, and grounding exercises designed for calm.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Novana. Your space for peace.
      </footer>
    </main>
  );
}
