"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, ShieldCheck, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
};

const enter = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export default function AuthShell({
  children,
  eyebrow,
  title,
  description,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
        <aside className="relative hidden overflow-hidden bg-emerald-950 px-10 py-10 text-white lg:flex lg:flex-col xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(52,211,153,0.28),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,0.18),transparent_32%)]" />
          <Link href="/" className="relative z-10 flex w-fit items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"><Image
                            src="/images/logo.jpg"
                            alt="Monetra"
                            width={40}
                            height={40}
                            className="object-contain"
                          /></span>
            <span className="text-xl font-bold tracking-tight">Monetra</span>
          </Link>
          <div className="relative z-10 my-auto max-w-md pt-20">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Clarity for every decision</p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">A calmer way to manage your money.</h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-emerald-50/75">Track the everyday, see the bigger picture, and make confident financial choices from one secure place.</p>
          </div>
          <div className="relative z-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><BarChart3 className="mb-5 h-5 w-5 text-emerald-300" /><p className="text-sm font-semibold">Clear insights</p><p className="mt-1 text-xs leading-5 text-emerald-50/65">Understand your spending at a glance.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><ShieldCheck className="mb-5 h-5 w-5 text-emerald-300" /><p className="text-sm font-semibold">Private by design</p><p className="mt-1 text-xs leading-5 text-emerald-50/65">Your financial data stays yours.</p></div>
          </div>
        </aside>
        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <Link href="/" className="absolute left-5 top-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:text-emerald-300 sm:left-8 lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
        <Link href="/" className="absolute left-10 top-8 hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-400 dark:hover:text-emerald-300 lg:inline-flex"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }} className="w-full max-w-md pt-12 lg:pt-0"><motion.div variants={enter} transition={{ duration: 0.35, ease: "easeOut" }} className="mb-8"><div className="mb-5 flex items-center gap-3 lg:hidden"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"><Wallet className="h-5 w-5" /></span><span className="text-lg font-bold tracking-tight">Monetra</span></div><p className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{eyebrow}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-3 text-base leading-7 text-slate-500 dark:text-slate-400">{description}</p></motion.div><motion.div variants={enter} transition={{ duration: 0.35, ease: "easeOut" }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/[0.06] sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">{children}</motion.div><motion.div variants={enter} transition={{ duration: 0.35, ease: "easeOut" }} className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</motion.div></motion.div>
        </section>
      </div>
    </main>
  );
}
