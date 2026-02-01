/**
 * File: sidebar.tsx
 * Description: Desktop sidebar navigation component with collapsible state.
 */

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
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui.store";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 
                      session?.user?.email?.charAt(0)?.toUpperCase() || "?";

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
              <span className="font-bold text-white text-lg tracking-tight">
                Vitalis<span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Performance Hub
              </span>
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

        {/* Admin Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-white/5">
            {!sidebarCollapsed && (
              <p className="px-4 text-[10px] uppercase text-zinc-600 tracking-[0.2em] mb-2">
                Authority
              </p>
            )}
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                "bg-violet-500/5 border border-violet-500/10 hover:bg-violet-500/10",
                pathname.startsWith("/admin") && "border-violet-500/30 bg-violet-500/20",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <Shield
                className={cn(
                  "w-5 h-5 transition-colors",
                  pathname.startsWith("/admin") ? "text-violet-400" : "text-violet-500 group-hover:text-violet-400"
                )}
              />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium text-violet-300">
                  Mission Control
                </span>
              )}
            </Link>
          </div>
        )}
      </nav>

      {/* User Status Card */}
      {!sidebarCollapsed && session?.user && (
        <div className="px-4 pb-4">
          <div className="glass-card p-4 border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-zinc-400">{userInitial}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name || "Subject"}
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAdmin ? "bg-violet-400" : "bg-emerald-400",
                    "animate-pulse"
                  )} />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {isAdmin ? "Admin" : "Active"}
                  </span>
                </div>
              </div>
            </div>
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
