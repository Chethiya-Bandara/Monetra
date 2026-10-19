"use client";

import RecurringTransactionList from "../../../components/RecurringTransactionList";
import ChatBotPopup from "../../../components/ChatBotPopup";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";
import SummaryCards from "../../../components/SummaryCards";
import TransactionForm, { TransactionFormData } from "../../../components/TransactionForm";
import TransactionList from "../../../components/TransactionList";
import FinancialInsights from "../../../components/FinancialInsights";
import { LayoutDashboard, LogOut, BarChart3, ArrowUpRight, CircleDollarSign } from "lucide-react"; 
import { ThemeToggle } from "../../../components/ThemeToggle";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { apiUrl } from "@/lib/api";
import { localDateString, parseLocalDate } from "@/lib/dates";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [userName, setUserName] = useState("there");
  const [loadError, setLoadError] = useState("");

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
          apiUrl(`/transactions?today=${localDateString()}`),
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (!transactionRes.ok) throw new Error("Unable to load transactions. Please reload the page.");
        const data = await transactionRes.json();
        setTransactions(data);


        // Load recurring transactions
        const recurringRes = await fetch(
          apiUrl("/recurring-transactions"),
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (!recurringRes.ok) throw new Error("Unable to load recurring transactions. Please reload the page.");
        const recurringData = await recurringRes.json();
        setRecurringTransactions(recurringData);

      } catch (err) {
        console.error("Failed to fetch:", err);
        setLoadError(err instanceof Error ? err.message : "Unable to load your data. Please reload the page.");
      }
    };

    loadData();
  }, []);

  const handleAdd = async (formData: TransactionFormData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Your session has expired. Please sign in again.");
    const recurring = formData.is_recurring;
    const payload = recurring ? {
      amount: formData.amount, type: formData.type, frequency: formData.frequency,
      category: formData.category, description: formData.text,
      start_date: formData.date, end_date: formData.end_date || null,
    } : {
      text: formData.text, amount: formData.amount, type: formData.type,
      date: formData.date, category: formData.category,
    };
    let response: Response;
    try {
      response = await fetch(apiUrl(recurring ? "/recurring-transactions" : "/transactions"), {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Could not reach the server. Please check your connection and try again.");
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(typeof body?.detail === "string" ? body.detail : "Unable to save transaction. Please check the details and try again.");
    }
    const result = await response.json();
    if (recurring) {
      setRecurringTransactions((prev) => [result.recurring, ...prev]);
      setTransactions((prev) => [result.transaction, ...prev]);
    } else {
      setTransactions((prev) => [result, ...prev]);
    }
  };

  const refreshTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl(`/transactions?today=${localDateString()}`), { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Unable to refresh transactions.");
      setTransactions(await response.json());
    } catch {
      alert("Unable to refresh transactions. Please reload the page.");
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

  const income =
    transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  const expense =
    transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalBalance = income - expense;

  const recentFlow = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const totals = transactions.reduce((result, transaction) => {
      const date = parseLocalDate(transaction.date);
      if (date >= day && date < nextDay) result[transaction.type] += Number(transaction.amount);
      return result;
    }, { income: 0, expense: 0 });
    return { name: day.toLocaleDateString("en-US", { weekday: "short" }), ...totals };
  }), [transactions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <Image src="/images/logo.jpg" alt="Monetra" width={42} height={42} className="dashboard-logo" />
          <span>Monetra</span>
        </div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a href="#overview" className="dashboard-nav-active"><LayoutDashboard size={19} /> Dashboard</a>
          <Link href="/dashboard/charts"><BarChart3 size={19} /> View Analytics</Link>
          <Link href="/dashboard/budgets"><CircleDollarSign size={19} /> Budgets</Link>
        </nav>
        <div className="dashboard-sidebar-bottom">
          <p>PERSONAL FINANCE MANAGER</p>
          <strong>A clearer view of your money.</strong>
          <span>Track your progress, one transaction at a time.</span>
        </div>
      </aside>

      <div className="dashboard-content" id="overview">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">YOUR FINANCIAL OVERVIEW</p>
            <h1>Hello, {userName}!</h1>
            <p>Get started by tracking your finances and taking control of your money.</p>
          </div>
          <div className="dashboard-actions">
            <ThemeToggle />
            <Link href="/dashboard/charts" className="dashboard-analytics">View Analytics <ArrowUpRight size={16} /></Link>
            <button onClick={handleLogout} className="dashboard-logout"><LogOut size={17} /> Logout</button>
          </div>
        </header>

        {loadError && <p role="alert" className="budget-message budget-error">{loadError}</p>}
        <section className="dashboard-section" aria-label="Financial overview">
          <div className="dashboard-section-heading"><div><p className="dashboard-eyebrow">AT A GLANCE</p><h2>Overview</h2></div><span>Your finances, all in one place</span></div>
          <SummaryCards balance={totalBalance} income={income} expense={expense} />
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-flow dashboard-panel" aria-label="Last 7 Days">
            <div className="dashboard-flow-header">
              <div><h2>Last 7 Days</h2><p>Daily income and expense activity</p></div>
              <Link href="/dashboard/charts" className="dashboard-flow-link">View Analytics <ArrowUpRight size={15} /></Link>
            </div>
            <div className="dashboard-flow-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentFlow} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="dashboardIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#21d39a" stopOpacity={0.25} /><stop offset="95%" stopColor="#21d39a" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="var(--dash-border)" strokeDasharray="3 5" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--dash-muted)", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} width={45} tick={{ fill: "var(--dash-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--dash-panel)", border: "1px solid var(--dash-border)", borderRadius: 10, color: "var(--dash-text)" }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#21c992" fill="url(#dashboardIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expenses" stroke="#f08073" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <div className="dashboard-activity"><TransactionList transactions={transactions} onDelete={handleDelete} /></div>
          <div className="dashboard-form"><TransactionForm onAdd={handleAdd} /></div>
          <div className="dashboard-recurring"><RecurringTransactionList
            transactions={recurringTransactions}
            onUpdate={(updatedTransaction) => {
              setRecurringTransactions((prev) => prev.map((transaction) => transaction.id === updatedTransaction.id ? updatedTransaction : transaction));
              void refreshTransactions();
            }}
            onDelete={(id) => {
              setRecurringTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
              void refreshTransactions();
            }}
          /></div>
          <div className="dashboard-insights"><FinancialInsights /></div>
        </div>
        <ChatBotPopup />
        <footer className="dashboard-footer">
          <span>© 2026 Monetra · Personal Finance Manager</span>
          <Link href="/privacy">Privacy Policy</Link>
          <span>Built with Next.js, FastAPI &amp; Supabase</span>
        </footer>
      </div>
    </main>
  );
}
