"use client";

import { useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions/helpers";

interface CrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (formData: FormData) => Promise<ActionResult>;
  submitLabel?: string;
}

export function CrudDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
}: CrudDialogProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success("Saved successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  options?: { value: string; label: string }[];
}) {
  if (options) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <select
          name={name}
          defaultValue={defaultValue}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
          required={required}
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
      />
    </div>
  );
}
