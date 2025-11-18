// app/designer/components/builders/upper-cabinet.tsx
"use client";
import { Box } from "@react-three/drei";
import type { RenderableModule } from "../../../../../core/types";
import { useMemo } from "react";
import * as THREE from "three";
import { Carcass } from "./carcass";
import { AnimatedDoor, DoubleDoor } from "./animated-door";
import { FACADE_GAP } from "./constants";
import { useCabinetMaterial } from "./useCabinetMaterial";
import { useShaderMaterialFromDefinition } from "./useShaderMaterial";

/**
 * Upper Cabinet Builder Component
 *
 * Renders wall-mounted upper cabinets with doors and shelves.
 * Similar to BaseCabinet but optimized for upper cabinet proportions and positioning.
 */

// Helper components for internal parts
// Legacy Door component - replaced by AnimatedDoor

interface ShelfProps {
  width: number;
  depth: number;
  position: [number, number, number];
  color: string;
}

const Shelf = ({ width, depth, position, color }: ShelfProps) => (
  <Box position={position} args={[width, 1.5, depth]} castShadow receiveShadow>
    <meshStandardMaterial color={color} />
  </Box>
);

// Main upper cabinet builder component
export const UpperCabinet = ({ module }: { module: RenderableModule }) => {
  // Load materials at top level (Hook rules)
  // Memory: Hooks must be called at top level of component
  const shaderMaterial = useShaderMaterialFromDefinition(
    module.materials?.facade
  );
  const standardMaterial = useCabinetMaterial(module.materials?.facade);

  // Use shader material if available, otherwise fall back to standard material
  // Memoize to prevent infinite loops from async material updates
  // Important: Must have a fallback color to ensure rendering doesn't block on undefined materials
  const facadeMaterial = useMemo(
    () =>
      (shaderMaterial as THREE.Material | null) ||
      standardMaterial ||
      new THREE.MeshStandardMaterial({
        color: module.materials?.facade?.color || "#8B7355",
      }),
    [shaderMaterial, standardMaterial, module.materials?.facade?.color]
  );

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
    const backPanelThickness = carcass.backPanelThickness || 0.5;
    const internalWidth = module.dimensions.width - carcassThickness * 2;
    const internalDepth =
      module.dimensions.depth - carcassThickness - backPanelThickness;

    if (structure.type === "door-and-shelf") {
      const elements = [];

      // Draw shelves - upper cabinets typically have multiple shelves
      // Shelves should be positioned inside the cabinet, accounting for back panel
      const shelfZOffset = (carcassThickness - backPanelThickness) / 2;
      structure.shelves.forEach((shelf) => {
        elements.push(
          <Shelf
            key={`shelf-${shelf.positionFromBottom}`}
            width={internalWidth}
            depth={internalDepth - 1}
            position={[0, shelf.positionFromBottom, shelfZOffset]}
            color="#D2691E" // Shelf color
          />
        );
      });

      // Draw animated doors - upper cabinets can have 1 or 2 doors
      const doorWidth = internalWidth;
      const doorHeight =
        module.dimensions.height - carcassThickness * 2 - FACADE_GAP * 2;
      const doorDepth = 1.5;

      if (structure.doorCount === 1) {
        // Single door
        elements.push(
          <AnimatedDoor
            key="single-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - carcassThickness - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
            config={{
              openAngle: Math.PI / 3, // Upper cabinets open less to avoid head bumping
              duration: 600, // Slightly faster for upper cabinets
            }}
          />
        );
      } else if (structure.doorCount === 2) {
        // Double doors
        elements.push(
          <DoubleDoor
            key="double-door"
            width={doorWidth}
            height={doorHeight}
            depth={doorDepth}
            position={[
              0,
              carcassThickness + doorHeight / 2,
              (module.dimensions.depth - carcassThickness - doorDepth) / 2,
            ]}
            color={module.materials.facade?.color || "#8B7355"}
            material={facadeMaterial}
            gap={0} // No gap - modern kitchen style
            config={{
              openAngle: Math.PI / 3, // Upper cabinets open less
              duration: 600,
            }}
          />
        );
      }

      // Add center divider for double door cabinets
      if (structure.doorCount === 2) {
        elements.push(
          <Box
            key="divider"
            position={[0, module.dimensions.height / 2, 0]}
            args={[
              1,
              module.dimensions.height - carcassThickness * 2,
              internalDepth,
            ]}
          >
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
