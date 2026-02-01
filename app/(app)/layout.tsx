/**
 * Vitalis AI | Health & Performance Hub
 * File: layout.tsx
 * Description: Main application layout with sidebar, navigation, and providers.
 */

"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useUIStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-black">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main
            className={cn(
              "min-h-screen transition-all duration-300",
              "lg:pl-[280px]",
              sidebarCollapsed && "lg:pl-20",
              "pb-[72px] lg:pb-0"
            )}
          >
            <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <BottomNav />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}
