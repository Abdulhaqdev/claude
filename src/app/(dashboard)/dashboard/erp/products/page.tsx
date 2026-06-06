import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { ProductsManager } from "@/components/erp/products-manager";
import { requireOrganizationId } from "@/lib/auth/session";
import { productRepository } from "@/features/erp/repositories/product.repository";

export default async function ProductsPage() {
  const organizationId = await requireOrganizationId();
  const [products, categories] = await Promise.all([
    productRepository.findAllForGrid(organizationId),
    productRepository.getCategories(organizationId),
  ]);

  return (
    <>
      <Header
        title="Products"
        description={`${products.length} products in catalog`}
      />
      <div className="space-y-6 p-6">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="cursor-pointer px-3 py-1">
              All ({products.length})
            </Badge>
            {categories.map((cat) => (
              <Badge key={cat.id} variant="outline" className="cursor-pointer px-3 py-1">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
        <ProductsManager products={products} categories={categories} />
      </div>
    </>
  );
}
