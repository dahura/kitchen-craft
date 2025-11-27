import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  MessageCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface ControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onRandomize?: () => void;
  onChatToggle?: () => void;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ControlButton = ({ icon, label, onClick }: ControlButtonProps) => (
  <div className="relative group">
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-accent h-10 w-10"
      onClick={onClick}
    >
      {icon}
    </Button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-xs bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
      {label}
    </div>
  </div>
);

export const Controls = ({
  onZoomIn,
  onZoomOut,
  onRotate,
  onRandomize,
  onChatToggle,
}: ControlsProps) => {
  return (
    <div className="w-full flex justify-center mt-[-28px] relative z-50">
      <div className="flex items-center p-1.5 gap-1 ux-glass rounded-full shadow-lg pointer-events-auto">
        <ControlButton
          icon={<ZoomIn className="w-5 h-5" />}
          label="Zoom In"
          onClick={onZoomIn}
        />

        <ControlButton
          icon={<ZoomOut className="w-5 h-5" />}
          label="Zoom Out"
          onClick={onZoomOut}
        />

        <ControlButton
          icon={<RotateCcw className="w-5 h-5" />}
          label="Rotate"
          onClick={onRotate}
        />

        <ControlButton
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          }
          label="Randomize"
          onClick={onRandomize}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-border/30" />

        {/* Chat button */}
        <ControlButton
          icon={<MessageCircle className="w-5 h-5" />}
          label="Chat"
          onClick={onChatToggle}
        />
      </div>
    </div>
  );
};





