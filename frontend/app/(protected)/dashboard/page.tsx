"use client";

import RecurringTransactionList from "../../../components/RecurringTransactionList";
import ChatBotPopup from "../../../components/ChatBotPopup";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import SummaryCards from "../../../components/SummaryCards";
import TransactionForm from "../../../components/TransactionForm";
import TransactionList from "../../../components/TransactionList";
import FinancialInsights from "../../../components/FinancialInsights";
import ChatBot from "../../../components/ChatBot";
import { Wallet, LogOut, Loader2 } from "lucide-react"; 
import { ThemeToggle } from "../../../components/ThemeToggle";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { apiUrl } from "@/lib/api";

interface RecurringTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly";
  category: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
}

const toLocalDate = (value: string) => {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const getCompletedRecurringOccurrences = (
  transaction: RecurringTransaction
) => {
  const startDate = toLocalDate(transaction.start_date);
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const endDate = transaction.end_date
    ? toLocalDate(transaction.end_date)
    : today;
  const cutoffDate = endDate < today ? endDate : today;

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(cutoffDate.getTime()) ||
    cutoffDate <= startDate
  ) {
    return 0;
  }

  const elapsedDays = Math.floor(
    (cutoffDate.getTime() - startDate.getTime()) / 86_400_000
  );

  if (transaction.frequency === "daily") return elapsedDays;
  if (transaction.frequency === "weekly") return Math.floor(elapsedDays / 7);

  if (transaction.frequency === "monthly") {
    let elapsedMonths =
      (cutoffDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
      cutoffDate.getUTCMonth() -
      startDate.getUTCMonth();
    const lastDayOfCutoffMonth = new Date(
      Date.UTC(
        cutoffDate.getUTCFullYear(),
        cutoffDate.getUTCMonth() + 1,
        0
      )
    ).getUTCDate();
    const dueDay = Math.min(startDate.getUTCDate(), lastDayOfCutoffMonth);

    if (cutoffDate.getUTCDate() < dueDay) elapsedMonths -= 1;

    return Math.max(0, elapsedMonths);
  }

  return 0;
};

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUserName(decoded.user_metadata?.full_name || "there");
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      }

      try {
        // Load normal transactions
        const transactionRes = await fetch(
          apiUrl("/transactions"),
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (transactionRes.ok) {
          const data = await transactionRes.json();
          setTransactions(data);
        }


        // Load recurring transactions
        const recurringRes = await fetch(
          apiUrl("/recurring-transactions"),
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (recurringRes.ok) {
          const recurringData = await recurringRes.json();
          setRecurringTransactions(recurringData);
        }

      } catch (err) {
        console.error("Failed to fetch:", err);

      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAdd = async (formData: any) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      // ==========================================
      // RECURRING TRANSACTION
      // ==========================================
      if (formData.is_recurring) {

        const recurringPayload = {
          amount: Number(formData.amount),
          type: formData.type.toLowerCase(),
          frequency: formData.frequency,
          category: formData.category,
          description: formData.text,
          start_date: formData.date || new Date().toISOString().slice(0, 10),
          end_date: formData.end_date || null,
        };

        const recurringRes = await fetch(
          apiUrl("/recurring-transactions"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(recurringPayload),
          }
        );

        if (!recurringRes.ok) {
          const errorData = await recurringRes.json();

          console.error(
            "Recurring transaction error:",
            errorData.detail
          );

          return;
        }

        const recurringTransaction = await recurringRes.json();

        // Immediately add to recurring list
        setRecurringTransactions((prev) => [
          recurringTransaction,
          ...prev,
        ]);


        // ==========================================
        // CREATE CURRENT TRANSACTION
        // ==========================================

        const transactionPayload = {
          text: formData.text,
          amount: Number(formData.amount),
          type: formData.type.toLowerCase(),
          date: formData.date || new Date().toISOString().slice(0, 10),
          category: formData.category,
        };

        const transactionRes = await fetch(
          apiUrl("/transactions"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(transactionPayload),
          }
        );

        if (!transactionRes.ok) {
          const errorData = await transactionRes.json();

          console.error(
            "Transaction creation error:",
            errorData.detail
          );

          return;
        }

        const newTransaction = await transactionRes.json();

        // Immediately add to transaction list
        setTransactions((prev) => [
          newTransaction,
          ...prev,
        ]);

        return;
      }


      // ==========================================
      // NORMAL ONE-TIME TRANSACTION
      // ==========================================

      const payload = {
        text: formData.text,
        amount: Number(formData.amount),
        type: formData.type.toLowerCase(),
        date: formData.date || new Date().toISOString(),
        category: formData.category,
      };

      const res = await fetch(
        apiUrl("/transactions"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();

        console.error(
          "Transaction creation error:",
          errorData.detail
        );

        return;
      }

      const newTransaction = await res.json();

      // Immediately add to transaction list
      setTransactions((prev) => [
        newTransaction,
        ...prev,
      ]);

    } catch (err) {
      console.error("Transaction creation error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(apiUrl(`/transactions/${id}`), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (err) {
      alert("Error deleting transaction");
    }
  };

  const recurringTotals = useMemo(
    () =>
      recurringTransactions.reduce(
        (totals, transaction) => {
          const accruedAmount =
            getCompletedRecurringOccurrences(transaction) *
            Number(transaction.amount);

          totals[transaction.type as "income" | "expense"] += accruedAmount;
          return totals;
        },
        { income: 0, expense: 0 }
      ),
    [recurringTransactions]
  );

  const income =
    transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0) + recurringTotals.income;
  const expense =
    transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0) + recurringTotals.expense;
  const totalBalance = income - expense;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] dark:bg-[#10231f]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#edf7f2] pb-12 font-sans text-slate-900 transition-colors dark:bg-[#10231f] dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-emerald-200/80 bg-white/80 backdrop-blur-xl dark:border-emerald-900 dark:bg-emerald-950/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <Image
                src="/images/logo.jpg"
                alt="Monetra"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Monetra</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/charts">
              <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:shadow-md transition-all text-sm">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>View Analytics</span>
              </button>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition-all text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-emerald-900 px-7 py-10 text-white shadow-xl shadow-emerald-950/15 md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(110,231,183,0.25),_transparent_35%)]" />
          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Personal finance dashboard</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Hey {userName}!</h1>
            <p className="mt-3 max-w-2xl text-lg text-emerald-50/80">Get started by tracking your finances and taking control of your money.</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="flex-1 space-y-8">
          <SummaryCards balance={totalBalance} income={income} expense={expense} />
          <div className="grid xl:grid-cols-3 gap-8 items-start">
            <div className="xl:col-span-2"><TransactionForm onAdd={handleAdd} /></div>
            <div className="xl:col-span-1"><TransactionList transactions={transactions} onDelete={handleDelete} /></div>
          </div>
          <RecurringTransactionList
            transactions={recurringTransactions}
            onUpdate={(updatedTransaction) => {
              setRecurringTransactions((prev) =>
                prev.map((transaction) =>
                  transaction.id === updatedTransaction.id
                    ? updatedTransaction
                    : transaction
                )
              );
            }}
            onDelete={(id) => {
              setRecurringTransactions((prev) =>
                prev.filter((transaction) => transaction.id !== id)
              );
            }}
          />
          <FinancialInsights />
        </div>
      </div>
      <ChatBotPopup />
      <footer className="mt-12 border-t border-emerald-200 dark:border-emerald-900 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-2">
            <Link
              href="/privacy"
              className="text-sm text-slate-500 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              Privacy Policy
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2026 Monetra · Personal Finance Manager
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Built with Next.js, FastAPI & Supabase
          </p>
        </div>
      </footer>
    </main>
  );
}
