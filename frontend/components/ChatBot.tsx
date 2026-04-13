"use client";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] shadow-sm">
      <div className="p-4 border-b dark:border-slate-800 flex items-center gap-2 font-bold">
        <Bot className="text-indigo-600" /> AI Financial Guide
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-slate-400 text-xs animate-pulse">Gemini is thinking...</div>}
      </div>

      <div className="p-4 border-t dark:border-slate-800 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your spending..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={sendMessage} className="bg-indigo-600 text-white p-2 rounded-xl">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}