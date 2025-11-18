"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface RightSidebarProps {
  materialSelect: string;
  widthValue: number[];
  heightValue: number[];
  onMaterialChange: (value: string) => void;
  onWidthChange: (value: number[]) => void;
  onHeightChange: (value: number[]) => void;
}

export const RightSidebar = ({
  materialSelect,
  widthValue,
  heightValue,
  onMaterialChange,
  onWidthChange,
  onHeightChange,
}: RightSidebarProps) => {
  return (
    <aside className="absolute top-1/2 right-4 -translate-y-1/2 z-20 ux-glass rounded-lg p-4 w-72 space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Properties</h3>

      <div className="space-y-2">
        <Label htmlFor="material" className="text-sm font-medium">
          Material
        </Label>
        <Select value={materialSelect} onValueChange={onMaterialChange}>
          <SelectTrigger id="material" className="ux-glass border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark-oak">Dark Oak</SelectItem>
            <SelectItem value="light-maple">Light Maple</SelectItem>
            <SelectItem value="gloss-white">Gloss White</SelectItem>
            <SelectItem value="matte-black">Matte Black</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="width" className="text-sm font-medium">
          Width: {widthValue[0]}cm
        </Label>
        <Slider
          id="width"
          min={30}
          max={120}
          step={1}
          value={widthValue}
          onValueChange={onWidthChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="height" className="text-sm font-medium">
          Height: {heightValue[0]}cm
        </Label>
        <Slider
          id="height"
          min={40}
          max={100}
          step={1}
          value={heightValue}
          onValueChange={onHeightChange}
          className="w-full"
        />
      </div>
    </aside>
  );
};

