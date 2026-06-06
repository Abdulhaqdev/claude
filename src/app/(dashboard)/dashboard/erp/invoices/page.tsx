import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Download, Send, Printer } from "lucide-react";
import { requireOrganizationId } from "@/lib/auth/session";
import { invoiceRepository } from "@/features/erp/repositories/invoice.repository";

const statusVariant: Record<string, "success" | "default" | "destructive" | "secondary" | "warning"> = {
  PAID: "success",
  SENT: "default",
  OVERDUE: "destructive",
  DRAFT: "secondary",
};

export default async function InvoicesPage() {
  const organizationId = await requireOrganizationId();
  const [result, summary] = await Promise.all([
    invoiceRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" }),
    invoiceRepository.getSummary(organizationId),
  ]);

  return (
    <>
      <Header
        title="Invoices"
        description={`${result.pagination.total} invoices total`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Outstanding", value: formatCurrency(summary.outstanding) },
            { label: "Paid This Month", value: formatCurrency(summary.paidThisMonth) },
            { label: "Overdue", value: formatCurrency(summary.overdue) },
            { label: "Draft", value: String(summary.draft) },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {result.data.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                description="Create an invoice from a sale or manually."
              />
            ) : (
              <div className="space-y-2">
                {result.data.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-xs font-bold text-primary">
                          {invoice.invoiceNumber.split("-").pop()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customer.name}</p>
                      </div>
                    </div>
                    <div className="hidden text-sm text-muted-foreground sm:block">
                      {formatDate(invoice.issueDate)} → {formatDate(invoice.dueDate)}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(Number(invoice.total))}</span>
                      <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                        {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
