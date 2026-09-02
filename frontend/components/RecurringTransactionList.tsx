"use client";

import {
  RefreshCw,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
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
}

export default function RecurringTransactionList({
  transactions,
}: RecurringTransactionListProps) {

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

          <p className="text-sm text-slate-400 mt-1">
            Add a recurring income or expense to see it here.
          </p>

        </div>

      ) : (

        /* Transaction List */
        <div className="divide-y divide-slate-100 dark:divide-slate-800">

          {transactions.map((transaction) => (

            <div
              key={transaction.id}
              className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4 min-w-0">

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      transaction.type === "income"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600"
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


                {/* Amount */}
                <div className="text-right shrink-0">

                  <p
                    className={`font-bold ${
                      transaction.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>

                  <p className="text-xs text-slate-400 capitalize mt-1">
                    {transaction.type}
                  </p>

                </div>

              </div>


              {/* End Date */}
              {transaction.end_date && (
                <div className="mt-3 ml-15 text-xs text-slate-400">
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