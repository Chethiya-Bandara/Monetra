import Link from "next/link";
import { Wallet, ArrowRight, ShieldCheck, Zap, PieChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold dark:text-white">Monetra</span>
        </div>
        <Link href="/login" className="text-sm font-semibold hover:text-indigo-600 dark:text-slate-300 transition-colors">
          Sign in
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-24 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Take control of your <span className="text-indigo-600">money</span> without the stress.
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          The simple, beautiful way to track expenses, set budgets, and see your financial future clearly. Built for modern life.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
            Start Tracking for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck />, title: "Bank-Level Security", desc: "Your data is encrypted and private. We never sell your info." },
          { icon: <Zap />, title: "Instant Insights", desc: "See where your money goes with real-time categorizations." },
          { icon: <PieChart />, title: "Smart Budgeting", desc: "Set limits and get notified before you overspend." }
        ].map((feature, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="text-indigo-600 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}