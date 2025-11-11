// app/designer/components/builders/tall-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import type { RenderableModule } from "../../../../../core/types";
import { useMemo } from "react";
import * as THREE from "three";
import { Carcass } from "./carcass";
import { AnimatedDoor, DoubleDoor } from "./animated-door";
import { AnimatedDrawer } from "./animated-drawer";
import { FACADE_GAP } from "./constants";
import { useCabinetMaterial } from "./useCabinetMaterial";
import { useShaderMaterialFromDefinition } from "./useShaderMaterial";

/**
 * Tall Cabinet Builder Component
 *
 * Renders floor-to-ceiling tall cabinets (pantries, appliance housings, etc.).
 * These cabinets are typically 200-220cm tall and can have mixed storage solutions.
 */

// Legacy Door component - replaced by AnimatedDoor

interface ShelfProps {
  width: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Shelf = ({ width, depth, position, color }: ShelfProps) => (
  <Box position={position} args={[width, 1.5, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

// Main tall cabinet builder component
export const TallCabinet = ({ module }: { module: RenderableModule }) => {
  // Try to load shader material first (if shaderId is defined)
  // Fall back to standard material if no shader is available
  // Memory: Shader materials provide realistic PBR rendering for better visualization
  const shaderMaterial = useShaderMaterialFromDefinition(
    module.materials?.facade
  );
  const standardMaterial = useCabinetMaterial(module.materials?.facade);

  // Use shader material if available, otherwise fall back to standard material
  const facadeMaterial =
    (shaderMaterial as THREE.Material | null) || standardMaterial;

  // Create materials once for optimization
  const carcassMaterial = useMemo(
    () => <meshStandardMaterial color="#CCCCCC" />,
    []
  );

  // Generate internal elements based on structure
  const internalElements = useMemo(() => {
    const structure = module.structure;
    const carcass = module.carcass;

    if (!structure || !carcass) return null;

    const carcassThickness = carcass.thickness || 1.8;
    const internalWidth = module.dimensions.width - carcassThickness * 2;
    const internalDepth = module.dimensions.depth - carcassThickness;

    if (structure.type === "drawers") {
      const elements = [];
      const availableHeight = module.dimensions.height - carcassThickness * 2;
      const totalDrawerHeight = structure.drawerHeights.reduce(
        (sum, h) => sum + h,
        0
      );
      const totalGapHeight = FACADE_GAP * (structure.count - 1); // Зазоры только между ящиками
      const scaleFactor =
        (availableHeight - totalGapHeight) / totalDrawerHeight;

      let currentY = carcassThickness; // Start from bottom

      for (let i = 0; i < structure.count; i++) {
        const scaledDrawerHeight = structure.drawerHeights[i] * scaleFactor;
        const isLastDrawer = i === structure.count - 1;
        // У последнего ящика нет зазора сверху, у остальных - есть
        const actualDrawerHeight = isLastDrawer
          ? scaledDrawerHeight
          : scaledDrawerHeight - FACADE_GAP;

        elements.push(
          <AnimatedDrawer
            key={i}
            width={internalWidth}
            height={actualDrawerHeight}
            depth={structure.internalDepth}
            position={[
              0,
              currentY + actualDrawerHeight / 2,
              (module.dimensions.depth - structure.internalDepth) / 2,
            ]}
            color="#8B4513" // Fallback color for drawers
            material={facadeMaterial}
          />
        );

        // Добавляем масштабированную высоту ящика (для промежуточных - зазор учтен в actualDrawerHeight)
        currentY += scaledDrawerHeight;
        // Добавляем зазор после ящика (кроме последнего)
        if (!isLastDrawer) {
          currentY += FACADE_GAP;
        }
      }
      return <>{elements}</>;
    }

    if (structure.type === "door-and-shelf") {
      const elements = [];

      // Draw multiple shelves - tall cabinets have many shelves
      // positionFromBottom is relative to the bottom of the module (including carcass)
      structure.shelves.forEach((shelf) => {
        // Convert positionFromBottom to position relative to module center
        // Module center is at height/2, so shelf Y = positionFromBottom - height/2 + carcassThickness
        const shelfY =
          shelf.positionFromBottom -
          module.dimensions.height / 2 +
          carcassThickness;
        elements.push(
          <Shelf
            key={`shelf-${shelf.positionFromBottom}`}
            width={internalWidth}
            depth={internalDepth - 1}
            position={[0, shelfY, 0]}
            color="#D2691E" // Shelf color
          />
        );
      });

      // Draw animated doors - tall cabinets typically have 2 doors
      const doorWidth = internalWidth;
      const doorHeight =
        module.dimensions.height - carcassThickness * 2 - FACADE_GAP * 2;
      const doorDepth = 1.5;

      if (structure.doorCount === 1) {
        // Single door for narrow tall cabinets
        elements.push(
          <AnimatedDoor
            key="single-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
            config={{
              openAngle: Math.PI / 2.5, // Tall cabinets open moderately
              duration: 1000, // Slower for tall doors
            }}
          />
        );
      } else if (structure.doorCount === 2) {
        // Double doors for wide tall cabinets
        elements.push(
          <DoubleDoor
            key="double-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
            gap={0} // No gap - modern kitchen style
            config={{
              openAngle: Math.PI / 2.5, // Tall cabinets open moderately
              duration: 1000, // Slower for tall doors
            }}
          />
        );
      }

      return <>{elements}</>;
    }

    return null;
  }, [module]);

  return (
    <group position={[module.position.x, module.position.y, module.position.z]}>
      {/* 1. Draw the carcass frame */}
      <Carcass
        dimensions={module.dimensions}
        carcass={module.carcass}
        material={carcassMaterial}
      />

      {/* 2. Draw internal elements (doors, shelves, drawers) */}
      {internalElements}
    </group>
  );
};
