import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { receivingRepository } from "@/features/shared/repositories/operations.repository";

export default async function ReceivingPage() {
  const organizationId = await requireOrganizationId();
  const result = await receivingRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  return (
    <>
      <Header title="Receiving" description={`${result.pagination.total} receiving orders`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No receiving orders" description="Receive purchase orders into warehouses." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Receiving #", "Warehouse", "Items", "Status", "Received", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{r.receivingNumber}</td>
                    <td className="px-4 py-3 text-sm">{r.warehouse.name}</td>
                    <td className="px-4 py-3 text-sm">{r._count.items}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{r.status.toLowerCase().replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.receivedAt ? formatDate(r.receivedAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(r.createdAt)}</td>
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
