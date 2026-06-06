"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsGrid } from "@/components/erp/products-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/features/erp/actions/crud.actions";

type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  color: string;
  size: string;
  wholesalePrice: number;
  sellPrice: number;
  status: "ACTIVE" | "DISCONTINUED" | "DRAFT";
  category: string;
  stock: number;
  categoryId?: string;
  costPrice?: number;
  minStock?: number;
  barcode?: string;
};

type Category = { id: string; name: string };

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
}

function ProductFormFields({
  product,
  categories,
}: {
  product?: Product & { costPrice?: number; minStock?: number; barcode?: string; categoryId?: string };
  categories: Category[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="SKU" name="sku" defaultValue={product?.sku} required />
      <FormField label="Name" name="name" defaultValue={product?.name} required />
      <FormField label="Brand" name="brand" defaultValue={product?.brand} />
      <FormField label="Color" name="color" defaultValue={product?.color} />
      <FormField label="Size" name="size" defaultValue={product?.size} />
      <FormField
        label="Category"
        name="categoryId"
        defaultValue={product?.categoryId}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <FormField label="Cost Price" name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice ?? 0} required />
      <FormField label="Wholesale Price" name="wholesalePrice" type="number" step="0.01" defaultValue={product?.wholesalePrice ?? 0} required />
      <FormField label="Sell Price" name="sellPrice" type="number" step="0.01" defaultValue={product?.sellPrice ?? 0} required />
      <FormField label="Min Stock" name="minStock" type="number" defaultValue={product?.minStock ?? 0} />
      <FormField label="Barcode" name="barcode" defaultValue={product?.barcode} />
    </div>
  );
}

export function ProductsManager({ products, categories }: ProductsManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Product" onClick={() => setCreateOpen(true)} />
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product to start managing inventory." />
      ) : (
        <ProductsGrid
          products={products}
          renderActions={(product) => (
            <div className="flex gap-1 border-t border-border p-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setEditProduct(product)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <DeleteButton size="icon" onDelete={() => deleteProductAction(product.id)} />
            </div>
          )}
        />
      )}

      <CrudDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Product"
        onSubmit={createProductAction}
        submitLabel="Create"
      >
        <ProductFormFields categories={categories} />
      </CrudDialog>

      <CrudDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        title="Edit Product"
        onSubmit={(fd) => updateProductAction(editProduct!.id, fd)}
      >
        {editProduct && <ProductFormFields product={editProduct} categories={categories} />}
      </CrudDialog>
    </>
  );
}
