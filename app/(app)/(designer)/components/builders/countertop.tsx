// app/designer/components/builders/countertop.tsx
"use client";
import { Box } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type {
  RenderableModule,
  KitchenConfig,
  MaterialDefinition,
} from "../../../../../core/types";
import { useShaderMaterialFromDefinition } from "./useShaderMaterial";

interface CountertopProps {
  modules: RenderableModule[];
  kitchenConfig: KitchenConfig;
  countertopMaterial?: MaterialDefinition;
}

interface CountertopSegment {
  start: number;
  end: number;
  z: number;
  rotation: number;
  width: number;
  centerX: number;
}

/**
 * Countertop builder component
 * Creates continuous countertop segments across base cabinets in the same layout line
 */
export const Countertop = ({
  modules,
  kitchenConfig,
  countertopMaterial,
}: CountertopProps) => {
  const {
    countertopHeight,
    countertopDepth,
    countertopThickness,
    plinthHeight,
  } = kitchenConfig.globalSettings.dimensions;
  const gapBetweenModules =
    kitchenConfig.globalSettings.rules.gapBetweenModules;

  // Countertop overhang (выступ столешницы вперед) - обычно 3-5 см
  const countertopOverhang = 4; // см

  // Group modules by layout lines and create continuous countertop segments
  const countertopSegments = useMemo(() => {
    const segments: CountertopSegment[] = [];

    // Filter only base cabinets (base, sink) - tall cabinets don't have countertops
    const baseModules = modules.filter(
      (module) => module.type === "base" || module.type === "sink"
    );

    if (baseModules.length === 0) return segments;

    // Group modules by rotation and z position (same layout line)
    const groupedModules = baseModules.reduce((groups, module) => {
      const key = `${module.rotation.y}_${module.position.z}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(module);
      return groups;
    }, {} as Record<string, RenderableModule[]>);

    // Create countertop segments for each group
    Object.values(groupedModules).forEach((group) => {
      if (group.length === 0) return;

      // Sort modules by position X
      const sortedModules = group.sort((a, b) => a.position.x - b.position.x);

      const rotation = sortedModules[0].rotation.y;
      const z = sortedModules[0].position.z;

      // Calculate start position (left edge of first module)
      let currentStart =
        sortedModules[0].position.x - sortedModules[0].dimensions.width / 2;
      let currentEnd =
        sortedModules[0].position.x + sortedModules[0].dimensions.width / 2;

      for (let i = 1; i < sortedModules.length; i++) {
        const module = sortedModules[i];
        const moduleStart = module.position.x - module.dimensions.width / 2;
        const moduleEnd = module.position.x + module.dimensions.width / 2;

        // Check if modules are adjacent (accounting for gapBetweenModules)
        const gap = gapBetweenModules || 0;
        if (moduleStart <= currentEnd + gap + 0.1) {
          // Extend current segment
          currentEnd = moduleEnd;
        } else {
          // Save current segment and start new one
          const width = currentEnd - currentStart;
          const centerX = (currentStart + currentEnd) / 2;
          segments.push({
            start: currentStart,
            end: currentEnd,
            z,
            rotation,
            width,
            centerX,
          });
          currentStart = moduleStart;
          currentEnd = moduleEnd;
        }
      }

      // Add last segment
      const width = currentEnd - currentStart;
      const centerX = (currentStart + currentEnd) / 2;
      segments.push({
        start: currentStart,
        end: currentEnd,
        z,
        rotation,
        width,
        centerX,
      });
    });

    return segments;
  }, [modules, gapBetweenModules]);

  // Create material from countertopMaterial definition
  const material = useMemo(() => {
    if (!countertopMaterial) {
      // Default material if none provided
      return <meshStandardMaterial color="#E8E8E8" roughness={0.6} />;
    }

    // Try to load shader material first
    const shaderMaterial = useShaderMaterialFromDefinition(countertopMaterial);
    
    if (shaderMaterial) {
      return shaderMaterial as React.ReactNode;
    }

    // Fallback to standard material
    return (
      <meshStandardMaterial
        color={countertopMaterial.color || "#E8E8E8"}
        roughness={countertopMaterial.roughness ?? 0.6}
        metalness={countertopMaterial.metalness ?? 0.0}
      />
    );
  }, [countertopMaterial]);

  return (
    <group>
      {countertopSegments.map((segment, index) => {
        // Calculate countertop depth with overhang
        const countertopTotalDepth = countertopDepth + countertopOverhang;

        // Calculate Z position offset for overhang
        // Overhang should be in front of the cabinet (towards the facade)
        // The front of cabinets faces forward (positive Z direction in this coordinate system)
        // So we shift the countertop forward (positive Z) by half the overhang
        const rotationRad = (segment.rotation * Math.PI) / 180;
        const zOffset = countertopOverhang / 2; // Forward (positive Z - towards facade)
        const xOffset = 0; // No X offset for 0° rotation

        return (
          <Box
            key={`countertop-${segment.start}-${segment.end}-${segment.z}-${segment.rotation}-${index}`}
            args={[segment.width, countertopThickness, countertopTotalDepth]}
            position={[
              segment.centerX + xOffset,
              plinthHeight + countertopHeight + countertopThickness / 2,
              segment.z + zOffset,
            ]}
            rotation={[0, rotationRad, 0]}
          >
            {material}
          </Box>
        );
      })}
    </group>
  );
};
