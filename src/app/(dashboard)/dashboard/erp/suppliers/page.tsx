import { Header } from "@/components/layout/header";
import { SuppliersManager } from "@/components/erp/suppliers-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { supplierRepository } from "@/features/erp/repositories/invoice.repository";

export default async function SuppliersPage() {
  const organizationId = await requireOrganizationId();
  const result = await supplierRepository.findMany(organizationId, {
    page: 1,
    limit: 50,
    sortOrder: "asc",
  });

  const suppliers = result.data.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    email: s.email,
    phone: s.phone,
    address: s.address,
    city: s.city,
    country: s.country,
    paymentTerms: s.paymentTerms,
    status: s.status,
  }));

  return (
    <>
      <Header title="Suppliers" description={`${result.pagination.total} suppliers`} />
      <div className="p-6">
        <SuppliersManager suppliers={suppliers} />
      </div>
    </>
  );
}
