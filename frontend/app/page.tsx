"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  PieChart,
  BarChart3,
  BellRing,
  Globe2,
  WalletCards,
} from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroCopyRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Track every transaction",
      desc: "Record income and expenses by date and category, including recurring payments.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Get useful insights",
      desc: "Ask Monetra AI about your finances and receive clear, practical observations.",
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Understand your spending",
      desc: "Use visual analytics to compare income, expenses, trends, and spending categories.",
    },
  ];

  useGSAP(
    () => {
      const motionTargets = [
        navRef.current,
        heroHeadingRef.current,
        heroCopyRef.current,
        heroCtaRef.current,
        featuresRef.current,
        footerRef.current,
      ];
      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions?.reduceMotion) {
            gsap.set(motionTargets, { clearProps: "all" });
            return;
          }

          const loadTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

          loadTimeline
            .fromTo(
              navRef.current,
              { autoAlpha: 0, y: -16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                clearProps: "opacity,visibility,transform",
              }
            )
            .fromTo(
              ".landing-nav-item",
              { autoAlpha: 0, y: -8 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                clearProps: "opacity,visibility,transform",
              },
              "-=0.35"
            )
            .fromTo(
              heroHeadingRef.current,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                clearProps: "opacity,visibility,transform",
              },
              "-=0.2"
            )
            .fromTo(
              heroCopyRef.current,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                clearProps: "opacity,visibility,transform",
              },
              "-=0.45"
            )
            .fromTo(
              heroCtaRef.current,
              { autoAlpha: 0, y: 18 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
                clearProps: "opacity,visibility,transform",
              },
              "-=0.4"
            );

          gsap.fromTo(
            ".landing-feature-card",
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: featuresRef.current,
                start: "top 80%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            ".habits-copy",
            { autoAlpha: 0, x: -32 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.75,
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: ".habits-section",
                start: "top 75%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            ".habits-chart",
            { autoAlpha: 0, x: 32, scale: 0.96 },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: ".habits-section",
                start: "top 75%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            ".habit-bar",
            { scaleY: 0 },
            {
              scaleY: 1,
              transformOrigin: "bottom",
              duration: 0.65,
              stagger: 0.09,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".habits-chart",
                start: "top 82%",
                once: true,
              },
            }
          );

          gsap.fromTo(
            ".landing-detail-card",
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              clearProps: "opacity,visibility,transform",
              scrollTrigger: {
                trigger: ".landing-detail-features",
                start: "top 80%",
                once: true,
              },
            }
          );
        }
      );

      return () => media.revert();
    },
    { scope: pageRef }
  );

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/green.jpg')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-emerald-950/40 pointer-events-none" />

      {/* Navigation */}
      <header ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/30 backdrop-blur-md border-b border-white/10">
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">

          <Link href="/" className="landing-nav-item flex items-center gap-2">
            <div className="bg-emerald-950/30 p-2 rounded-xl backdrop-blur-md">
              <Image
                src="/images/logo.jpg"
                alt="Monetra"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>

            <span className="text-xl font-bold text-white tracking-tight">
              Monetra
            </span>
          </Link>

          <Link
            href="/login"
            className="landing-nav-item px-6 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold shadow-sm hover:bg-white/20 hover:scale-105 transition-all"
          >
            Log in
          </Link>

        </nav>
      </header>

      <div className="relative z-10">

        <section className="px-6 pt-40 pb-24 text-center max-w-5xl mx-auto">

          <h1 ref={heroHeadingRef} className="text-4xl md:text-8xl font-extrabold text-white tracking-tighter mb-8 leading-[0.9] drop-shadow-lg">
            Track your money <br />
            without the stress.
          </h1>

          <p ref={heroCopyRef} className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Record income, expenses, and recurring transactions in one place,
            then use clear analytics and AI insights to understand your finances.
          </p>

          <div ref={heroCtaRef} className="flex justify-center">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-emerald-950/40 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </section>

        <section className="habits-section overflow-hidden bg-white py-20 text-zinc-900 dark:bg-zinc-950/90 dark:text-white sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
            <div className="habits-copy max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                Your money, made visible
              </p>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                Understand your financial habits.
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-emerald-50/75">
                See where your money goes, notice the rhythms behind your spending,
                and make every decision with a clearer picture of what matters.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="text-sm text-zinc-500 dark:text-emerald-100/70">
                    Monthly saving
                  </p>

                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    +24.8%
                  </p>

                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                    Compared with last month
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="text-sm text-zinc-500 dark:text-emerald-100/70">
                    Top category
                  </p>

                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    Essentials
                  </p>

                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                    42% of your spending
                  </p>
                </div>
              </div>
            </div>

            <div className="habits-chart rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5 shadow-2xl shadow-zinc-200/60 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.08] dark:shadow-black/20 sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-emerald-100/70">
                    Spending overview
                  </p>

                  <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    Rs. 48,250
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                  This month
                </span>
              </div>

              <div className="mt-9 flex h-48 items-end justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/10">
                {[40, 66, 48, 82, 56, 92, 70].map((height, index) => (
                  <div key={index} className="flex h-full flex-1 items-end">
                    <div
                      className="habit-bar w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-xs text-zinc-400 dark:text-emerald-100/55">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              <div className="mt-7 flex items-center gap-4 rounded-2xl bg-zinc-100 p-4 dark:bg-black/15">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
                  <PieChart className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Spending is under control
                  </p>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-emerald-100/65">
                    You&apos;re below your monthly average.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        

        {/* Features */}
        <section ref={featuresRef} className="bg-white dark:bg-zinc-950/90">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="landing-feature-card p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-white dark:border-zinc-950 shadow-sm"
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

        <section className="landing-detail-features bg-white py-20 dark:bg-zinc-950/90 sm:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Built for everyday clarity</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950 dark:text-white sm:text-5xl">Features that make progress feel simple.</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <WalletCards className="h-6 w-6" />, title: "One clear view", description: "Keep income, expenses, and recurring payments together." },
                { icon: <BarChart3 className="h-6 w-6" />, title: "Visual analytics", description: "Turn your activity into clear, useful financial patterns." },
                { icon: <BellRing className="h-6 w-6" />, title: "Smart reminders", description: "Stay ahead of regular payments and important due dates." },
                { icon: <Globe2 className="h-6 w-6" />, title: "Always in sync", description: "Access your personal financial picture whenever you need it." },
              ].map((feature) => (
                <div key={feature.title} className="landing-detail-card rounded-3xl border border-white bg-white p-7 transition-transform duration-300 dark:border-emerald-900 dark:bg-zinc-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/15 dark:text-emerald-300">{feature.icon}</div>
                  <h3 className="mt-6 text-xl font-bold text-emerald-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-emerald-800/70 dark:text-emerald-100/65">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24 dark:bg-zinc-950/90">

          <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 md:px-8 lg:px-12">
            <div className="mb-12 max-w-3xl text-center">
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
                Clarity in every transaction.
              </h2>

              <p className="mt-5 text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-300">
                Bring your finances together, uncover spending patterns, and gain
                smarter insights with intuitive analytics and AI.
              </p>
            </div>

            <div
              className="
                w-full rounded-[2rem]
                border border-emerald-900/10
                bg-white/60 p-2
                shadow-2xl shadow-emerald-900/10
                backdrop-blur-sm
                sm:p-3
                dark:border-white/10
                dark:bg-white/5
                dark:shadow-emerald-950/50
              "
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200/80 bg-white dark:border-white/10 dark:bg-zinc-900">
                <Image
                  src="/images/demo.png"
                  alt="Monetra dashboard demo"
                  width={1920}
                  height={1080}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-zinc-100 dark:bg-zinc-950 py-12 text-center text-slate-900 dark:text-slate-400 text-sm">
          © 2026 Monetra. Personal finance tracking that is secure, private,
          and intelligent.
        </footer>

      </div>
    </div>
  );
}
