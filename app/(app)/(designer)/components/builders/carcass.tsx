// app/designer/components/builders/carcass.tsx
"use client";
import { Box } from "@react-three/drei";
import * as THREE from "three";
import { Dimensions, Carcass as CarcassType } from "../../../../../core/types";

interface CarcassProps {
  dimensions: Dimensions;
  carcass: CarcassType;
  material: React.ReactNode;
}

export const Carcass = ({ dimensions, carcass, material }: CarcassProps) => {
  const { width, height, depth } = dimensions;

  // Защита от undefined carcass
  if (!carcass) {
    console.warn("Carcass component received undefined carcass prop");
    return null;
  }

  const thickness = carcass.thickness;
  const backPanelThickness = carcass.backPanelThickness || 0.5;

  return (
    <group>
      {/* Левая стенка */}
      <Box
        args={[thickness, height, depth]}
        position={[-width / 2 + thickness / 2, height / 2, 0]}
        castShadow
        receiveShadow
      >
        {material}
      </Box>

      {/* Правая стенка */}
      <Box
        args={[thickness, height, depth]}
        position={[width / 2 - thickness / 2, height / 2, 0]}
        castShadow
        receiveShadow
      >
        {material}
      </Box>

      {/* Верхняя панель */}
      <Box
        args={[width - thickness * 2, thickness, depth]}
        position={[0, height - thickness / 2, 0]}
        castShadow
        receiveShadow
      >
        {material}
      </Box>

      {/* Нижняя панель (дно) */}
      <Box
        args={[width - thickness * 2, thickness, depth]}
        position={[0, thickness / 2, 0]}
        castShadow
        receiveShadow
      >
        {material}
      </Box>

      {/* Задняя стенка */}
      <Box
        args={[width, height, backPanelThickness]}
        position={[0, height / 2, -depth / 2 + backPanelThickness / 2]}
        castShadow
        receiveShadow
      >
        {material}
      </Box>
    </group>
  );
};
