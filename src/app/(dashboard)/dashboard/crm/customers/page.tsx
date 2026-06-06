import { Header } from "@/components/layout/header";
import { CustomersManager } from "@/components/crm/customers-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { customerRepository } from "@/features/crm/repositories/customer.repository";

export default async function CustomersPage() {
  const organizationId = await requireOrganizationId();
  const result = await customerRepository.findMany(organizationId, {
    page: 1,
    limit: 50,
    sortOrder: "desc",
  });

  const customers = result.data.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    email: c.email,
    phone: c.phone,
    company: c.company,
    type: c.type,
    status: c.status,
    creditLimit: Number(c.creditLimit),
    city: c.city,
    country: c.country,
    address: c.address,
  }));

  return (
    <>
      <Header title="Customers" description={`${result.pagination.total} customers`} />
      <div className="p-6">
        <CustomersManager customers={customers} />
      </div>
    </>
  );
}
