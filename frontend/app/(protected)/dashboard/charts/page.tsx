"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Transaction {
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export default function ChartsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Transformation Logic: Groups transactions by date
  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; income: number; expense: number }> = {};

    transactions.forEach((t) => {
      // Format date to "MM/DD" or "Day"
      const dateKey = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!groups[dateKey]) {
        groups[dateKey] = { name: dateKey, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        groups[dateKey].income += t.amount;
      } else {
        groups[dateKey].expense += t.amount;
      }
    });

    // Return as array and sort by standard day order if needed
    return Object.values(groups);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Analytics</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-slate-700 dark:text-slate-200">Daily Performance</h3>
          
          {chartData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff' 
                    }}
                  />
                  <Legend verticalAlign="top" align="right" height={36}/>
                  <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Income" barSize={32} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl">
              <p className="text-slate-500 text-sm">No transaction data available for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}