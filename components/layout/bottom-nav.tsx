/**
 * Vitalis AI | Health & Performance Hub
 * File: bottom-nav.tsx
 * Description: Mobile bottom navigation bar component.
 */

"use client";

import { cn } from "@/lib/utils";
import { Home, Dumbbell, Apple, History, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/nutrition", label: "Food", icon: Apple },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "h-[72px] bg-black/80 backdrop-blur-xl",
        "border-t border-white/5",
        "safe-area-inset-bottom"
      )}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-200",
                "touch-target",
                isActive && "bg-white/5"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                isActive && "after:absolute after:-bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-emerald-400"
              )}>
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-emerald-400" : "text-zinc-500"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-white" : "text-zinc-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

