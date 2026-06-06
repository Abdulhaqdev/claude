"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/features/erp/actions/crud.actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { products: number };
};

function CategoryFormFields({ category }: { category?: Category }) {
  return (
    <div className="grid gap-4">
      <FormField label="Name" name="name" defaultValue={category?.name} required />
      <FormField label="Slug" name="slug" defaultValue={category?.slug} />
      <FormField label="Description" name="description" defaultValue={category?.description ?? ""} />
    </div>
  );
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Category" onClick={() => setCreateOpen(true)} />
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create categories to organize your product catalog." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DeleteButton size="icon" onDelete={() => deleteCategoryAction(cat.id)} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold">{cat._count.products}</p>
              <p className="text-xs text-muted-foreground">products</p>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Category" onSubmit={createCategoryAction} submitLabel="Create">
        <CategoryFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Category" onSubmit={(fd) => updateCategoryAction(editItem!.id, fd)}>
        {editItem && <CategoryFormFields category={editItem} />}
      </CrudDialog>
    </>
  );
}
