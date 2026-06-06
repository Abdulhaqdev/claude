"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  Truck,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const KPI_ICONS: Record<string, LucideIcon> = {
  dollar: DollarSign,
  package: Package,
  users: Users,
  shopping: ShoppingBag,
  alert: AlertTriangle,
  truck: Truck,
  target: Target,
};

export type KpiIconName = keyof typeof KPI_ICONS;

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: KpiIconName;
  format?: "currency" | "number" | "percent" | "none";
  index?: number;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  format = "none",
  index = 0,
}: KpiCardProps) {
  const Icon = KPI_ICONS[icon] ?? Package;

  const formattedValue =
    format === "currency"
      ? formatCurrency(Number(value))
      : format === "number"
        ? formatNumber(Number(value))
        : format === "percent"
          ? `${Number(value).toFixed(1)}%`
          : value;

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="relative overflow-hidden p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                {isPositive && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                )}
                {isNegative && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                {!isPositive && !isNegative && (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive && "text-emerald-500",
                    isNegative && "text-red-500",
                    !isPositive && !isNegative && "text-muted-foreground"
                  )}
                >
                  {isPositive && "+"}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5" />
      </Card>
    </motion.div>
  );
}
