import { Button } from "@/components/ui/button";

interface IconButtonWithTooltipProps {
  icon: React.ReactNode;
  label: string;
}

const IconButtonWithTooltip = ({ icon, label }: IconButtonWithTooltipProps) => (
  <div className="relative group">
    <Button
      variant="ghost"
      size="icon"
      className="rounded-md hover:bg-accent"
    >
      {icon}
    </Button>
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 text-xs bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
      {label}
    </div>
  </div>
);

export const LeftSidebar = () => {
  return (
    <aside className="absolute top-1/2 left-4 -translate-y-1/2 z-20 ux-glass rounded-lg p-2">
      <div className="flex flex-col gap-2">
        {/* Add Cabinets */}
        <IconButtonWithTooltip
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
            </svg>
          }
          label="Add Cabinets"
        />

        {/* Select Finishes */}
        <IconButtonWithTooltip
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
            </svg>
          }
          label="Select Finishes"
        />

        {/* Change Materials */}
        <IconButtonWithTooltip
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4 8h2v8h-2z" />
            </svg>
          }
          label="Change Materials"
        />

        <div className="h-px bg-border my-1"></div>

        {/* Undo */}
        <IconButtonWithTooltip
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.36 7.73 5.5h2.08C20.56 9.46 16.73 8 12.5 8z" />
            </svg>
          }
          label="Undo"
        />

        {/* Redo */}
        <IconButtonWithTooltip
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.4 10.6C16.55 9.01 14.15 8 11.5 8c-2.16 0-4.13.75-5.69 2H7v9H-2V7l3.62 3.62C7.95 8.99 9.72 8 11.5 8c4.25 0 8.08 1.46 11.18 4.25l1.41-1.41c.68-.67.68-1.79 0-2.46z" />
            </svg>
          }
          label="Redo"
        />
      </div>
    </aside>
  );
};

