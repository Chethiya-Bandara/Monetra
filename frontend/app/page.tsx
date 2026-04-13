"use client";
import Link from "next/link";
import { Wallet, ArrowRight, ShieldCheck, Zap, PieChart } from "lucide-react";
import dynamic from 'next/dynamic';
import SpotlightCard from "../components/SpotlightCard";

// Force client-side rendering for the WebGL Prism
const Prism = dynamic(() => import("../components/Prism"), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950" />
});

export default function LandingPage() {
  const features = [
    { 
      icon: <ShieldCheck className="w-8 h-8" />, 
      title: "Bank-Level Security", 
      desc: "Your data is encrypted and private. We never sell your info." 
    },
    { 
      icon: <Zap className="w-8 h-8" />, 
      title: "Instant Insights", 
      desc: "See where your money goes with real-time AI categorizations." 
    },
    { 
      icon: <PieChart className="w-8 h-8" />, 
      title: "Smart Budgeting", 
      desc: "Set limits and get notified before you overspend." 
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      
      {/* 1. BACKGROUND PRISM (The Canvas) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-60 dark:opacity-50">
        <Prism
          animationType="rotate"
          timeScale={0.3}
          height={3.5}
          baseWidth={5.5}
          scale={2.8}      
          hueShift={0}     // Deep blue starting point
          colorFrequency={1.2} 
          noise={0.02}
          glow={0.9}       
        />
      </div>

      <div className="relative z-10">
        {/* 2. Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold dark:text-white tracking-tight">Monetra</span>
          </div>
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-sm font-bold shadow-sm hover:scale-105 transition-all"
          >
            Sign in
          </Link>
        </nav>

        {/* 3. Hero Content */}
        <section className="px-6 pt-32 pb-24 text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tighter mb-8 leading-[0.9]">
            Manage <span className="text-indigo-600">money</span> <br />
            without the stress.
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The simple, beautiful way to track expenses and see your financial future clearly. Built for modern life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="group flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-indigo-500/40 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up for free.
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* 4. Features Section with Spotlight Cards */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <SpotlightCard 
                key={i}
                spotlightColor="rgba(79, 70, 229, 0.15)"
                className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800"
              >
                <div className="relative z-20">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Footer Hint */}
        <footer className="py-12 text-center text-slate-400 text-sm">
          © 2026 Monetra. Secure. Private. Intelligent.
        </footer>
      </div>
    </div>
  );
}