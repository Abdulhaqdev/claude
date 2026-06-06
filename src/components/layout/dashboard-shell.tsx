"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={user}
          onOpenCommand={() => setCommandOpen(true)}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-[260px]">
            <Sidebar user={user} onOpenCommand={() => setCommandOpen(true)} />
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto gradient-mesh">
          {children}
        </div>
      </main>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}

export { DashboardShell as default };
