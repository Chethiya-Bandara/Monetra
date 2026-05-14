"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area, 
  Pie, Cell, PieChart, ComposedChart, Line 
} from "recharts";

interface Transaction {
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  description: string;
}

export default function ChartsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#4f46e5', '#f43f5e', '#04ff5c', '#f59e0b', '#00fff7'];

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8000/transactions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const dateKey = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!groups[dateKey]) groups[dateKey] = { name: dateKey, income: 0, expense: 0 };
      if (t.type === 'income') groups[dateKey].income += t.amount;
      else groups[dateKey].expense += t.amount;
    });
    return Object.values(groups);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const cumulativeData = useMemo(() => {
    let runningBalance = 0;
    return [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => {
        runningBalance += (t.type === 'income' ? t.amount : -t.amount);
        return {
          date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: runningBalance
        };
      });
  }, [transactions]);

  const cumulativeSpending = useMemo(() => {
    let totalSpent = 0;
    return [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(t => t.type === 'expense') // Only track expenses for burn rate
      .map(t => {
        totalSpent += t.amount;
        return {
          date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          expense: totalSpent
        };
      });
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all border border-transparent dark:border-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Analytics</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-slate-700 dark:text-slate-200">Weekly Flow</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" align="right" />
                  <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Income" barSize={32} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-slate-700 dark:text-slate-200">Top Categories</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-700 dark:text-slate-200">Net Balance Trajectory</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-700 dark:text-slate-200">Cumulative Burn Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeSpending}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e2e2" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}