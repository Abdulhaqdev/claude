"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions/helpers";

interface DeleteButtonProps {
  label?: string;
  onDelete: () => Promise<ActionResult>;
  size?: "sm" | "icon";
}

export function DeleteButton({ label = "Delete", onDelete, size = "sm" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        toast.success("Deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button
        variant={size === "icon" ? "ghost" : "outline"}
        size={size === "icon" ? "icon" : "sm"}
        className={size === "icon" ? "h-8 w-8 text-destructive hover:text-destructive" : "text-destructive hover:text-destructive"}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {size !== "icon" && label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this record?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
