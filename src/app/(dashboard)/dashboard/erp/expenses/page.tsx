import { Header } from "@/components/layout/header";
import { ExpensesManager } from "@/components/erp/expenses-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { expenseRepository } from "@/features/shared/repositories/operations.repository";

export default async function ExpensesPage() {
  const organizationId = await requireOrganizationId();
  const result = await expenseRepository.findMany(organizationId, { page: 1, limit: 50, sortOrder: "desc" });

  const expenses = result.data.map((e) => ({
    id: e.id,
    description: e.description,
    category: e.category,
    amount: Number(e.amount),
    date: e.date.toISOString(),
    vendor: e.vendor,
  }));

  return (
    <>
      <Header title="Expenses" description={`${result.pagination.total} expenses`} />
      <div className="p-6">
        <ExpensesManager expenses={expenses} />
      </div>
    </>
  );
}
