import { Header } from "@/components/layout/header";
import { CategoriesManager } from "@/components/erp/categories-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { categoryRepository } from "@/features/erp/repositories/invoice.repository";

export default async function CategoriesPage() {
  const organizationId = await requireOrganizationId();
  const rawCategories = await categoryRepository.findAll(organizationId);

  const categories = rawCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    _count: { products: cat._count.products },
  }));

  return (
    <>
      <Header title="Categories" description={`${categories.length} categories`} />
      <div className="p-6">
        <CategoriesManager categories={categories} />
      </div>
    </>
  );
}
