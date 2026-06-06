import { Header } from "@/components/layout/header";
import { DealsManager } from "@/components/crm/leads-deals-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { dealRepository, customerRepository } from "@/features/crm/repositories/customer.repository";

export default async function DealsPage() {
  const organizationId = await requireOrganizationId();
  const [deals, customersResult] = await Promise.all([
    dealRepository.findByStage(organizationId),
    customerRepository.findMany(organizationId, { page: 1, limit: 100, sortOrder: "asc" }),
  ]);

  const pipelineDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    value: Number(d.value),
    stage: d.stage,
    probability: d.probability,
    customerId: d.customerId ?? undefined,
    customerName:
      d.customer?.name ??
      d.customer?.company ??
      (d.lead ? `${d.lead.firstName} ${d.lead.lastName}` : "No customer"),
  }));

  const customers = customersResult.data.map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <Header title="Deals Pipeline" description="Track and manage your sales opportunities" />
      <div className="p-6">
        <DealsManager deals={pipelineDeals} customers={customers} />
      </div>
    </>
  );
}
