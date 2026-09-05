"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function FinancialInsights() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    setInsight("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message:
            "Give me a quick 3-bullet point summary of my recent spending and one suggestion. Also a section saying 'you've spent x% more on a category than last week' type stat.",
        }),
      });

      if (!res.ok) {
        throw new Error(`AI API returned ${res.status}`);
      }

      const data = await res.json();

      setInsight(
        data.reply ||
          "Insights unavailable at the moment. Please try again later."
      );
    } catch (err) {
      console.error("Financial insights failed:", err);

      setInsight(
        "Insights unavailable at the moment. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-800/50 dark:to-emerald-900 p-6 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm transition-all">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

          <h3 className="font-bold text-slate-800 dark:text-white">
            Monetra AI Insights
          </h3>
        </div>
      </div>

      {!insight && !loading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Sparkles className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-3" />

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Get personalized insights about your spending habits.
          </p>

          <button
            onClick={fetchInsight}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            Get Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your spending...
        </div>
      )}

      {insight && !loading && (
        <>
          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {insight}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={fetchInsight}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Refresh insights
            </button>
          </div>
        </>
      )}
    </div>
  );
}