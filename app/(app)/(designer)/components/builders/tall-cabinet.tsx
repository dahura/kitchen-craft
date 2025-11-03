// app/designer/components/builders/tall-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import type { RenderableModule } from "../../../../../core/types";
import { useMemo } from "react";
import { Carcass } from "./carcass";
import { AnimatedDoor, DoubleDoor } from "./animated-door";

/**
 * Tall Cabinet Builder Component
 * 
 * Renders floor-to-ceiling tall cabinets (pantries, appliance housings, etc.).
 * These cabinets are typically 200-220cm tall and can have mixed storage solutions.
 */

// Helper components for internal parts
interface DrawerProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Drawer = ({ width, height, depth, position, color }: DrawerProps) => (
  <Box position={position} args={[width, height, depth]}>
    <meshStandardMaterial color={color} />
  </Box>
);

interface DoorProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

// Legacy Door component - replaced by AnimatedDoor
// const Door = ({ width, height, depth, position, color }: DoorProps) => (
//   <Box position={position} args={[width, height, depth]}>
//     <meshStandardMaterial color={color} />
//   </Box>
// );

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

    if (structure.type === "drawers") {
      const elements = [];
      let currentY = carcassThickness; // Start from bottom

      for (let i = 0; i < structure.count; i++) {
        const drawerHeight = structure.drawerHeights[i];
        elements.push(
          <Drawer
            key={i}
            width={internalWidth - 2} // Small gap on sides
            height={drawerHeight - 2} // Small gap on top
            depth={structure.internalDepth}
            position={[
              0,
              currentY + drawerHeight / 2,
              (module.dimensions.depth - structure.internalDepth) / 2,
            ]}
            color="#8B4513" // Drawer color
          />,
        );
        currentY += drawerHeight + 1; // Add drawer height and gap
      }
      return <>{elements}</>;
    }

    if (structure.type === "door-and-shelf") {
      const elements = [];

      // Draw multiple shelves - tall cabinets have many shelves
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

      // Draw animated doors - tall cabinets typically have 2 doors
      const doorWidth = structure.doorCount === 1 
        ? internalWidth - 2 
        : (internalWidth - 4) / 2; // Account for center divider
      const doorHeight = module.dimensions.height - carcassThickness * 2 - 2;
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
            width={doorWidth * 2 + 4} // Total width including divider
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            gap={4} // Gap for center divider
            config={{
              openAngle: Math.PI / 2.5, // Tall cabinets open moderately
              duration: 1000, // Slower for tall doors
            }}
          />
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

      {/* 2. Draw internal elements (doors, shelves, drawers) */}
      {internalElements}
    </group>
  );
};