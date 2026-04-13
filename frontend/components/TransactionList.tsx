import { Transaction } from "@/types";
import { Trash2, TrendingDown, TrendingUp, ReceiptText } from "lucide-react";

export default function TransactionList({ transactions, onDelete }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
          {transactions.length} total
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ReceiptText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions yet.</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Add one to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3 custom-scrollbar overflow-y-auto max-h-[500px] pr-2">
          {transactions.map((t: Transaction) => (
            <li 
              key={t.id} 
              className="group flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  t.type === 'income' 
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                    : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500'
                }`}>
                  {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.text}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`font-bold text-lg ${
                  t.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
                <button 
                  onClick={() => onDelete(t.id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}