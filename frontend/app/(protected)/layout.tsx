"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token"); // Or check a cookie
      if (!token) {
        router.replace("/login");
      } else {
        try {
          const response = await fetch(apiUrl("/auth/session"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Invalid session");
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem("token");
          router.replace("/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
