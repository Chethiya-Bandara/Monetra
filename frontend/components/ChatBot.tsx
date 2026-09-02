"use client";

import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
    ]);

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found.");
      }

      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMsg,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();

        console.error(
          "Chat API error:",
          res.status,
          errorText
        );

        throw new Error(`Chat API returned ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply,
        },
      ]);
    } catch (err) {
      console.error("Chat failed:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I couldn't connect to the AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] shadow-sm transition-colors">

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
        <Bot className="text-indigo-600 dark:text-indigo-400" />
        AI Financial Guide
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-slate-500 dark:text-slate-400 text-xs animate-pulse">
            Gemini is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
          placeholder="Ask about your spending..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}