import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { requireUser } from "@/lib/auth/session";
import { notificationRepository } from "@/features/shared/repositories/operations.repository";

export default async function NotificationsPage() {
  const user = await requireUser();
  const result = await notificationRepository.findForUser(user.id, user.organizationId, {
    page: 1,
    limit: 50,
    sortOrder: "desc",
  });

  return (
    <>
      <Header title="Notifications" description={`${result.pagination.total} notifications`} />
      <div className="p-6">
        {result.data.length === 0 ? (
          <EmptyState title="No notifications" description="Alerts for stock, deals, and invoices will appear here." />
        ) : (
          <div className="space-y-2">
            {result.data.map((n) => (
              <Card key={n.id} className={`p-4 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                  </div>
                  <Badge variant={n.read ? "secondary" : "default"}>
                    {n.type.toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
