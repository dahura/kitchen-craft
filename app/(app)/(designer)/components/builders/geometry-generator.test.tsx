/**
 * geometry-generator.test.tsx
 *
 * Test scene for the geometry generator.
 * Demonstrates all features and validates the implementation.
 *
 * Usage: Import and render this component to see the geometry generator in action.
 */

"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Stats } from "@react-three/drei";
import * as THREE from "three";
import type { RenderableModule } from "../../../../../core/types";
import {
  GeometryBasedCabinet,
  SimpleGeometryBasedCabinet,
  OptimizedGeometryBasedCabinet,
} from "./geometry-based-cabinet";
import {
  generateScene,
  createBoxGeometry,
  createPlaneGeometry,
  createColorMaterial,
} from "./geometry-generator";

/**
 * Test module data
 */
const createTestModule = (
  id: string,
  x: number,
  structureType: "drawers" | "door-and-shelf",
  color: string,
): RenderableModule => ({
  id,
  type: "base",
  variant: "standard",
  position: { x, y: 10, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  dimensions: { width: 60, height: 72, depth: 60 },
  structure:
    structureType === "drawers"
      ? {
          type: "drawers",
          count: 3,
          drawerHeights: [20, 24, 24],
          internalDepth: 55,
        }
      : {
          type: "door-and-shelf",
          doorCount: 1,
          shelves: [{ positionFromBottom: 36 }],
        },
  carcass: {
    thickness: 1.8,
    backPanelThickness: 0.5,
  },
  materials: {
    facade: {
      type: "paint",
      color,
      roughness: 0.2,
      metalness: 0.1,
    },
  },
  children: [],
});

/**
 * Component that displays multiple test cabinets
 */
const TestCabinets: React.FC = () => {
  const testModules = useMemo(
    () => [
      createTestModule("test-1", 0, "drawers", "#3498db"),
      createTestModule("test-2", 70, "door-and-shelf", "#e74c3c"),
      createTestModule("test-3", 140, "drawers", "#2ecc71"),
    ],
    [],
  );

  return (
    <>
      {testModules.map((module, index) => {
        // Demonstrate different component variants
        if (index === 0) {
          return (
            <GeometryBasedCabinet
              key={module.id}
              module={module}
              interactive={true}
              onHover={(hovered) =>
                console.log(`Module ${module.id} hovered:`, hovered)
              }
              onClick={() => console.log(`Module ${module.id} clicked!`)}
            />
          );
        } else if (index === 1) {
          return <SimpleGeometryBasedCabinet key={module.id} module={module} />;
        } else {
          return (
            <OptimizedGeometryBasedCabinet
              key={module.id}
              module={module}
              interactive={false}
            />
          );
        }
      })}
    </>
  );
};

/**
 * Component that displays a complete scene using generateScene
 */
const CompleteSceneTest: React.FC = () => {
  const sceneGroup = useMemo(() => {
    const modules: RenderableModule[] = [
      createTestModule("scene-1", -100, "drawers", "#9b59b6"),
      createTestModule("scene-2", -30, "door-and-shelf", "#f39c12"),
    ];

    return generateScene(modules);
  }, []);

  return <primitive object={sceneGroup} />;
};

/**
 * Test basic geometries
 */
const BasicGeometryTest: React.FC = () => {
  const testGeometries = useMemo(() => {
    const geometries = [];

    // Box with UV scaling
    const box = new THREE.Mesh(
      createBoxGeometry(20, 20, 20, { u: 2, v: 2 }),
      createColorMaterial("#16a085", 0.4, 0.0),
    );
    box.position.set(-250, 10, 100);
    geometries.push(box);

    // Plane with UV scaling
    const plane = new THREE.Mesh(
      createPlaneGeometry(40, 40, 1, 1, { u: 4, v: 4 }),
      createColorMaterial("#c0392b", 0.6, 0.0),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(-250, 0, 150);
    geometries.push(plane);

    return geometries;
  }, []);

  return (
    <>
      {testGeometries.map((mesh, index) => (
        <primitive key={`basic-${index}`} object={mesh} />
      ))}
    </>
  );
};

/**
 * Floor grid helper
 */
const FloorGrid: React.FC = () => {
  const gridSize = 500;
  const divisions = 50;

  return (
    <>
      {/* Floor plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>

      {/* Grid helper */}
      <Grid
        args={[gridSize, divisions]}
        cellColor="#bdc3c7"
        sectionColor="#95a5a6"
        fadeDistance={300}
        fadeStrength={1}
        position={[0, 0, 0]}
      />
    </>
  );
};

/**
 * Lighting setup
 */
const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <pointLight position={[0, 100, 0]} intensity={0.3} />
    </>
  );
};

/**
 * Info panel
 */
const InfoPanel: React.FC = () => {
  return (
    <div className="absolute top-2.5 left-2.5 bg-black/70 text-white p-4 rounded-lg font-mono text-xs z-[1000] max-w-md">
      <h3 className="mb-2.5">🧪 Geometry Generator Test Scene</h3>
      <div className="leading-relaxed">
        <div>
          <strong>Module 1 (Blue):</strong> Interactive with hover/click
        </div>
        <div>
          <strong>Module 2 (Red):</strong> Simple non-interactive
        </div>
        <div>
          <strong>Module 3 (Green):</strong> Optimized variant
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-muted-foreground/50">
          <div>
            <strong>Purple & Orange:</strong> Generated via generateScene()
          </div>
          <div>
            <strong>Left side:</strong> Basic geometry tests
          </div>
        </div>
        <div className="mt-2.5 text-[10px] text-muted-foreground">
          Use mouse to orbit, zoom, and pan
        </div>
      </div>
    </div>
  );
};

/**
 * Main test scene component
 */
export const GeometryGeneratorTestScene: React.FC = () => {
  return (
    <div className="w-screen h-screen relative">
      <InfoPanel />
      <Canvas
        shadows
        camera={{ position: [200, 150, 200], fov: 45 }}
        className="bg-muted"
      >
        <Lighting />
        <FloorGrid />

        {/* Test individual React components */}
        <TestCabinets />

        {/* Test complete scene generation */}
        <CompleteSceneTest />

        {/* Test basic geometries */}
        <BasicGeometryTest />

        {/* Controls */}
        <OrbitControls target={[0, 40, 0]} enableDamping dampingFactor={0.05} />

        {/* Performance stats */}
        <Stats />
      </Canvas>
    </div>
  );
};

/**
 * Export as default for easy page integration
 */
export default GeometryGeneratorTestScene;
