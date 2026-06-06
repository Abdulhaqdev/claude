import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { transferRepository } from "@/features/shared/repositories/operations.repository";

export default async function TransfersPage() {
  const organizationId = await requireOrganizationId();
  const result = await transferRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  return (
    <>
      <Header title="Transfers" description={`${result.pagination.total} transfers`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No transfers" description="Move stock between warehouses." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Transfer #", "From", "To", "Items", "Status", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((t) => (
                  <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{t.transferNumber}</td>
                    <td className="px-4 py-3 text-sm">{t.fromWarehouse.code}</td>
                    <td className="px-4 py-3 text-sm">{t.toWarehouse.code}</td>
                    <td className="px-4 py-3 text-sm">{t._count.items}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{t.status.toLowerCase().replace("_", " ")}</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(t.createdAt)}</td>
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
