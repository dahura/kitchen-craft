/**
 * geometry-based-cabinet.tsx
 * 
 * Example builder component that uses the geometry-generator utilities.
 * Demonstrates integration between the framework-agnostic geometry generator
 * and React Three Fiber components.
 * 
 * Part of Kitchen-Kraft MVP - MVP-02: Geometry Generator Core
 */

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RenderableModule } from '../../../../../core/types';
import {
  generateModuleGeometry,
  createMeshesFromGeometryData,
  disposeGeometry,
  type ModuleGeometryData,
} from './geometry-generator';

interface GeometryBasedCabinetProps {
  module: RenderableModule;
  interactive?: boolean;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

/**
 * Cabinet component built using the geometry-generator utilities.
 * This demonstrates how to integrate the pure Three.js geometry generator
 * with React Three Fiber's declarative component model.
 */
export const GeometryBasedCabinet: React.FC<GeometryBasedCabinetProps> = ({
  module,
  interactive = false,
  onHover,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  // Generate geometry data using the geometry-generator
  const geometryData = useMemo<ModuleGeometryData>(() => {
    console.log(`Generating geometry for module ${module.id}`);
    return generateModuleGeometry(module);
  }, [module]);

  // Create Three.js meshes from geometry data
  const meshGroup = useMemo(() => {
    const group = createMeshesFromGeometryData(
      geometryData,
      module.position,
      module.rotation
    );
    
    // Add interactivity metadata if needed
    if (interactive) {
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // @ts-ignore - Adding custom property for raycasting
          object.userData.moduleId = module.id;
          object.userData.interactive = true;
        }
      });
    }
    
    return group;
  }, [geometryData, module.position, module.rotation, interactive]);

  // Update group reference when meshGroup changes
  useEffect(() => {
    if (groupRef.current && meshGroup) {
      // Clear existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Add new meshes
      meshGroup.children.forEach((child) => {
        groupRef.current?.add(child.clone());
      });
    }

    // Cleanup on unmount
    return () => {
      if (meshGroup) {
        disposeGeometry(meshGroup);
      }
    };
  }, [meshGroup]);

  // Optional: Add hover effect
  useFrame(() => {
    if (groupRef.current && interactive) {
      const targetScale = hovered ? 1.02 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handlePointerOver = (event: any) => {
    if (interactive) {
      event.stopPropagation();
      setHovered(true);
      onHover?.(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (event: any) => {
    if (interactive) {
      event.stopPropagation();
      setHovered(false);
      onHover?.(false);
      document.body.style.cursor = 'auto';
    }
  };

  const handleClick = (event: any) => {
    if (interactive) {
      event.stopPropagation();
      onClick?.();
    }
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
};

/**
 * Simplified version that directly renders meshes without interactivity
 * More performant for static scenes
 */
export const SimpleGeometryBasedCabinet: React.FC<{ module: RenderableModule }> = ({
  module,
}) => {
  const meshGroup = useMemo(() => {
    const geometryData = generateModuleGeometry(module);
    return createMeshesFromGeometryData(
      geometryData,
      module.position,
      module.rotation
    );
  }, [module]);

  useEffect(() => {
    return () => {
      if (meshGroup) {
        disposeGeometry(meshGroup);
      }
    };
  }, [meshGroup]);

  return <primitive object={meshGroup} />;
};

/**
 * Performance-optimized version using React.memo
 */
export const OptimizedGeometryBasedCabinet = React.memo<GeometryBasedCabinetProps>(
  GeometryBasedCabinet,
  (prevProps, nextProps) => {
    // Only re-render if module data actually changed
    return (
      prevProps.module.id === nextProps.module.id &&
      prevProps.module.position === nextProps.module.position &&
      prevProps.module.rotation === nextProps.module.rotation &&
      prevProps.module.dimensions === nextProps.module.dimensions &&
      prevProps.interactive === nextProps.interactive
    );
  }
);

OptimizedGeometryBasedCabinet.displayName = 'OptimizedGeometryBasedCabinet';
