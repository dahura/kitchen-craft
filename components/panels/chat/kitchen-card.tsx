"use client";

import { Card } from "@/components/ui/card";
import type { KitchenOption } from "@/core/agent/predefined-kitchens";

interface KitchenCardProps {
  kitchen: KitchenOption & { index: number };
  onSelect: (kitchenId: string) => void;
}

export const KitchenCard = ({ kitchen, onSelect }: KitchenCardProps) => {
  return (
    <Card 
      className="p-3 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group border-2"
      onClick={() => onSelect(kitchen.id)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <span className="text-sm font-bold text-primary">
            {kitchen.index + 1}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
            {kitchen.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {kitchen.description}
          </p>
        </div>
      </div>
    </Card>
  );
};

