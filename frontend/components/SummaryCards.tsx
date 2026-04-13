import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expense: number;
}

export default function SummaryCards({ balance, income, expense }: SummaryCardsProps) {
  const format = (val: number) => 
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Balance Card - High Contrast Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-slate-900 p-6 rounded-2xl shadow-xl shadow-indigo-200/50 dark:shadow-none text-white transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-indigo-100/80 dark:text-indigo-200 text-sm font-medium uppercase tracking-wider">
              Total Balance
            </p>
            <h3 className="text-3xl font-bold mt-2 tracking-tight">
              ${format(balance)}
            </h3>
          </div>
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Income Card - Subtle Glassmorphism in Dark Mode */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
              Total Income
            </p>
            <h3 className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">
              <span className="text-emerald-600 dark:text-emerald-500 mr-1">+</span>
              ${format(income)}
            </h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl">
            <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Expense Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
              Total Expenses
            </p>
            <h3 className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">
              <span className="text-rose-600 dark:text-rose-500 mr-1">-</span>
              ${format(expense)}
            </h3>
          </div>
          <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl">
            <ArrowDownRight className="w-6 h-6 text-rose-600 dark:text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}