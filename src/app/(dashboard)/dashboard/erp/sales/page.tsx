import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireOrganizationId } from "@/lib/auth/session";
import { saleRepository } from "@/features/shared/repositories/operations.repository";

export default async function SalesPage() {
  const organizationId = await requireOrganizationId();
  const result = await saleRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  return (
    <>
      <Header title="Sales" description={`${result.pagination.total} orders`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No sales" description="Create a sales order to track wholesale orders." />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Order #", "Customer", "Date", "Items", "Total", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{s.saleNumber}</td>
                    <td className="px-4 py-3 text-sm">{s.customer.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(s.orderDate)}</td>
                    <td className="px-4 py-3 text-sm">{s._count.items}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(s.total))}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{s.status.toLowerCase()}</Badge></td>
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
