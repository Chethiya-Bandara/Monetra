"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Sparkles,
  LogOut,
} from "lucide-react";

import Image from "next/image";

import { ThemeToggle } from "../../../../components/ThemeToggle";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  Pie,
  Cell,
  PieChart,
  LineChart,
  Line,
} from "recharts";

interface Transaction {
  id?: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
  description?: string;
  text?: string;
}

export default function ChartsPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#ff0000",
    "#eaff00",
    "#2600ff",
    "#00ff2f",
    "#ff02f2",
    "#ffbf00",
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(apiUrl("/transactions"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }

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


  const formatCurrency = (amount: number) => {
    return `Rs. ${Number(amount).toLocaleString("en-LK", {
      maximumFractionDigits: 0,
    })}`;
  };

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpense) / totalIncome) * 100
      : 0;

  const transactionCount = transactions.length;

  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === "expense");
  }, [transactions]);

  const averageExpense =
    expenseTransactions.length > 0
      ? totalExpense / expenseTransactions.length
      : 0;

  const weeklyFlowData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        date,
        name: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        income: 0,
        expense: 0,
      });
    }

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);

      transactionDate.setHours(0, 0, 0, 0);

      const day = days.find(
        (d) => d.date.getTime() === transactionDate.getTime()
      );

      if (day) {
        if (transaction.type === "income") {
          day.income += Number(transaction.amount);
        } else {
          day.expense += Number(transaction.amount);
        }
      }
    });

    return days;
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const groups: Record<
      string,
      {
        name: string;
        income: number;
        expense: number;
      }
    > = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const name = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!groups[key]) {
        groups[key] = {
          name,
          income: 0,
          expense: 0,
        };
      }

      if (transaction.type === "income") {
        groups[key].income += Number(transaction.amount);
      } else {
        groups[key].expense += Number(transaction.amount);
      }
    });

    return Object.values(groups);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categories[t.category] =
          (categories[t.category] || 0) + Number(t.amount);
      });

    const total = Object.values(categories).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topExpenses = useMemo(() => {
    return [...transactions]
      .filter((t) => t.type === "expense")
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
  }, [transactions]);

  const largestExpense = topExpenses[0]?.amount || 0;

  const cumulativeData = useMemo(() => {
    let runningBalance = 0;

    return [...transactions]
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .map((transaction) => {
        runningBalance +=
          transaction.type === "income"
            ? Number(transaction.amount)
            : -Number(transaction.amount);

        return {
          date: new Date(transaction.date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),
          balance: runningBalance,
        };
      });
  }, [transactions]);

  const spendingTrendData = useMemo(() => {
    const days = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        date,
        name: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        expense: 0,
      });
    }

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const transactionDate = new Date(transaction.date);

      transactionDate.setHours(0, 0, 0, 0);

      const day = days.find(
        (d) => d.date.getTime() === transactionDate.getTime()
      );

      if (day) {
        day.expense += Number(transaction.amount);
      }
    });

    return days;
  }, [transactions]);

  const weekdayData = useMemo(() => {
    const days = [
      { name: "Sun", expense: 0 },
      { name: "Mon", expense: 0 },
      { name: "Tue", expense: 0 },
      { name: "Wed", expense: 0 },
      { name: "Thu", expense: 0 },
      { name: "Fri", expense: 0 },
      { name: "Sat", expense: 0 },
    ];

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = new Date(t.date).getDay();

        days[day].expense += Number(t.amount);
      });

    return days;
  }, [transactions]);

  const financialInsights = useMemo(() => {
    const insights: string[] = [];

    if (totalIncome === 0) {
      insights.push(
        "Add an income transaction to start generating financial insights."
      );

      return insights;
    }

    if (categoryData.length > 0) {
      const topCategory = categoryData[0];

      insights.push(
        `Your largest spending category is ${topCategory.name}, accounting for ${topCategory.percentage.toFixed(
          1
        )}% of your expenses.`
      );
    }

    if (savingsRate > 0) {
      insights.push(
        `You currently retain ${savingsRate.toFixed(
          1
        )}% of your income after expenses.`
      );
    } else {
      insights.push(
        "Your expenses currently exceed your recorded income."
      );
    }

    if (topExpenses.length > 0) {
      insights.push(
        `Your largest recorded expense is ${formatCurrency(
          Number(topExpenses[0].amount)
        )}.`
      );
    }

    if (averageExpense > 0) {
      insights.push(
        `Your average expense is ${formatCurrency(
          averageExpense
        )}.`
      );
    }

    return insights;
  }, [
    totalIncome,
    savingsRate,
    categoryData,
    topExpenses,
    averageExpense,
  ]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6] dark:bg-[#10231f]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-[#edf7f2] pb-12 font-sans text-emerald-950 transition-colors dark:bg-[#10231f] dark:text-emerald-50">

      {/* TOP NAVBAR */}
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

            <h1 className="text-xl font-bold text-emerald-900 dark:text-white tracking-tight">
              Monetra
            </h1>
          </div>

          <div className="flex items-center gap-4">

            <ThemeToggle />

            <Link href="/dashboard/">
              <button className="flex items-center gap-2 bg-white dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-800 hover:shadow-md transition-all text-sm">
                <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Back to Dashboard</span>
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-rose-600 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-b from-emerald-100/50 via-[#edf7f2] to-[#edf7f2] p-4 dark:from-emerald-950/30 dark:via-[#10231f] dark:to-[#10231f] md:p-8">

        <div className="max-w-6xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-emerald-900 px-7 py-9 text-white shadow-xl shadow-emerald-950/15 sm:flex sm:flex-row sm:items-center sm:gap-4 md:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(110,231,183,0.25),_transparent_35%)]" />

            <div className="relative flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Analytics overview</p>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Financial Analytics
              </h1>

              <p className="mt-2 text-sm text-emerald-50/80">
                Understand your financial activity and spending patterns
              </p>
            </div>

          </div>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* Income */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-950/5 dark:border-emerald-900/50 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Total Income
                </p>

                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>

              </div>

              <h2 className="text-2xl font-bold mt-3 text-emerald-950 dark:text-white">
                {formatCurrency(totalIncome)}
              </h2>

            </div>

            {/* Expenses */}
            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm shadow-rose-950/5 dark:border-rose-900/50 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Total Expenses
                </p>

                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950">
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                </div>

              </div>

              <h2 className="text-2xl font-bold mt-3 text-emerald-950 dark:text-white">
                {formatCurrency(totalExpense)}
              </h2>

            </div>

            {/* Balance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900">

              <div className="flex items-center justify-between">

                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Net Balance
                </p>

                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>

              </div>

              <h2 className="text-2xl font-bold mt-3 text-emerald-950 dark:text-white">
                {formatCurrency(netBalance)}
              </h2>

            </div>

            {/* Savings */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/15 dark:border-emerald-700 dark:bg-emerald-900">

              <div className="flex items-center justify-between">

                <p className="text-sm text-emerald-50">
                  Savings Rate
                </p>

                <div className="p-2 rounded-lg bg-white/15">
                  <Receipt className="w-5 h-5 text-white" />
                </div>

              </div>

              <h2 className="text-2xl font-bold mt-3 text-white">
                {savingsRate.toFixed(1)}%
              </h2>

            </div>

          </div>

          {/* LAST 7 DAYS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
              Last 7 Days
            </h3>

            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              Daily income and expense activity
            </p>

            <div className="h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={weeklyFlowData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#d1fae5"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="income"
                    fill="#059669"
                    name="Income"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="expense"
                    fill="#f43f5e"
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* MONTHLY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
              Monthly Income vs Expenses
            </h3>

            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              Compare your income and spending over time
            </p>

            <div className="h-[350px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={monthlyData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="income"
                    fill="#059669"
                    name="Income"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="expense"
                    fill="#f43f5e"
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* CATEGORY + TOP EXPENSES */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Categories */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
                Spending by Category
              </h3>

              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                Where your money is going
              </p>

              <div className="h-[350px]">

                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>

                    <Pie
                      data={categoryData}
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >

                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}

                    </Pie>

                    <Tooltip />

                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* Top Expenses */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
                Top 5 Expenses
              </h3>

              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
                Your largest individual expenses
              </p>

              <div className="space-y-5">

                {topExpenses.length === 0 ? (

                  <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                    No expenses recorded yet.
                  </p>

                ) : (

                  topExpenses.map((transaction, index) => (

                    <div
                      key={transaction.id ?? index}
                      className="flex items-center justify-between"
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-medium text-emerald-950 dark:text-white">
                            {transaction.description ||
                              transaction.text ||
                              "Expense"}
                          </p>

                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            {transaction.category}
                          </p>

                        </div>

                      </div>

                      <p className="font-semibold text-rose-500">
                        {formatCurrency(Number(transaction.amount))}
                      </p>

                    </div>

                  ))

                )}

              </div>

            </div>

          </div>

          {/* NET BALANCE */}

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">

            <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
              Net Balance Trajectory
            </h3>

            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              How your balance has changed across transactions
            </p>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={cumulativeData}>

                  <defs>

                    <linearGradient
                      id="colorBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#059669"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor="#059669"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* 30 DAY TREND */}

          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">

            <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
              30-Day Spending Trend
            </h3>

            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              Daily spending activity during the last 30 days
            </p>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={spendingTrendData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={false}
                    name="Expenses"
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* WEEKDAY + STATISTICS */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Weekday */}

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <h3 className="text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
                Spending by Day of Week
              </h3>

              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
                Which days tend to have the highest spending
              </p>

              <div className="h-[300px]">

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={weekdayData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="expense"
                      fill="#f43f5e"
                      name="Expenses"
                      radius={[4, 4, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* Statistics */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <h3 className="text-lg font-semibold mb-6 text-emerald-900 dark:text-emerald-100">
                Transaction Statistics
              </h3>

              <div className="space-y-6">

                <div>

                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Total Transactions
                  </p>

                  <p className="text-2xl font-bold mt-1 text-emerald-950 dark:text-white">
                    {transactionCount}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Average Expense
                  </p>

                  <p className="text-2xl font-bold mt-1 text-emerald-950 dark:text-white">
                    {formatCurrency(averageExpense)}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Largest Expense
                  </p>

                  <p className="text-2xl font-bold mt-1 text-rose-500">
                    {formatCurrency(Number(largestExpense))}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* FINANCIAL INSIGHTS */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">

            <h3 className="flex items-center gap-2 text-lg font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Financial Insights
            </h3>

            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              Automatically generated observations from your transaction data
            </p>

            <div className="space-y-3">

              {financialInsights.map((insight, index) => (

                <div
                  key={index}
                  className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800"
                >
                  {insight}
                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
