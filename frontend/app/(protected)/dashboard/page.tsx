"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import SummaryCards from "../../../components/SummaryCards";
import TransactionForm from "../../../components/TransactionForm";
import TransactionList from "../../../components/TransactionList";
import ChatBot from "../../../components/ChatBot";
import { Wallet, LogOut, Loader2 } from "lucide-react"; 
import { ThemeToggle } from "../../../components/ThemeToggle";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8000/transactions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
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
    
    const payload = {
      text: formData.text,
      amount: Number(formData.amount),
      type: formData.type.toLowerCase(),
      date: formData.date || new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Validation Error:", errorData.detail);
        return;
      }

      const newTransaction = await res.json();
      setTransactions(prev => [newTransaction, ...prev]);
      
    } catch (err) {
      console.error("Network Error:", err);
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Monetra</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard/charts">
              <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:shadow-md transition-all text-sm">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>View Analytics</span>
              </button>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition-all text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar: ChatBot */}
        <aside className="lg:w-80 w-full shrink-0 sticky top-24 self-start">
          <ChatBot />
        </aside>

        {/* Right Content: Stats and Transactions */}
        <div className="flex-1 space-y-8">
          <SummaryCards balance={totalBalance} income={income} expense={expense} />
          <div className="grid xl:grid-cols-3 gap-8 items-start">
            <div className="xl:col-span-1"><TransactionForm onAdd={handleAdd} /></div>
            <div className="xl:col-span-2"><TransactionList transactions={transactions} onDelete={handleDelete} /></div>
          </div>
        </div>
      </div>
    </main>
  );
}