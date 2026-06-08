"use client";

import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  ShoppingCart,
  FileText,
  TrendingUp,
  Truck,
  BarChart3,
  Settings,
  Tags,
  Building2,
  Receipt,
  Wallet,
  UserPlus,
  Kanban,
  ArrowLeftRight,
  PackageCheck,
  PackageOpen,
  Bell,
  Search,
  ChevronLeft,
  Moon,
  Sun,
  LogOut,
  Command,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "ERP",
    items: [
      { title: "Products", href: "/dashboard/erp/products", icon: Package },
      { title: "Categories", href: "/dashboard/erp/categories", icon: Tags },
      { title: "Suppliers", href: "/dashboard/erp/suppliers", icon: Building2 },
      { title: "Purchases", href: "/dashboard/erp/purchases", icon: ShoppingCart },
      { title: "Sales", href: "/dashboard/erp/sales", icon: TrendingUp },
      { title: "Invoices", href: "/dashboard/erp/invoices", icon: FileText },
      { title: "Expenses", href: "/dashboard/erp/expenses", icon: Wallet },
      { title: "Finance", href: "/dashboard/erp/finance", icon: Receipt },
    ],
  },
  {
    label: "CRM",
    items: [
      { title: "Customers", href: "/dashboard/crm/customers", icon: Users },
      { title: "Leads", href: "/dashboard/crm/leads", icon: UserPlus },
      { title: "Deals", href: "/dashboard/crm/deals", icon: Kanban },
    ],
  },
  {
    label: "WMS",
    items: [
      { title: "Warehouses", href: "/dashboard/wms/warehouses", icon: Warehouse },
      { title: "Inventory", href: "/dashboard/wms/inventory", icon: PackageOpen },
      { title: "Transfers", href: "/dashboard/wms/transfers", icon: ArrowLeftRight },
      { title: "Dispatch", href: "/dashboard/wms/dispatch", icon: Truck },
      { title: "Receiving", href: "/dashboard/wms/receiving", icon: PackageCheck },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  onOpenCommand?: () => void;
}

export function Sidebar({ collapsed, onToggle, user, onOpenCommand }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Command className="h-4 w-4" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold tracking-tight">cd cd ishladi </span>
            <span className="text-[10px] text-muted-foreground">Wholesale Platform</span>
          </motion.div>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto h-7 w-7", collapsed && "ml-0")}
            onClick={onToggle}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-3">
          <button
            onClick={onOpenCommand}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-2">
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user ? getInitials(user.firstName, user.lastName) : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[11px] text-muted-foreground capitalize">
                {user.role.replace("_", " ").toLowerCase()}
              </p>
            </div>
          )}
          {!collapsed && (
            <div className="flex gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <form action="/api/auth/logout" method="POST">
                <Button variant="ghost" size="icon" className="h-7 w-7" type="submit">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
