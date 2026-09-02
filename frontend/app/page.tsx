"use client";

import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  PieChart,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Track your expenses",
      desc: "throughout the month, with the financial analytics",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Get instant insights",
      desc: "and see where your money goes with real-time categorizations.",
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Smart Budgeting",
      desc: "to set limits and reduce overspending.",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/green.jpg')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-emerald-950/40 pointer-events-none" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/30 backdrop-blur-md border-b border-white/10">
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>

            <span className="text-xl font-bold text-white tracking-tight">
              Monetra
            </span>
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold shadow-sm hover:bg-white/20 hover:scale-105 transition-all"
          >
            Log in
          </Link>

        </nav>
      </header>

      {/* Main content */}
      <div className="relative z-10">

        {/* Hero */}
        <section className="px-6 pt-40 pb-32 text-center max-w-5xl mx-auto">

          <h1 className="text-4xl md:text-8xl font-extrabold text-white tracking-tighter mb-8 leading-[0.9] drop-shadow-lg">
            Manage money <br />
            without the stress.
          </h1>

          <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            The simple, beautiful way to track expenses and see your
            financial future clearly.
          </p>

          <div className="flex justify-center">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-emerald-950/40 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </section>

        {/* Features */}
        <section className="bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 py-24">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-emerald-200 dark:border-slate-800"
                >

                  <div className="bg-emerald-50 dark:bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-3 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="bg-zinc-950 py-12 text-center text-slate-400 text-sm">
          © 2026 Monetra. Secure. Private. Intelligent.
        </footer>

      </div>
    </div>
  );
}