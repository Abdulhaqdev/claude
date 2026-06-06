"use client";

import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/crud/delete-button";
import type { ActionResult } from "@/lib/actions/helpers";

const STAGES = [
  { id: "PROSPECT", label: "Prospect", color: "border-indigo-500/30 bg-indigo-500/5" },
  { id: "QUALIFICATION", label: "Qualification", color: "border-emerald-500/30 bg-emerald-500/5" },
  { id: "PROPOSAL", label: "Proposal", color: "border-amber-500/30 bg-amber-500/5" },
  { id: "NEGOTIATION", label: "Negotiation", color: "border-orange-500/30 bg-orange-500/5" },
] as const;

export interface DealItem {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  customerName: string;
}

interface DealsPipelineProps {
  deals: DealItem[];
  onEdit?: (deal: DealItem) => void;
  onDelete?: (id: string) => Promise<ActionResult>;
}

export function DealsPipeline({ deals, onEdit, onDelete }: DealsPipelineProps) {
  if (deals.length === 0) {
    return (
      <EmptyState
        title="No active deals"
        description="Create a deal to start tracking your sales pipeline."
      />
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage, stageIndex) => {
        const stageDeals = deals.filter((d) => d.stage === stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: stageIndex * 0.1 }}
            className={`min-w-[280px] flex-1 rounded-xl border ${stage.color} p-4`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {stageDeals.length} deals · {formatCurrency(totalValue)}
                </p>
              </div>
              <Badge variant="outline">{stageDeals.length}</Badge>
            </div>
            <div className="space-y-3">
              {stageDeals.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stageIndex * 0.1 + i * 0.05 }}
                >
                  <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium leading-tight">{deal.title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{deal.customerName}</p>
                      </div>
                      {(onEdit || onDelete) && (
                        <div className="flex shrink-0 gap-0.5">
                          {onEdit && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(deal)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                          {onDelete && <DeleteButton size="icon" onDelete={() => onDelete(deal.id)} />}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold">{formatCurrency(deal.value)}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {deal.probability}%
                      </Badge>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
