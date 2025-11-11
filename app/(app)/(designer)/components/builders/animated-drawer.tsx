/**
 * Animated Drawer Component for Kitchen-Craft
 * Implements drawer slide animations using DrawerAnimationController
 */

"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";
import {
  DrawerAnimationController,
  type DrawerAnimationConfig,
  DEFAULT_DRAWER_CONFIG,
} from "../../../../../lib/animations";

interface AnimatedDrawerProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color?: string;
  material?: THREE.Material; // Material from cabinet facade
  config?: Partial<DrawerAnimationConfig>;
  onClick?: () => void;
}

/**
 * AnimatedDrawer component with slide animation
 *
 * The drawer slides forward/backward along the Z-axis when clicked.
 * Uses DrawerAnimationController for smooth easing animations.
 */
export const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  width,
  height,
  depth,
  position,
  color = "#8B4513",
  material,
  config = {},
  onClick,
}) => {
  const drawerGroupRef = useRef<THREE.Group>(null);
  const drawerContainerRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<DrawerAnimationController | null>(null);
  const [hovered, setHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use ref to store current position for useFrame to access latest value
  const positionRef = useRef<number>(0);

  // Calculate slide distance (drawer slides forward by its depth)
  const slideDistance = useMemo(() => depth * 0.8, [depth]);

  // Thickness of drawer panels
  const panelThickness = useMemo(() => 1.5, []);

  // Memoize config to prevent unnecessary re-renders
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_DRAWER_CONFIG, ...config }),
    [config.duration, config.easing, config.playSound]
  );

  // Create and set up animation controller
  useEffect(() => {
    controllerRef.current = new DrawerAnimationController(mergedConfig);

    return () => {
      controllerRef.current = null;
    };
  }, [mergedConfig]);

  // Apply position from animation state
  useFrame(() => {
    if (drawerGroupRef.current) {
      // Use ref to get latest position value immediately
      // Slide forward along Z-axis (positive Z is forward)
      const baseZ = position[2];
      drawerGroupRef.current.position.z = baseZ + positionRef.current;
    }

    // Add subtle hover effect
    if (drawerContainerRef.current) {
      const targetScale = hovered ? 1.02 : 1.0;
      drawerContainerRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    
    if (isAnimating) return;

    setIsAnimating(true);
    const from = isOpen ? slideDistance : 0;
    const to = isOpen ? 0 : slideDistance;

    controllerRef.current
      ?.toggleDrawer({
        from,
        to,
        onUpdate: (currentPosition: number) => {
          positionRef.current = currentPosition;
        },
      })
      .then(() => {
        setIsOpen(!isOpen);
        setIsAnimating(false);
      });

    onClick?.();
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  // Memoize drawer material to prevent unnecessary re-renders
  // Memory: Use textured material if available, otherwise use color-based material
  const drawerMaterial = useMemo(
    () => {
      if (material) {
        return (
          <primitive object={material} attach="material" />
        );
      }
      return (
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 1.0}
        />
      );
    },
    [material, color, hovered]
  );

  return (
    <group position={position} ref={drawerGroupRef}>
      {/* Drawer container - open-top box with 5 sides */}
      <group ref={drawerContainerRef}>
        {/* Bottom panel */}
        <Box
          args={[width, panelThickness, depth]}
          position={[0, -height / 2 + panelThickness / 2, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {drawerMaterial}
        </Box>

        {/* Front panel - full height, top remains open */}
        <Box
          args={[width, height, panelThickness]}
          position={[0, 0, depth / 2 - panelThickness / 2]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {drawerMaterial}
        </Box>

        {/* Back panel - full height, top remains open */}
        <Box
          args={[width, height, panelThickness]}
          position={[0, 0, -depth / 2 + panelThickness / 2]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {drawerMaterial}
        </Box>

        {/* Left side panel - full height, top remains open */}
        <Box
          args={[panelThickness, height, depth]}
          position={[-width / 2 + panelThickness / 2, 0, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {drawerMaterial}
        </Box>

        {/* Right side panel - full height, top remains open */}
        <Box
          args={[panelThickness, height, depth]}
          position={[width / 2 - panelThickness / 2, 0, 0]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          {drawerMaterial}
        </Box>

        {/* Top is intentionally left open to allow viewing contents */}
      </group>

      {/* Drawer handle - positioned on the front */}
      <Box
        args={[width * 0.3, height * 0.05, depth * 0.1]}
        position={[0, 0, depth / 2 + depth * 0.05]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {/* Visual indicator for animation state */}
      {isAnimating && (
        <Box
          args={[width * 0.1, height * 0.1, depth * 0.1]}
          position={[width / 2 + width * 0.1, height / 2 + height * 0.1, 0]}
        >
          <meshStandardMaterial
            color="#00FF00"
            emissive="#004400"
            transparent
            opacity={0.6}
          />
        </Box>
      )}
    </group>
  );
};

/**
 * Hook for controlling drawer animations externally
 */
export const useDrawerAnimation = (config?: Partial<DrawerAnimationConfig>) => {
  const controllerRef = useRef<DrawerAnimationController | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    controllerRef.current = new DrawerAnimationController(config);

    return () => {
      controllerRef.current = null;
    };
  }, [config]);

  const toggle = (slideDistance: number) => {
    if (isAnimating) return Promise.resolve();

    setIsAnimating(true);
    const from = isOpen ? slideDistance : 0;
    const to = isOpen ? 0 : slideDistance;

    return controllerRef.current
      ?.toggleDrawer({
        from,
        to,
        onUpdate: () => {},
      })
      .then(() => {
        setIsOpen(!isOpen);
        setIsAnimating(false);
      }) || Promise.resolve();
  };

  return {
    isOpen,
    isAnimating,
    toggle,
    controller: controllerRef.current,
  };
};

