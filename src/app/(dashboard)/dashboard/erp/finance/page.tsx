import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { requireOrganizationId } from "@/lib/auth/session";
import { dashboardRepository } from "@/features/erp/repositories/product.repository";
import { expenseRepository } from "@/features/shared/repositories/operations.repository";

export default async function FinancePage() {
  const organizationId = await requireOrganizationId();
  const [stats, revenue, expenses] = await Promise.all([
    dashboardRepository.getStats(organizationId),
    dashboardRepository.getRevenueChart(organizationId, 12),
    expenseRepository.findMany(organizationId, { page: 1, limit: 100, sortOrder: "desc" }),
  ]);

  const totalExpenses = expenses.data.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <Header title="Finance" description="Revenue, expenses and profitability" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard title="Monthly Revenue" value={stats.monthlyRevenue} icon="dollar" format="currency" />
          <KpiCard title="Total Expenses" value={totalExpenses} icon="alert" format="currency" />
          <KpiCard
            title="Net (approx)"
            value={stats.monthlyRevenue - totalExpenses}
            icon="target"
            format="currency"
          />
        </div>
        {revenue.length > 0 ? (
          <RevenueChart data={revenue} />
        ) : (
          <EmptyState title="No financial data" description="Sales and expenses will appear here." />
        )}
      </div>
    </>
  );
}
