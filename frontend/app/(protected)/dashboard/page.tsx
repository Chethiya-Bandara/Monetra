"use client";

import RecurringTransactionList from "../../../components/RecurringTransactionList";
import ChatBotPopup from "../../../components/ChatBotPopup";
import { useState, useEffect } from "react";
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

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);
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
          "http://localhost:8000/transactions",
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
          "http://localhost:8000/recurring-transactions",
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
          start_date: formData.date || new Date().toISOString(),
          end_date: formData.end_date || null,
        };

        const recurringRes = await fetch(
          "http://localhost:8000/recurring-transactions",
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
          date: formData.date || new Date().toISOString(),
          category: formData.category,
        };

        const transactionRes = await fetch(
          "http://localhost:8000/transactions",
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
        "http://localhost:8000/transactions",
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
      const res = await fetch(`http://localhost:8000/transactions/${id}`, {
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

  const totalBalance = transactions.reduce((acc, t) => t.type === "income" ? acc + t.amount : acc - t.amount, 0);
  const income = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white/30 dark:bg-emerald-900/30 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md">
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

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="py-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hey {userName}!
          </h1>

          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
            Get started by tracking your finances and taking control of your money.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8">
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
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-2">
            <Link
              href="/privacy"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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