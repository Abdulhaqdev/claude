import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { InventoryHeatmap } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { WarehousesManager } from "@/components/wms/warehouses-manager";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { inventoryRepository, warehouseRepository } from "@/features/wms/repositories/inventory.repository";
import { dashboardRepository } from "@/features/erp/repositories/product.repository";

export default async function WarehouseDashboardPage() {
  const organizationId = await requireOrganizationId();
  const [overview, heatmap, stats, warehouses] = await Promise.all([
    inventoryRepository.getOverview(organizationId),
    inventoryRepository.getHeatmap(organizationId),
    dashboardRepository.getStats(organizationId),
    warehouseRepository.findAll(organizationId),
  ]);

  const warehouseDetails = warehouses.map((w) => ({
    id: w.id,
    name: w.name,
    code: w.code,
    address: w.address,
    city: w.city,
    country: w.country,
    capacity: w.capacity,
  }));

  return (
    <>
      <Header title="Warehouses" description="Monitor inventory across all locations" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total SKUs", value: formatNumber(stats.totalProducts) },
            { label: "Total Units", value: formatNumber(overview.totalItems) },
            { label: "Inventory Value", value: formatCurrency(overview.totalValue) },
            { label: "Low Stock Alerts", value: String(stats.lowStockCount) },
          ].map((stat) => (
            <Card key={stat.label} className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        <WarehousesManager warehouseStats={overview.warehouseStats} warehouses={warehouseDetails} />

        {heatmap.length > 0 ? (
          <InventoryHeatmap data={heatmap} />
        ) : (
          <EmptyState title="No inventory items" description="Receive stock into warehouses to see the heatmap." />
        )}
      </div>
    </>
  );
}
