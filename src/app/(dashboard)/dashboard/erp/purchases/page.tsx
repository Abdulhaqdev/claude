import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { purchaseRepository } from "@/features/shared/repositories/operations.repository";

export default async function PurchasesPage() {
  const organizationId = await requireOrganizationId();
  const result = await purchaseRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  return (
    <>
      <Header title="Purchases" description={`${result.pagination.total} purchase orders`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No purchases" description="Create purchase orders from suppliers." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["PO #", "Supplier", "Date", "Items", "Total", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{p.purchaseNumber}</td>
                    <td className="px-4 py-3 text-sm">{p.supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(p.orderDate)}</td>
                    <td className="px-4 py-3 text-sm">{p._count.items}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(p.total))}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{p.status.toLowerCase()}</Badge></td>
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
