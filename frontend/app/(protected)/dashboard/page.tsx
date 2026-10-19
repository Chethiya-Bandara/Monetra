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
import { LayoutDashboard, LogOut, BarChart3, ArrowUpRight, CircleDollarSign } from "lucide-react"; 
import { ThemeToggle } from "../../../components/ThemeToggle";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { apiUrl } from "@/lib/api";
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

  const recentFlow = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    const totals = transactions.reduce((result, transaction) => {
      const date = new Date(transaction.date);
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
            }}
            onDelete={(id) => {
              setRecurringTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
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
