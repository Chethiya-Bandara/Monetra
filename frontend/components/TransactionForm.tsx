"use client";
import { useState } from "react";
import { localDateString } from "@/lib/dates";
import { PlusCircle, Tag, Calendar, RefreshCw } from "lucide-react";

const CATEGORIES = ["Food", "Transport", "Entertainment", "Health", "Utilities", "General"];
const FREQUENCIES = ["daily", "weekly", "monthly"];

export interface TransactionFormData {
  text: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  is_recurring: boolean;
  frequency?: string;
  end_date?: string | null;
}

export default function TransactionForm({ onAdd }: { onAdd: (data: TransactionFormData) => Promise<void> }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState<'income' | 'expense'>("expense");
  
  // Recurring States
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    if (saving) return;
    e.preventDefault();
    
    const baseData = {
      text,
      category,
      amount: parseFloat(amount),
      type,
      date: localDateString(),
    };

    // If recurring, add the extra fields
    const finalData = isRecurring 
      ? { ...baseData, frequency, end_date: endDate || null, is_recurring: true }
      : { ...baseData, is_recurring: false };

    setSaving(true);
    setError("");
    try {
      await onAdd(finalData);
      setText("");
      setAmount("");
      setCategory("General");
      setEndDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-panel h-full bg-white dark:bg-[#0d3329] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-[#1c4a3b] transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Transaction</h3>
        
        {/* Recurring Toggle */}
        <button 
          type="button"
          onClick={() => setIsRecurring(!isRecurring)}
          disabled={saving}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isRecurring 
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-indigo-200 dark:ring-emerald-500/30" 
              : "bg-slate-100 text-slate-500 dark:bg-emerald-800"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecurring ? "animate-spin-slow" : ""}`} />
          {isRecurring ? "Recurring Active" : "One-time"}
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
        <div className="flex p-1 bg-slate-100 dark:bg-[#16473a] rounded-xl">
          {(['expense', 'income'] as const).map((t) => (
            <button 
              key={t} 
              type="button" 
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                type === t 
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600 dark:text-emerald-400" 
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
            className="w-full rounded-xl border border-slate-200 dark:border-[#1c4a3b] bg-slate-50 dark:bg-[#16473a] px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
            required 
          />

          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-[#1c4a3b] bg-slate-50 dark:bg-[#16473a] px-4 py-3 pr-10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
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
                placeholder="0.00 (LKR)" 
                className="w-full rounded-xl border border-slate-200 dark:border-[#1c4a3b] bg-slate-50 dark:bg-[#16473a] px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono" 
                required 
              />
          </div>

          {/* Conditional Recurring Fields */}
          {isRecurring && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100/50 dark:border-indigo-500/10 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-2 block">Frequency</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        frequency === f 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none" 
                          : "bg-white dark:bg-emerald-800 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-2 block">End Date (Optional)</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#16473a] px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]">
          <PlusCircle className="w-5 h-5" /> 
          {saving ? "Saving..." : isRecurring ? "Set Recurring Plan" : "Add Transaction"}
        </button>
        </fieldset>
      </form>
    </div>
  );
}
