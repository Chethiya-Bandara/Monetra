"use client";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export default function FinancialInsights() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: "Give me a quick 3-bullet point summary of my recent spending and one suggestion. Also a section saying 'you've spent x% more on a category than last week' type stat." })
      });
      const data = await res.json();
      setInsight(data.reply);
    } catch (err) {
      setInsight("Unable to load insights at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsight(); }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-800 dark:text-white">Monetra AI Insights</h3>
        </div>
        <button onClick={fetchInsight} className="text-xs text-indigo-600 hover:underline">Refresh</button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your patterns...
        </div>
      ) : (
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {insight}
        </div>
      )}
    </div>
  );
}