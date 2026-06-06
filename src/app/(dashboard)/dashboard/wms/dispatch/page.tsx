import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { dispatchRepository } from "@/features/shared/repositories/operations.repository";

export default async function DispatchPage() {
  const organizationId = await requireOrganizationId();
  const result = await dispatchRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  return (
    <>
      <Header title="Dispatch" description={`${result.pagination.total} dispatches`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No dispatches" description="Shipments from sales orders will appear here." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Dispatch #", "Warehouse", "Items", "Carrier", "Status", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((d) => (
                  <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{d.dispatchNumber}</td>
                    <td className="px-4 py-3 text-sm">{d.warehouse.name}</td>
                    <td className="px-4 py-3 text-sm">{d._count.items}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{d.carrier ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{d.status.toLowerCase()}</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </>
  );
}
