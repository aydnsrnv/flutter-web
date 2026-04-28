"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
  { href: "/admin/users", label: "Users", icon: "ri-user-line" },
  { href: "/admin/jobs", label: "Jobs", icon: "ri-briefcase-line" },
  { href: "/admin/resumes", label: "Resumes", icon: "ri-file-list-line" },
  { href: "/admin/companies", label: "Companies", icon: "ri-building-line" },
  { href: "/admin/categories", label: "Categories", icon: "ri-stack-line" },
  { href: "/admin/reports", label: "Reports", icon: "ri-flag-line" },
  { href: "/admin/payments", label: "Payments", icon: "ri-bank-card-line" },
  { href: "/admin/notifications", label: "Notifications", icon: "ri-notification-3-line" },
  { href: "/admin/slider", label: "Slider", icon: "ri-image-line" },
  { href: "/admin/maintenance", label: "Maintenance", icon: "ri-tools-line" },
  { href: "/admin/company-requests", label: "Company Requests", icon: "ri-mail-send-line" },
  { href: "/admin/settings", label: "Settings", icon: "ri-settings-3-line" },
];

export function AdminSidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: "var(--jobly-main)" }}>
          J
        </div>
        <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Jobly Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                active
                  ? "text-white"
                  : "hover:bg-muted"
              )}
              style={active ? { backgroundColor: "var(--jobly-main)" } : { color: "var(--muted-foreground)" }}
            >
              <i className={cn(item.icon, "text-lg")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/home"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
          style={{ color: "var(--muted-foreground)" }}
        >
          <i className="ri-arrow-left-line text-lg" />
          Back to App
        </Link>
      </div>
    </div>
  );
}
