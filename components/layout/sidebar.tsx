"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Dumbbell,
  Apple,
  History,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui.store";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col",
        "bg-black/40 backdrop-blur-xl border-r border-white/5",
        "transition-all duration-300 ease-out",
        sidebarCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-6 border-b border-white/5",
        sidebarCollapsed && "justify-center px-0"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight">Vitalis</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">AI Health Hub</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-white/5 group",
                isActive && "bg-white/5 border border-white/10",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-white"
                )}
              />
              {!sidebarCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  )}
                >
                  {item.label}
                </span>
              )}
              {isActive && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status Card */}
      {!sidebarCollapsed && (
        <div className="px-4 pb-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400 uppercase tracking-wider">System Status</span>
            </div>
            <p className="text-sm text-zinc-300 font-mono-ai">
              {"> All systems operational"}
            </p>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-zinc-900 border border-white/10 flex items-center justify-center",
          "hover:bg-zinc-800 transition-colors"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-zinc-400" />
        )}
      </button>
    </aside>
  );
}

