"use client";
import { useState } from "react";
import { PlusCircle, Tag } from "lucide-react";

// The categories we defined in our SQL check constraint
const CATEGORIES = [
  "Food", 
  "Transport", 
  "Entertainment", 
  "Health", 
  "Utilities", 
  "General"
];

export default function TransactionForm({ onAdd }: any) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState<'income' | 'expense'>("expense");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      id: crypto.randomUUID(), 
      text, 
      category,
      amount: parseFloat(amount), 
      type, 
      date: new Date().toISOString() 
    });
    
    // Reset form
    setText(""); 
    setAmount("");
    setCategory("General");
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">New Transaction</h3>
      <form onSubmit={submit} className="space-y-5">
        
        {/* Segmented Control for Income/Expense */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['expense', 'income'] as const).map((t) => (
            <button 
              key={t} 
              type="button" 
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                type === t 
                  ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Description Input */}
          <input 
            type="text" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Description (e.g., Groceries)" 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" 
            required 
          />

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom arrow icon for the dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>

          {/* Amount Input */}
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="0.00" 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono" 
            required 
          />
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]">
          <PlusCircle className="w-5 h-5" /> Add Transaction
        </button>
      </form>
    </div>
  );
}