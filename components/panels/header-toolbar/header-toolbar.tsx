import { Button } from "@/components/ui/button";

export const HeaderToolbar = () => {
  return (
    <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start">
      <div className="flex items-center gap-2">
        <div className="ux-glass rounded-lg">
          <Button variant="ghost" className="px-4 py-2 rounded-l-lg">
            File
          </Button>
          <div className="inline-block h-6 w-px bg-border mx-0"></div>
          <Button variant="ghost" className="px-4 py-2">
            Edit
          </Button>
          <div className="inline-block h-6 w-px bg-border mx-0"></div>
          <Button variant="ghost" className="px-4 py-2 rounded-r-lg">
            View
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Button variant="outline" className="ux-glass">
            Share
          </Button>
          <div className="absolute top-full right-0 mt-2 px-3 py-1 text-xs bg-popover text-popover-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Share your design
          </div>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Save Project
        </Button>
      </div>
    </header>
  );
};

