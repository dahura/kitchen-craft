// components/room-materials-panel.tsx
"use client";
import { useState } from "react";
import { useRoomMaterialsManager } from "../hooks/useRoomMaterials";
import { roomMaterialPresets } from "../../../lib/store/room-materials-store";
import { getAvailableRoomTextures } from "../../../../core/libraries/room-texture-library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const RoomMaterialsPanel = () => {
  const {
    roomMaterials,
    setSurfaceColor,
    setSurfaceTexture,
    updateMaterialProperties,
    applyPreset,
  } = useRoomMaterialsManager();
  const [activeSurface, setActiveSurface] = useState<
    "walls" | "floor" | "ceiling"
  >("walls");

  const currentMaterial = roomMaterials[activeSurface];
  const availableTextures = getAvailableRoomTextures(
    activeSurface === "ceiling"
      ? "ceilings"
      : activeSurface === "walls"
      ? "walls"
      : "floors"
  );

  const handleColorChange = (color: string) => {
    setSurfaceColor(activeSurface, color);
  };

  const handleTextureChange = (textureId: string) => {
    setSurfaceTexture(activeSurface, textureId);
  };

  const handlePropertyChange = (
    property: "roughness" | "metalness" | "scale",
    value: number
  ) => {
    updateMaterialProperties(activeSurface, { [property]: value });
  };

  const handlePresetChange = (presetName: keyof typeof roomMaterialPresets) => {
    applyPreset(roomMaterialPresets[presetName]);
  };

  return (
    <Card className="absolute top-5 right-5 w-80 z-[1000] backdrop-blur-sm bg-background/95 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Материалы комнаты</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Выбор поверхности */}
        <Tabs value={activeSurface} onValueChange={(value) => setActiveSurface(value as "walls" | "floor" | "ceiling")}>
          <Label className="text-sm font-medium">Поверхность:</Label>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="walls" className="text-xs">Стены</TabsTrigger>
            <TabsTrigger value="floor" className="text-xs">Пол</TabsTrigger>
            <TabsTrigger value="ceiling" className="text-xs">Потолок</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Тип материала */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Тип материала:</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              id="material-color"
              variant={currentMaterial.type === "color" ? "default" : "outline"}
              size="sm"
              onClick={() => handleColorChange("#FFFFFF")}
              className="flex-1 text-xs"
            >
              Цвет
            </Button>
            <Button
              type="button"
              id="material-texture"
              variant={currentMaterial.type === "texture" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                availableTextures.length > 0 &&
                handleTextureChange(availableTextures[0])
              }
              disabled={availableTextures.length === 0}
              className="flex-1 text-xs"
            >
              Текстура
            </Button>
          </div>
        </div>

        {/* Выбор цвета */}
        {currentMaterial.type === "color" && (
          <div className="space-y-2">
            <Label htmlFor={`color-${activeSurface}`} className="text-sm font-medium">
              Цвет:
            </Label>
            <Input
              id={`color-${activeSurface}`}
              type="color"
              value={currentMaterial.value as string}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 cursor-pointer"
            />
          </div>
        )}

        {/* Выбор текстуры */}
        {currentMaterial.type === "texture" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Текстура:</Label>
            {availableTextures.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {availableTextures.map((textureId) => {
                  const isSelected =
                    (currentMaterial.value as string) === textureId;
                  const displayName = textureId
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  return (
                    <Button
                      key={textureId}
                      type="button"
                      id={`texture-${textureId}-${activeSurface}`}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTextureChange(textureId)}
                      className={cn(
                        "h-auto p-2 flex flex-col items-center gap-1 text-xs",
                        isSelected && "ring-2 ring-ring ring-offset-2"
                      )}
                    >
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-primary/40 border border-border flex items-center justify-center text-base">
                        🎨
                      </div>
                      <span className="leading-tight text-center">{displayName}</span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-muted rounded text-xs text-muted-foreground text-center">
                Нет доступных текстур для{" "}
                {activeSurface === "walls"
                  ? "стен"
                  : activeSurface === "floor"
                  ? "пола"
                  : "потолка"}
              </div>
            )}
          </div>
        )}

        {/* Свойства материала */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`roughness-${activeSurface}`} className="text-sm font-medium">
              Шероховатость: {currentMaterial.roughness?.toFixed(2)}
            </Label>
            <Slider
              id={`roughness-${activeSurface}`}
              min={0}
              max={1}
              step={0.01}
              value={[currentMaterial.roughness || 0.8]}
              onValueChange={([value]) =>
                handlePropertyChange("roughness", value)
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`metalness-${activeSurface}`} className="text-sm font-medium">
              Металличность: {currentMaterial.metalness?.toFixed(2)}
            </Label>
            <Slider
              id={`metalness-${activeSurface}`}
              min={0}
              max={1}
              step={0.01}
              value={[currentMaterial.metalness || 0]}
              onValueChange={([value]) =>
                handlePropertyChange("metalness", value)
              }
              className="w-full"
            />
          </div>

          {currentMaterial.type === "texture" && (
            <div className="space-y-2">
              <Label htmlFor={`scale-${activeSurface}`} className="text-sm font-medium">
                Масштаб: {currentMaterial.scale?.toFixed(1)}
              </Label>
              <Slider
                id={`scale-${activeSurface}`}
                min={0.5}
                max={5}
                step={0.1}
                value={[currentMaterial.scale || 1]}
                onValueChange={([value]) =>
                  handlePropertyChange("scale", value)
                }
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Предустановки */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Предустановки:</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              id="preset-modern"
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange("modern")}
              className="flex-1 text-xs"
            >
              Современный
            </Button>
            <Button
              type="button"
              id="preset-industrial"
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange("industrial")}
              className="flex-1 text-xs"
            >
              Индустриальный
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
