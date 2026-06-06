import { Header } from "@/components/layout/header";
import { LeadsManager } from "@/components/crm/leads-deals-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { leadRepository } from "@/features/crm/repositories/customer.repository";

export default async function LeadsPage() {
  const organizationId = await requireOrganizationId();
  const result = await leadRepository.findMany(organizationId, {
    page: 1,
    limit: 50,
    sortOrder: "desc",
  });

  const leads = result.data.map((l) => ({
    id: l.id,
    firstName: l.firstName,
    lastName: l.lastName,
    email: l.email,
    phone: l.phone,
    company: l.company,
    status: l.status,
    source: l.source,
    score: l.score,
  }));

  return (
    <>
      <Header title="Leads" description={`${result.pagination.total} leads`} />
      <div className="p-6">
        <LeadsManager leads={leads} />
      </div>
    </>
  );
}
