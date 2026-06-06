"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatCurrency } from "@/lib/utils";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/features/crm/actions/crud.actions";

type Customer = {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: string;
  status: string;
  creditLimit: number | string;
  city?: string | null;
  country?: string | null;
  address?: string | null;
};

function CustomerFormFields({ customer }: { customer?: Customer }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Name" name="name" defaultValue={customer?.name} required />
      <FormField label="Code" name="code" defaultValue={customer?.code} required />
      <FormField label="Email" name="email" type="email" defaultValue={customer?.email ?? ""} />
      <FormField label="Phone" name="phone" defaultValue={customer?.phone ?? ""} />
      <FormField label="Company" name="company" defaultValue={customer?.company ?? ""} />
      <FormField
        label="Type"
        name="type"
        defaultValue={customer?.type ?? "WHOLESALE"}
        options={[
          { value: "WHOLESALE", label: "Wholesale" },
          { value: "RETAIL", label: "Retail" },
          { value: "VIP", label: "VIP" },
        ]}
        required
      />
      <FormField label="City" name="city" defaultValue={customer?.city ?? ""} />
      <FormField label="Country" name="country" defaultValue={customer?.country ?? ""} />
      <FormField label="Credit Limit" name="creditLimit" type="number" step="0.01" defaultValue={Number(customer?.creditLimit ?? 0)} />
      <FormField label="Address" name="address" defaultValue={customer?.address ?? ""} />
    </div>
  );
}

export function CustomersManager({ customers }: { customers: Customer[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Customer" onClick={() => setCreateOpen(true)} />
      </div>

      {customers.length === 0 ? (
        <EmptyState title="No customers" description="Add wholesale customers to manage orders and deals." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Name", "Code", "Type", "Email", "Credit Limit", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{c.code}</td>
                  <td className="px-4 py-3 text-sm capitalize">{c.type.toLowerCase()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(Number(c.creditLimit))}</td>
                  <td className="px-4 py-3"><Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>{c.status.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteButton size="icon" onDelete={() => deleteCustomerAction(c.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Customer" onSubmit={createCustomerAction} submitLabel="Create">
        <CustomerFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Customer" onSubmit={(fd) => updateCustomerAction(editItem!.id, fd)}>
        {editItem && <CustomerFormFields customer={editItem} />}
      </CrudDialog>
    </>
  );
}
