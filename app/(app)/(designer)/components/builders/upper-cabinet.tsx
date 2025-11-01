// app/designer/components/builders/upper-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import type { RenderableModule } from "../../../../../core/types";
import { useMemo } from "react";
import { Carcass } from "./carcass";

/**
 * Upper Cabinet Builder Component
 * 
 * Renders wall-mounted upper cabinets with doors and shelves.
 * Similar to BaseCabinet but optimized for upper cabinet proportions and positioning.
 */

// Helper components for internal parts
interface DoorProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Door = ({ width, height, depth, position, color }: DoorProps) => (
  <Box position={position} args={[width, height, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

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

// Main upper cabinet builder component
export const UpperCabinet = ({ module }: { module: RenderableModule }) => {
  // Create materials once for optimization
  const carcassMaterial = useMemo(
    () => <meshStandardMaterial color="#CCCCCC" />,
    [],
  );
  const facadeMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color={module.materials.facade?.color || "lightblue"}
      />
    ),
    [module.materials.facade?.color],
  );

  // Generate internal elements based on structure
  const internalElements = useMemo(() => {
    const structure = module.structure;
    const carcass = module.carcass;

    if (!structure || !carcass) return null;

    const carcassThickness = carcass.thickness || 1.8;
    const internalWidth = module.dimensions.width - carcassThickness * 2;
    const internalDepth = module.dimensions.depth - carcassThickness;

    if (structure.type === "door-and-shelf") {
      const elements = [];

      // Draw shelves - upper cabinets typically have multiple shelves
      structure.shelves.forEach((shelf, index) => {
        elements.push(
          <Shelf
            key={`shelf-${index}`}
            width={internalWidth - 2}
            depth={internalDepth - 1}
            position={[0, shelf.positionFromBottom, 0]}
            color="#D2691E" // Shelf color
          />,
        );
      });

      // Draw doors - upper cabinets can have 1 or 2 doors
      const doorWidth = structure.doorCount === 1 
        ? internalWidth - 2 
        : (internalWidth - 4) / 2; // Account for center divider
      const doorHeight = module.dimensions.height - carcassThickness * 2 - 2;
      const doorDepth = 1.5;

      for (let i = 0; i < structure.doorCount; i++) {
        const doorX = structure.doorCount === 1 
          ? 0 
          : (i === 0 ? -doorWidth/2 - 1 : doorWidth/2 + 1);

        elements.push(
          <Door
            key={`door-${i}`}
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              doorX,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "lightblue"}
          />,
        );
      }

      // Add center divider for double door cabinets
      if (structure.doorCount === 2) {
        elements.push(
          <Box key="divider" position={[0, module.dimensions.height / 2, 0]} args={[1, module.dimensions.height - carcassThickness * 2, internalDepth]}>
            <meshStandardMaterial color="#CCCCCC" />
          </Box>
        );
      }

      return <>{elements}</>;
    }

    return null;
  }, [module, facadeMaterial]);

  return (
    <group position={[module.position.x, module.position.y, module.position.z]}>
      {/* 1. Draw the carcass frame */}
      <Carcass
        dimensions={module.dimensions}
        carcass={module.carcass}
        material={carcassMaterial}
      />

      {/* 2. Draw internal elements (doors, shelves) */}
      {internalElements}
    </group>
  );
};