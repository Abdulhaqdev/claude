"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number; orders: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(239, 84%, 67%)"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface PipelineChartProps {
  data: Array<{ stage: string; count: number; value: number }>;
}

const STAGE_COLORS: Record<string, string> = {
  PROSPECT: "hsl(239, 84%, 67%)",
  QUALIFICATION: "hsl(173, 58%, 39%)",
  PROPOSAL: "hsl(43, 74%, 66%)",
  NEGOTIATION: "hsl(27, 87%, 67%)",
};

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.stage.replace("_", " ").toLowerCase(),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deal Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  name === "value" ? formatCurrency(Number(value)) : value,
                  name === "value" ? "Value" : "Deals",
                ]}
              />
              <Bar
                dataKey="count"
                fill="hsl(239, 84%, 67%)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface InventoryHeatmapProps {
  data: Array<{
    id: string;
    product: string;
    sku: string;
    warehouse: string;
    shelf: string;
    quantity: number;
    status: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  empty: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  low: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  normal: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  high: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

export function InventoryHeatmap({ data }: InventoryHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inventory Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {data.slice(0, 16).map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-3 transition-transform hover:scale-[1.02] ${STATUS_COLORS[item.status]}`}
            >
              <p className="truncate text-xs font-medium">{item.product}</p>
              <p className="text-[10px] opacity-70">{item.sku}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-lg font-bold">{item.quantity}</span>
                <span className="text-[10px] opacity-60">{item.warehouse}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
