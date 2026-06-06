import { Header } from "@/components/layout/header";
import { InventoryHeatmap } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { requireOrganizationId } from "@/lib/auth/session";
import { inventoryRepository } from "@/features/wms/repositories/inventory.repository";

export default async function InventoryPage() {
  const organizationId = await requireOrganizationId();
  const heatmap = await inventoryRepository.getHeatmap(organizationId);

  return (
    <>
      <Header title="Inventory" description={`${heatmap.length} stock locations tracked`} />
      <div className="p-6">
        {heatmap.length > 0 ? (
          <InventoryHeatmap data={heatmap} />
        ) : (
          <EmptyState title="No inventory" description="Add products and assign stock to warehouses." />
        )}
      </div>
    </>
  );
}
