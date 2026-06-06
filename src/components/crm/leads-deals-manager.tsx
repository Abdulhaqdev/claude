"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { DealsPipeline, type DealItem } from "@/components/crm/deals-pipeline";
import {
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  createDealAction,
  updateDealAction,
  deleteDealAction,
} from "@/features/crm/actions/crud.actions";

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string;
  score: number;
};

function LeadFormFields({ lead }: { lead?: Lead }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="First Name" name="firstName" defaultValue={lead?.firstName} required />
      <FormField label="Last Name" name="lastName" defaultValue={lead?.lastName} required />
      <FormField label="Email" name="email" type="email" defaultValue={lead?.email ?? ""} />
      <FormField label="Phone" name="phone" defaultValue={lead?.phone ?? ""} />
      <FormField label="Company" name="company" defaultValue={lead?.company ?? ""} />
      <FormField label="Score" name="score" type="number" defaultValue={lead?.score ?? 0} />
      <FormField
        label="Status"
        name="status"
        defaultValue={lead?.status ?? "NEW"}
        options={["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"].map((v) => ({ value: v, label: v.replace("_", " ") }))}
      />
      <FormField
        label="Source"
        name="source"
        defaultValue={lead?.source ?? "OTHER"}
        options={["WEBSITE", "REFERRAL", "TRADE_SHOW", "COLD_CALL", "SOCIAL", "OTHER"].map((v) => ({ value: v, label: v.replace("_", " ") }))}
      />
    </div>
  );
}

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lead | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Lead" onClick={() => setCreateOpen(true)} />
      </div>
      {leads.length === 0 ? (
        <EmptyState title="No leads" description="Add leads to track prospects." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Name", "Company", "Email", "Status", "Score", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">{l.firstName} {l.lastName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.company ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{l.email ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{l.status.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3 text-sm">{l.score}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(l)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <DeleteButton size="icon" onDelete={() => deleteLeadAction(l.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Lead" onSubmit={createLeadAction} submitLabel="Create">
        <LeadFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Lead" onSubmit={(fd) => updateLeadAction(editItem!.id, fd)}>
        {editItem && <LeadFormFields lead={editItem} />}
      </CrudDialog>
    </>
  );
}

function DealFormFields({
  deal,
  customers,
}: {
  deal?: DealItem & { customerId?: string; probability?: number };
  customers: { id: string; name: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Title" name="title" defaultValue={deal?.title} required />
      <FormField label="Value" name="value" type="number" step="0.01" defaultValue={deal?.value} required />
      <FormField
        label="Stage"
        name="stage"
        defaultValue={deal?.stage ?? "PROSPECT"}
        options={["PROSPECT", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"].map((v) => ({ value: v, label: v.replace("_", " ") }))}
        required
      />
      <FormField label="Probability %" name="probability" type="number" defaultValue={deal?.probability ?? 10} />
      <FormField
        label="Customer"
        name="customerId"
        defaultValue={deal?.customerId}
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
      />
      <FormField label="Expected Close" name="expectedClose" type="date" />
    </div>
  );
}

export function DealsManager({
  deals,
  customers,
}: {
  deals: (DealItem & { customerId?: string; probability?: number })[];
  customers: { id: string; name: string }[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<(DealItem & { customerId?: string; probability?: number }) | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <AddButton label="New Deal" onClick={() => setCreateOpen(true)} />
      </div>
      <DealsPipeline deals={deals} onEdit={setEditDeal} onDelete={(id) => deleteDealAction(id)} />
      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="New Deal" onSubmit={createDealAction} submitLabel="Create">
        <DealFormFields customers={customers} />
      </CrudDialog>
      <CrudDialog open={!!editDeal} onOpenChange={(o) => !o && setEditDeal(null)} title="Edit Deal" onSubmit={(fd) => updateDealAction(editDeal!.id, fd)}>
        {editDeal && <DealFormFields deal={editDeal} customers={customers} />}
      </CrudDialog>
    </>
  );
}
