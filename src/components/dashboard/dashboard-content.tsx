import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart, PipelineChart, InventoryHeatmap } from "@/components/dashboard/charts";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { dashboardRepository } from "@/features/erp/repositories/product.repository";
import { inventoryRepository } from "@/features/wms/repositories/inventory.repository";

interface DashboardContentProps {
  organizationId: string;
}

export async function DashboardContent({ organizationId }: DashboardContentProps) {
  const [stats, revenueData, pipelineData, activities, heatmapData] =
    await Promise.all([
      dashboardRepository.getStats(organizationId),
      dashboardRepository.getRevenueChart(organizationId),
      dashboardRepository.getPipelineSummary(organizationId),
      dashboardRepository.getRecentActivity(organizationId),
      inventoryRepository.getHeatmap(organizationId),
    ]);

  const serializedActivities = activities.map((a) => ({
    id: a.id,
    action: a.action,
    entity: a.entity,
    createdAt: a.createdAt.toISOString(),
    user: a.user,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          change={stats.revenueChange}
          icon="dollar"
          format="currency"
          index={0}
        />
        <KpiCard
          title="Active Products"
          value={stats.totalProducts}
          icon="package"
          format="number"
          index={1}
        />
        <KpiCard
          title="Customers"
          value={stats.totalCustomers}
          icon="users"
          format="number"
          index={2}
        />
        <KpiCard
          title="Open Deals"
          value={stats.openDeals}
          icon="target"
          format="number"
          index={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="shopping"
          format="number"
          index={4}
        />
        <KpiCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon="alert"
          format="number"
          index={5}
        />
        <KpiCard
          title="Pending Dispatches"
          value={stats.pendingDispatches}
          icon="truck"
          format="number"
          index={6}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {revenueData.length > 0 ? (
          <RevenueChart data={revenueData} />
        ) : (
          <div className="col-span-2">
            <EmptyState
              title="No revenue data"
              description="Confirmed sales will appear in the revenue chart."
            />
          </div>
        )}
        {pipelineData.length > 0 ? (
          <PipelineChart data={pipelineData} />
        ) : (
          <EmptyState
            title="No deals in pipeline"
            description="Create deals in CRM to track your sales pipeline."
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {heatmapData.length > 0 ? (
          <InventoryHeatmap data={heatmapData} />
        ) : (
          <EmptyState
            title="No inventory data"
            description="Add products and stock levels in WMS."
          />
        )}
        {serializedActivities.length > 0 ? (
          <ActivityTimeline activities={serializedActivities} />
        ) : (
          <EmptyState
            title="No recent activity"
            description="Actions across the platform will show up here."
          />
        )}
      </div>
    </div>
  );
}
