"use client";
import { useState } from "react";
import { PlusCircle, Tag, Calendar, RefreshCw } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Health", "Utilities", "General"];
const FREQUENCIES = ["daily", "weekly", "monthly"];

export default function TransactionForm({ onAdd }: any) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState<'income' | 'expense'>("expense");
  
  // Recurring States
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [endDate, setEndDate] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      id: crypto.randomUUID(),
      text,
      category,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    // If recurring, add the extra fields
    const finalData = isRecurring 
      ? { ...baseData, frequency, end_date: endDate || null, is_recurring: true }
      : { ...baseData, is_recurring: false };

    onAdd(finalData);
    
    // Reset form
    setText(""); 
    setAmount("");
    setCategory("General");
    setEndDate("");
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Transaction</h3>
        
        {/* Recurring Toggle */}
        <button 
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isRecurring 
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-500/30" 
              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecurring ? "animate-spin-slow" : ""}`} />
          {isRecurring ? "Recurring Active" : "One-time"}
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
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
          <input 
            type="text" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Description (e.g., Rent, Netflix)" 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" 
            required 
          />

          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
             </div>

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

          {/* Conditional Recurring Fields */}
          {isRecurring && (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100/50 dark:border-indigo-500/10 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 mb-2 block">Frequency</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        frequency === f 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" 
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 mb-2 block">End Date (Optional)</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]">
          <PlusCircle className="w-5 h-5" /> 
          {isRecurring ? "Set Recurring Plan" : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}