"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import {
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
} from "@/features/erp/actions/crud.actions";

type Supplier = {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  paymentTerms: number;
  status: string;
};

function SupplierFormFields({ supplier }: { supplier?: Supplier }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Name" name="name" defaultValue={supplier?.name} required />
      <FormField label="Code" name="code" defaultValue={supplier?.code} required />
      <FormField label="Email" name="email" type="email" defaultValue={supplier?.email ?? ""} />
      <FormField label="Phone" name="phone" defaultValue={supplier?.phone ?? ""} />
      <FormField label="Address" name="address" defaultValue={supplier?.address ?? ""} />
      <FormField label="City" name="city" defaultValue={supplier?.city ?? ""} />
      <FormField label="Country" name="country" defaultValue={supplier?.country ?? ""} />
      <FormField label="Payment Terms (days)" name="paymentTerms" type="number" defaultValue={supplier?.paymentTerms ?? 30} />
    </div>
  );
}

export function SuppliersManager({ suppliers }: { suppliers: Supplier[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Supplier" onClick={() => setCreateOpen(true)} />
      </div>

      {suppliers.length === 0 ? (
        <EmptyState title="No suppliers" description="Add suppliers to manage purchase orders." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Name", "Code", "Email", "Phone", "Payment Terms", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{s.code}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{s.paymentTerms} days</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === "ACTIVE" ? "success" : "secondary"}>{s.status.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteButton size="icon" onDelete={() => deleteSupplierAction(s.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Supplier" onSubmit={createSupplierAction} submitLabel="Create">
        <SupplierFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Supplier" onSubmit={(fd) => updateSupplierAction(editItem!.id, fd)}>
        {editItem && <SupplierFormFields supplier={editItem} />}
      </CrudDialog>
    </>
  );
}
