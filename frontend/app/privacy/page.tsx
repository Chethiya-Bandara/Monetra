"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-emerald-50 dark:bg-zinc-950 text-emerald-950 dark:text-emerald-50 transition-colors">

      {/* Header */}
      <header className="bg-emerald-100 dark:bg-emerald-950 border-b border-emerald-200 dark:border-emerald-900">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

            <span className="font-bold text-emerald-900 dark:text-white">
              Monetra
            </span>
          </div>

        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm p-8 md:p-10">

          <div className="mb-10">

            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
              MONETRA
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white">
              Privacy Policy
            </h1>

            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3">
              Last updated: September 2, 2026
            </p>

          </div>

          <div className="space-y-8 text-emerald-800 dark:text-emerald-100 leading-7">

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                1. Introduction
              </h2>

              <p>
                Monetra is a personal finance management application designed
                to help users record, organize, and analyze their income and
                expenses. This Privacy Policy explains what information may be
                collected through the application, how that information is
                used, and how it is stored.
              </p>

              <p className="mt-3">
                Monetra is currently developed as a software development and
                academic project. It is not intended to provide professional
                financial, investment, or legal advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                2. Information We Collect
              </h2>

              <p>Monetra may process the following information:</p>

              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Account information:</strong> such as your email
                  address and name when creating an account.
                </li>

                <li>
                  <strong>Transaction information:</strong> including
                  transaction amounts, income or expense type, descriptions,
                  categories, and dates.
                </li>

                <li>
                  <strong>Recurring transaction information:</strong> including
                  amounts, frequency, categories, descriptions, start dates,
                  and optional end dates.
                </li>

                <li>
                  <strong>AI interaction information:</strong> messages that
                  you send to the Monetra AI assistant.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                3. How Your Information Is Used
              </h2>

              <p>
                Information stored in Monetra is used to provide the
                application's functionality, including:
              </p>

              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Displaying your financial transactions.</li>
                <li>Calculating income, expenses, and account balance.</li>
                <li>Displaying recurring financial activities.</li>
                <li>Generating financial summaries and insights.</li>
                <li>Responding to questions submitted to the AI assistant.</li>
                <li>Providing authentication and account access.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                4. AI and Third-Party Services
              </h2>

              <p>
                Monetra includes an AI-powered financial assistant. When you
                use this feature, relevant transaction information and your
                question may be sent to Google's Gemini API to generate a
                response.
              </p>

              <p className="mt-3">
                The AI assistant is intended to provide general financial
                observations based on the information available in your
                Monetra account. It should not be treated as professional
                financial advice.
              </p>

              <p className="mt-3">
                Monetra also uses Supabase for authentication and database
                services. Information required to provide these services may
                therefore be processed and stored by Supabase.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                5. Data Storage
              </h2>

              <p>
                Monetra stores account and transaction information using
                Supabase database and authentication services. Access to
                user-specific transaction data is restricted through the
                application's authentication mechanisms.
              </p>

              <p className="mt-3">
                Users should avoid entering highly sensitive information that
                is not necessary for using the application, such as passwords,
                bank account passwords, credit card numbers, or other
                authentication credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                6. Data Security
              </h2>

              <p>
                Monetra uses authentication and access controls to help protect
                user information. However, no software system or internet
                transmission can be guaranteed to be completely secure.
              </p>

              <p className="mt-3">
                Users are responsible for keeping their account credentials
                confidential and should use appropriate security practices when
                accessing the application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                7. Data Retention and Deletion
              </h2>

              <p>
                Transaction information may remain stored while the associated
                account is being used. Users may delete individual transactions
                through the application where the relevant functionality is
                available.
              </p>

              <p className="mt-3">
                Because Monetra is currently an academic/project application,
                account-wide data deletion may require action by the project
                administrator or developer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                8. Children's Privacy
              </h2>

              <p>
                Monetra is not specifically designed to collect personal
                information from children. Users should only provide
                information that is necessary for using the application and
                should follow any age requirements or access restrictions
                applicable to the environment in which Monetra is deployed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                9. Changes to This Privacy Policy
              </h2>

              <p>
                This Privacy Policy may be updated when Monetra's functionality,
                data processing practices, or third-party services change. Any
                updated version should include a revised "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-emerald-950 dark:text-white mb-3">
                10. Contact
              </h2>

              <p>
                If you have questions about this Privacy Policy or how
                information is handled within Monetra, please contact developer of the
                application.
              </p>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-emerald-200 dark:border-emerald-900">
            <p className="text-xs text-emerald-600 dark:text-emerald-500 text-center">
              © 2026 Monetra · Personal Finance Manager
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}