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

        <section className="px-6 pt-40 pb-32 text-center max-w-5xl mx-auto">

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

        {/* Features */}
        <section ref={featuresRef} className="bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="landing-feature-card p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-emerald-200 dark:border-slate-800"
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

        <section className="relative isolate overflow-hidden bg-white py-24 sm:py-32 dark:bg-zinc-950">
          <div
            className="
              absolute inset-0 -z-10
              bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),_rgba(236,253,245,0.45)_35%,_transparent_70%)]
              dark:bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.16),_transparent_55%)]
            "
          />
          <div
            className="
              absolute inset-x-0 bottom-0 -z-10 h-1/2
              bg-gradient-to-t from-emerald-50/70 to-transparent
              dark:from-emerald-950/10
            "
          />
          <div
            className="
              absolute inset-x-0 top-0 -z-10 h-px
              bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent
              dark:via-emerald-400/50
            "
          />

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
