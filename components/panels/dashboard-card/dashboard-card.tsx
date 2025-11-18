export const DashboardCard = () => {
  return (
    <div className="w-40 h-40 ux-glass rounded-lg p-2 pointer-events-auto">
      <div className="w-full h-full border-2 border-dashed border-border rounded-sm p-2">
        <div className="relative w-full h-full">
          <div className="absolute bg-primary/70 h-2 w-1/2 top-0 left-0"></div>
          <div className="absolute bg-primary/70 w-2 h-1/3 top-0 left-0"></div>
          <div className="absolute bg-primary/70 w-2 h-1/2 bottom-0 left-0"></div>
        </div>
      </div>
    </div>
  );
};

