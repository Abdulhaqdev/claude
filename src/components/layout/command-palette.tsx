"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  FileText,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Pages" },
  { name: "Products", href: "/dashboard/erp/products", icon: Package, group: "ERP" },
  { name: "Invoices", href: "/dashboard/erp/invoices", icon: FileText, group: "ERP" },
  { name: "Customers", href: "/dashboard/crm/customers", icon: Users, group: "CRM" },
  { name: "Deals Pipeline", href: "/dashboard/crm/deals", icon: Users, group: "CRM" },
  { name: "Inventory", href: "/dashboard/wms/inventory", icon: Warehouse, group: "WMS" },
  { name: "Warehouses", href: "/dashboard/wms/warehouses", icon: Warehouse, group: "WMS" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSelect = useCallback(
    (href: string) => {
      onOpenChange(false);
      setSearch("");
      router.push(href);
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const groups = [...new Set(pages.map((p) => p.group))];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command
          className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, products, customers..."
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {pages
                  .filter((p) => p.group === group)
                  .map((page) => (
                    <Command.Item
                      key={page.href}
                      value={page.name}
                      onSelect={() => handleSelect(page.href)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                        "aria-selected:bg-accent aria-selected:text-accent-foreground"
                      )}
                    >
                      <page.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{page.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-aria-selected:opacity-100" />
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
