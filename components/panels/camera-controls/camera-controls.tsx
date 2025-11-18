import { Button } from "@/components/ui/button";

interface CameraControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onRandomize?: () => void;
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

export const CameraControls = ({
  onZoomIn,
  onZoomOut,
  onRotate,
  onRandomize,
}: CameraControlsProps) => {
  return (
    <div className="w-full flex justify-center mt-[-28px] relative z-50">
      <div className="flex items-center p-1.5 gap-1 ux-glass rounded-full shadow-lg pointer-events-auto">
        <ControlButton
          icon={
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
            </svg>
          }
          label="Zoom In"
          onClick={onZoomIn}
        />

        <ControlButton
          icon={
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
            </svg>
          }
          label="Zoom Out"
          onClick={onZoomOut}
        />

        <ControlButton
          icon={
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.5 8H4v3.5h3.5V8zM13.5 2H10v3.5h3.5V2zm5.73 9.73L19 9.46l1.44-1.44c.39-.39 1.02-.39 1.41 0l2.34 2.34c.39.39.39 1.02 0 1.41L21.73 13.51l.71.71c.39.39.39 1.02 0 1.41l-2.34 2.34c-.39.39-1.02.39-1.41 0L19 14.54l-.23.23.71.71.71-.71.71.71c.39.39.39 1.02 0 1.41l-2.34 2.34c-.39.39-1.02.39-1.41 0l-2.34-2.34c-.39-.39-.39-1.02 0-1.41l.71-.71-.71-.71-.71.71c-.39.39-1.02.39-1.41 0l-2.34-2.34c-.39-.39-.39-1.02 0-1.41l2.34-2.34c.39-.39 1.02-.39 1.41 0l.71.71.71-.71z" />
            </svg>
          }
          label="Rotate"
          onClick={onRotate}
        />

        <ControlButton
          icon={
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
          }
          label="Randomize"
          onClick={onRandomize}
        />
      </div>
    </div>
  );
};

