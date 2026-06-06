import { Header } from "@/components/layout/header";
import { RevenueChart, PipelineChart } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { requireOrganizationId } from "@/lib/auth/session";
import { dashboardRepository } from "@/features/erp/repositories/product.repository";

export default async function AnalyticsPage() {
  const organizationId = await requireOrganizationId();
  const [revenue, pipeline] = await Promise.all([
    dashboardRepository.getRevenueChart(organizationId, 12),
    dashboardRepository.getPipelineSummary(organizationId),
  ]);

  return (
    <>
      <Header title="Analytics" description="Business performance insights" />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {revenue.length > 0 ? (
          <RevenueChart data={revenue} />
        ) : (
          <EmptyState title="No revenue analytics" description="Complete sales to see trends." />
        )}
        {pipeline.length > 0 ? (
          <PipelineChart data={pipeline} />
        ) : (
          <EmptyState title="No pipeline data" description="Add CRM deals to analyze pipeline." />
        )}
      </div>
    </>
  );
}
