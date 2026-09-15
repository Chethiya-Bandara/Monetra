"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";

const inputClassName = "mt-2 block h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600 dark:disabled:bg-slate-800";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("http://localhost:8000/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Registration failed");
      router.push("/login?message=Account created successfully. Please log in.");
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Unable to create your account. Please try again."); }
    finally { setLoading(false); }
  };

  return <AuthShell eyebrow="Start for free" title="Create your account" description="Set up your personal finance workspace in just a moment." footer={<>Already have an account? <Link href="/login" className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-400">Sign in</Link></>}>
    {error && <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm leading-5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div><label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full name</label><input id="fullName" type="text" autoComplete="name" required disabled={loading} value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} className={inputClassName} placeholder="Full Name" /></div>
      <div><label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</label><input id="email" type="email" autoComplete="email" required disabled={loading} value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={inputClassName} placeholder="you@example.com" /></div>
      <div><label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label><PasswordInput id="password" autoComplete="new-password" minLength={8} required disabled={loading} value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} className={inputClassName} placeholder="At least 8 characters" /><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use at least 8 characters to keep your account secure.</p></div>
      <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-emerald-400 disabled:shadow-none">{loading ? <><Loader2 className="h-5 w-5 animate-spin" />Creating account…</> : <>Create account <ArrowRight className="h-4 w-4" /></>}</button>
    </form>
  </AuthShell>;
}
