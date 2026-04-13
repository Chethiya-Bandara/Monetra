"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import SummaryCards from "../../../components/SummaryCards";
import TransactionForm from "../../../components/TransactionForm";
import TransactionList from "../../../components/TransactionList";
import { Wallet, LogOut, Loader2 } from "lucide-react"; 
import { ThemeToggle } from "../../../components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Transactions from FastAPI on Load
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

  // 2. Save New Transaction to Database
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

  // 3. Delete from Database
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

  // --- Calculations (Keep these, they run on the fetched data) ---
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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">FinTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition-all text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        <SummaryCards balance={totalBalance} income={income} expense={expense} />
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1"><TransactionForm onAdd={handleAdd} /></div>
          <div className="lg:col-span-2"><TransactionList transactions={transactions} onDelete={handleDelete} /></div>
        </div>
      </div>
    </main>
  );
}