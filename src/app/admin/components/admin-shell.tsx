"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-40">
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[260px] flex-col border-r border-border bg-card z-50 flex lg:hidden">
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 lg:ml-[260px]">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
