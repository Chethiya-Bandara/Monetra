"use client";

import { useState } from "react";
import {
  RefreshCw,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Tag,
} from "lucide-react";

interface RecurringTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  frequency: string;
  category: string;
  description: string;
  start_date: string;
  end_date?: string | null;
}

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[];
  onUpdate?: (transaction: RecurringTransaction) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Health",
  "Utilities",
  "General",
];

const FREQUENCIES = ["daily", "weekly", "monthly"];

export default function RecurringTransactionList({
  transactions,
  onUpdate,
  onDelete,
}: RecurringTransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editData, setEditData] = useState<{
    description: string;
    amount: string;
    type: "income" | "expense";
    frequency: string;
    category: string;
    start_date: string;
    end_date: string;
  }>({
    description: "",
    amount: "",
    type: "expense",
    frequency: "monthly",
    category: "General",
    start_date: "",
    end_date: "",
  });

  const formatCurrency = (amount: number) => {
    return `Rs. ${Number(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const startEditing = (transaction: RecurringTransaction) => {
    setEditingId(transaction.id);

    setEditData({
      description: transaction.description || "",
      amount: String(transaction.amount),
      type: transaction.type,
      frequency: transaction.frequency,
      category: transaction.category,
      start_date: transaction.start_date
        ? transaction.start_date.substring(0, 10)
        : "",
      end_date: transaction.end_date
        ? transaction.end_date.substring(0, 10)
        : "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    if (!editData.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!editData.amount || Number(editData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setSavingId(id);

    try {
      const payload = {
        amount: Number(editData.amount),
        type: editData.type,
        frequency: editData.frequency,
        category: editData.category,
        description: editData.description,
        start_date: editData.start_date,
        end_date: editData.end_date || null,
      };

      const res = await fetch(
        `http://localhost:8000/recurring-transactions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail || "Failed to update recurring transaction."
        );
      }

      const updatedTransaction = await res.json();

      onUpdate?.(updatedTransaction);

      setEditingId(null);
    } catch (error) {
      console.error("Update error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update recurring transaction."
      );
    } finally {
      setSavingId(null);
    }
  };

  const deleteTransaction = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recurring transaction?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(
        `http://localhost:8000/recurring-transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail || "Failed to delete recurring transaction."
        );
      }

      onDelete?.(id);
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete recurring transaction."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Recurring Transactions
            </h3>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your scheduled income and expenses
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          {transactions.length}{" "}
          {transactions.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <div className="p-10 text-center">
          <RefreshCw className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />

          <p className="font-medium text-slate-600 dark:text-slate-300">
            No recurring transactions
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Add a recurring income or expense to see it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">

          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >

              {editingId === transaction.id ? (
                /* ================= EDIT MODE ================= */
                <div className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Description
                      </label>

                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Amount
                      </label>

                      <input
                        type="number"
                        step="0.01"
                        value={editData.amount}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            amount: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Type
                      </label>

                      <select
                        value={editData.type}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            type: e.target.value as "income" | "expense",
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Category
                      </label>

                      <div className="relative">
                        <select
                          value={editData.category}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              category: e.target.value,
                            })
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        <Tag className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Frequency
                      </label>

                      <select
                        value={editData.frequency}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            frequency: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 capitalize"
                      >
                        {FREQUENCIES.map((frequency) => (
                          <option key={frequency} value={frequency}>
                            {frequency}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        Start Date
                      </label>

                      <input
                        type="date"
                        value={editData.start_date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            start_date: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                        End Date
                      </label>

                      <input
                        type="date"
                        value={editData.end_date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            end_date: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                  </div>

                  {/* Edit Buttons */}
                  <div className="flex justify-end gap-2 pt-2">

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={savingId === transaction.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => saveEdit(transaction.id)}
                      disabled={savingId === transaction.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
                    >
                      {savingId === transaction.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>

                  </div>

                </div>

              ) : (
                /* ================= VIEW MODE ================= */
                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-4 min-w-0">

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        transaction.type === "income"
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                          : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0">

                      <p className="font-semibold text-slate-800 dark:text-white truncate">
                        {transaction.description || "Recurring transaction"}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">

                        <span className="capitalize">
                          {transaction.frequency}
                        </span>

                        <span>•</span>

                        <span>
                          {transaction.category}
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.start_date)}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-4 shrink-0">

                    <div className="text-right">

                      <p
                        className={`font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-500"
                            : "text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-1">
                        {transaction.type}
                      </p>

                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => startEditing(transaction)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                      title="Edit recurring transaction"
                      aria-label="Edit recurring transaction"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => deleteTransaction(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition disabled:opacity-50"
                      title="Delete recurring transaction"
                      aria-label="Delete recurring transaction"
                    >
                      {deletingId === transaction.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                  </div>

                </div>
              )}

              {/* End Date */}
              {editingId !== transaction.id && transaction.end_date && (
                <div className="mt-3 ml-15 text-xs text-slate-400 dark:text-slate-500">
                  Ends on {formatDate(transaction.end_date)}
                </div>
              )}

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
