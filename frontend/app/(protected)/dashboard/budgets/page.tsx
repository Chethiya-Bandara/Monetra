"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, CircleDollarSign, LayoutDashboard, LogOut, Pencil, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiUrl } from "@/lib/api";

const categories = ["Food", "Transport", "Entertainment", "Health", "Utilities", "General"] as const;
type Category = typeof categories[number];
type Budget = { id: string; category: Category; amount: number };
type Expense = { category: string; amount: number; type: string; date: string };
const money = (amount: number) => `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [category, setCategory] = useState<Category>("Food");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now] = useState(() => new Date());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([fetch(apiUrl("/budgets"), { headers }), fetch(apiUrl("/transactions"), { headers })])
      .then(async ([budgetResponse, transactionResponse]) => {
        if (!budgetResponse.ok || !transactionResponse.ok) throw new Error("Unable to load budgets and spending. Please try again.");
        const [budgetData, transactionData] = await Promise.all([budgetResponse.json(), transactionResponse.json()]);
        setBudgets(budgetData);
        setTransactions(transactionData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load budgets."))
      .finally(() => setLoading(false));
  }, []);

  const spending = useMemo(() => {
    const result: Record<string, number> = {};
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    for (const transaction of transactions) {
      if (transaction.type === "expense" && transaction.date.slice(0, 7) === month) {
        result[transaction.category] = (result[transaction.category] || 0) + Number(transaction.amount);
      }
    }
    return result;
  }, [transactions, now]);

  async function saveBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > 10_000_000 || !/^\d+(?:\.\d{1,2})?$/.test(amount)) {
      setError("Enter a limit greater than zero, up to Rs. 10,000,000, with at most two decimal places.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl("/budgets"), {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ category, amount: value }),
      });
      if (!response.ok) throw new Error("Unable to save the budget. Please try again.");
      const saved: Budget = await response.json();
      setBudgets((previous) => [...previous.filter((item) => item.category !== saved.category), saved]);
      setAmount(""); setNotice(`${saved.category} budget saved.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save the budget."); }
    finally { setSaving(false); }
  }

  async function deleteBudget(budget: Budget) {
    if (!window.confirm(`Delete the ${budget.category} budget?`)) return;
    setDeleting(budget.id); setError(""); setNotice("");
    try {
      const response = await fetch(apiUrl(`/budgets/${budget.id}`), { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("Unable to delete the budget. Please try again.");
      setBudgets((previous) => previous.filter((item) => item.id !== budget.id));
      setNotice(`${budget.category} budget deleted.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete the budget."); }
    finally { setDeleting(null); }
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand"><Image src="/images/logo.jpg" alt="Monetra" width={42} height={42} className="dashboard-logo" /><span>Monetra</span></div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href="/dashboard"><LayoutDashboard size={19} /> Dashboard</Link>
          <Link href="/dashboard/charts"><BarChart3 size={19} /> View Analytics</Link>
          <Link href="/dashboard/budgets" className="dashboard-nav-active" aria-current="page"><CircleDollarSign size={19} /> Budgets</Link>
        </nav>
        <div className="dashboard-sidebar-bottom"><p>PERSONAL FINANCE MANAGER</p><strong>A clearer view of your money.</strong><span>Track your progress, one transaction at a time.</span></div>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div><p className="dashboard-eyebrow">YOUR SPENDING PLAN</p><h1>Budgets</h1><p>Set monthly category limits and keep track of your spending.</p></div>
          <div className="dashboard-actions"><ThemeToggle /><button className="dashboard-logout" onClick={() => { localStorage.removeItem("token"); router.push("/"); }}><LogOut size={17} /> Logout</button></div>
        </header>
        {error && <p className="budget-message budget-error" role="alert">{error}</p>}
        {notice && <p className="budget-message" role="status">{notice}</p>}
        <div className="budget-layout">
          <section className="budget-panel">
            <div className="budget-heading"><div><p className="dashboard-eyebrow">MONTHLY LIMITS</p><h2>Budget Progress</h2><p>{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Recorded expenses</p></div></div>
            {loading ? <p className="budget-empty">Loading budgets...</p> : budgets.length === 0 ? <p className="budget-empty">No budgets yet. Set a monthly limit to get started.</p> : (
              <div className="budget-list">{[...budgets].sort((a, b) => a.category.localeCompare(b.category)).map((budget) => {
                const spent = spending[budget.category] || 0;
                const limit = Number(budget.amount);
                const percentage = spent / limit * 100;
                const over = spent > limit;
                return <article className="budget-item" key={budget.id}>
                  <div className="budget-item-top"><div><h3>{budget.category}</h3><p>{money(spent)} of {money(limit)}</p></div><div className="budget-item-actions"><button aria-label={`Edit ${budget.category} budget`} title="Edit budget" onClick={() => { setCategory(budget.category); setAmount(String(limit)); setError(""); setNotice(""); }}><Pencil size={16} /></button><button aria-label={`Delete ${budget.category} budget`} title="Delete budget" disabled={deleting === budget.id} onClick={() => deleteBudget(budget)}><Trash2 size={16} /></button></div></div>
                  <div className="budget-track" role="progressbar" aria-label={`${budget.category} budget used`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(percentage))}><span className={over ? "budget-over" : ""} style={{ width: `${Math.min(100, percentage)}%` }} /></div>
                  <div className="budget-item-bottom"><span>{percentage.toFixed(0)}% used</span><span className={over ? "budget-over-text" : ""}>{over ? `${money(spent - limit)} over budget` : `${money(limit - spent)} remaining`}</span></div>
                </article>;
              })}</div>
            )}
            <p className="budget-note">Limits repeat each month. Progress includes recorded expenses in this month; future recurring payments are not included until recorded.</p>
          </section>
          <section className="budget-panel budget-form-panel">
            <p className="dashboard-eyebrow">PLAN AHEAD</p><h2>Set a Budget</h2><p className="budget-description">Choose a category and set its monthly spending limit. Saving an existing category updates its limit.</p>
            <form onSubmit={saveBudget} className="budget-form">
              <label htmlFor="budget-category">Category</label><select id="budget-category" value={category} onChange={(event) => setCategory(event.target.value as Category)}>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <label htmlFor="budget-amount">Monthly limit (LKR)</label><input id="budget-amount" type="number" min="0.01" max="10000000" step="0.01" required placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} />
              <button type="submit" disabled={saving || loading}>{saving ? "Saving..." : "Save Budget"}</button>
            </form>
          </section>
        </div>
        <footer className="dashboard-footer"><span>© 2026 Monetra · Personal Finance Manager</span><Link href="/privacy">Privacy Policy</Link><span>Built with Next.js, FastAPI &amp; Supabase</span></footer>
      </div>
    </main>
  );
}
