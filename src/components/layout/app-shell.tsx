"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  CalendarCheck,
  BarChart3,
  Target,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/layout/nav-link";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/log", icon: PenLine, label: "Study Log" },
  { href: "/schedule", icon: CalendarCheck, label: "Schedule" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/practice", icon: Dumbbell, label: "Practice" },
  { href: "/milestones", icon: Target, label: "Milestones" },
] as const;

function BottomTabItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col gap-1 border-r bg-background/95 px-3 py-6 z-40">
        <div className="mb-4 px-3">
          <h1 className="text-base font-semibold tracking-tight">IELTS Dashboard</h1>
          <p className="text-xs text-muted-foreground">Study tracker</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 border-t bg-background/95 backdrop-blur flex flex-row z-40">
        {NAV_ITEMS.map((item) => (
          <BottomTabItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>

      {/* Content area */}
      <main className="pb-20 md:pb-0 md:pl-56 min-h-screen">{children}</main>
    </>
  );
}
