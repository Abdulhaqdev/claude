"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/features/erp/actions/crud.actions";

type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number | string;
  date: Date | string;
  vendor: string | null;
};

const EXPENSE_CATEGORIES = ["RENT", "UTILITIES", "SALARIES", "MARKETING", "SHIPPING", "SUPPLIES", "OTHER"];

function ExpenseFormFields({ expense }: { expense?: Expense }) {
  const dateValue = expense?.date
    ? new Date(expense.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Description" name="description" defaultValue={expense?.description} required />
      <FormField
        label="Category"
        name="category"
        defaultValue={expense?.category ?? "OTHER"}
        options={EXPENSE_CATEGORIES.map((v) => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() }))}
        required
      />
      <FormField label="Amount" name="amount" type="number" step="0.01" defaultValue={Number(expense?.amount ?? 0)} required />
      <FormField label="Date" name="date" type="date" defaultValue={dateValue} />
      <FormField label="Vendor" name="vendor" defaultValue={expense?.vendor ?? ""} />
    </div>
  );
}

export function ExpensesManager({ expenses }: { expenses: Expense[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Expense" onClick={() => setCreateOpen(true)} />
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses" description="Record business expenses to track spending." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Description", "Category", "Vendor", "Date", "Amount", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{e.description}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{e.category.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.vendor ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(e.amount))}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(e)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteButton size="icon" onDelete={() => deleteExpenseAction(e.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Expense" onSubmit={createExpenseAction} submitLabel="Create">
        <ExpenseFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Expense" onSubmit={(fd) => updateExpenseAction(editItem!.id, fd)}>
        {editItem && <ExpenseFormFields expense={editItem} />}
      </CrudDialog>
    </>
  );
}
