"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AddButton, CrudDialog, FormField } from "@/components/crud/crud-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  createWarehouseAction,
  updateWarehouseAction,
  deleteWarehouseAction,
} from "@/features/wms/actions/crud.actions";

type WarehouseStat = {
  id: string;
  name: string;
  code: string;
  itemCount: number;
  value: number;
  utilization: number | null;
  totalQty: number;
};

type WarehouseDetail = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  capacity?: number | null;
};

function WarehouseFormFields({ warehouse }: { warehouse?: WarehouseDetail }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Name" name="name" defaultValue={warehouse?.name} required />
      <FormField label="Code" name="code" defaultValue={warehouse?.code} required />
      <FormField label="Address" name="address" defaultValue={warehouse?.address ?? ""} />
      <FormField label="City" name="city" defaultValue={warehouse?.city ?? ""} />
      <FormField label="Country" name="country" defaultValue={warehouse?.country ?? ""} />
      <FormField label="Capacity" name="capacity" type="number" defaultValue={warehouse?.capacity ?? ""} />
    </div>
  );
}

export function WarehousesManager({
  warehouseStats,
  warehouses,
}: {
  warehouseStats: WarehouseStat[];
  warehouses: WarehouseDetail[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseDetail | null>(null);

  function openEdit(id: string) {
    const wh = warehouses.find((w) => w.id === id);
    if (wh) setEditItem(wh);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddButton label="Add Warehouse" onClick={() => setCreateOpen(true)} />
      </div>

      {warehouseStats.length === 0 ? (
        <EmptyState title="No warehouses" description="Create a warehouse to start tracking inventory." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {warehouseStats.map((wh) => (
            <Card key={wh.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{wh.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{wh.code}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(wh.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteButton size="icon" onDelete={() => deleteWarehouseAction(wh.id)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">SKUs</p>
                    <p className="text-lg font-bold">{formatNumber(wh.itemCount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="text-lg font-bold">{formatCurrency(wh.value)}</p>
                  </div>
                </div>
                {wh.utilization !== null && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{wh.utilization}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${wh.utilization}%` }} />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{formatNumber(wh.totalQty)} units in stock</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrudDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Warehouse" onSubmit={createWarehouseAction} submitLabel="Create">
        <WarehouseFormFields />
      </CrudDialog>
      <CrudDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Warehouse" onSubmit={(fd) => updateWarehouseAction(editItem!.id, fd)}>
        {editItem && <WarehouseFormFields warehouse={editItem} />}
      </CrudDialog>
    </>
  );
}
