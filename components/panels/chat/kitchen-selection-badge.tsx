"use client";

import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface KitchenSelectionBadgeProps {
  kitchenId: string;
  kitchenName: string;
}

export const KitchenSelectionBadge = ({
  kitchenId,
  kitchenName,
}: KitchenSelectionBadgeProps) => {
  return (
    <Card className="bg-primary/10 border-primary/50 p-3 flex items-center gap-2 max-w-md mt-2">
      <Zap className="w-4 h-4 text-primary animate-pulse" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary">
          Loading: {kitchenName}
        </p>
        <p className="text-xs text-muted-foreground">
          ID:{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
            {kitchenId}
          </code>
        </p>
      </div>
    </Card>
  );
};
