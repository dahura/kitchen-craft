/**
 * Animated Door Component for Kitchen-Craft
 * Implements door animations using cube-based pivot mechanism
 */

"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import {
  DoorAnimationController,
  type DoorAnimationState,
  type DoorAnimationConfig,
  DEFAULT_DOOR_CONFIG,
} from '../../../../../lib/animations';

interface AnimatedDoorProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color?: string;
  config?: Partial<DoorAnimationConfig>;
  onAnimationStateChange?: (state: DoorAnimationState) => void;
  onClick?: () => void;
}

/**
 * AnimatedDoor component with cube-based pivot mechanism
 * 
 * The door rotates around a pivot point (cube) positioned at the hinge.
 * The cube acts as the rotation axis and provides visual feedback.
 */
export const AnimatedDoor: React.FC<AnimatedDoorProps> = ({
  width,
  height,
  depth,
  position,
  color = '#8B7355',
  config = {},
  onAnimationStateChange,
  onClick,
}) => {
  const pivotGroupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Mesh>(null);
  const pivotCubeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create animation controller
  const controller = useMemo(() => {
    const mergedConfig = { ...DEFAULT_DOOR_CONFIG, ...config };
    return new DoorAnimationController(mergedConfig, onAnimationStateChange);
  }, [config, onAnimationStateChange]);

  // State for tracking animation
  const [animationState, setAnimationState] = useState<DoorAnimationState>(
    controller.getState()
  );

  // Update animation state when controller changes
  useEffect(() => {
    const handleStateChange = (state: DoorAnimationState) => {
      setAnimationState(state);
    };

    // Set up the controller callback
    const newController = new DoorAnimationController(
      { ...DEFAULT_DOOR_CONFIG, ...config },
      handleStateChange
    );

    return () => {
      newController.dispose();
    };
  }, [config]);

  // Apply rotation from animation state
  useFrame(() => {
    if (pivotGroupRef.current) {
      pivotGroupRef.current.rotation.y = animationState.rotation;
    }

    // Add subtle hover effect to pivot cube
    if (pivotCubeRef.current) {
      const targetScale = hovered ? 1.2 : 1.0;
      pivotCubeRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    controller.toggle();
    onClick?.();
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Calculate pivot position (at the hinge, left side of door)
  const pivotPosition: [number, number, number] = [
    position[0] - width / 2,
    position[1],
    position[2],
  ];

  // Calculate door position relative to pivot
  const doorRelativePosition: [number, number, number] = [
    width / 2, // Offset from pivot to center door
    0,
    0,
  ];

  // Calculate pivot cube size (small cube at hinge)
  const pivotCubeSize = Math.min(width, height, depth) * 0.05;

  return (
    <group position={pivotPosition}>
      {/* Pivot cube - acts as the hinge mechanism */}
      <Box
        ref={pivotCubeRef}
        args={[pivotCubeSize, pivotCubeSize, pivotCubeSize]}
        position={[0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={animationState.isAnimating ? '#FFD700' : '#666666'}
          emissive={hovered ? '#333333' : '#000000'}
          transparent
          opacity={0.8}
        />
      </Box>

      {/* Rotating group that contains the door */}
      <group ref={pivotGroupRef}>
        {/* Door mesh */}
        <Box
          ref={doorRef}
          args={[width, height, depth]}
          position={doorRelativePosition}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <meshStandardMaterial
            color={color}
            transparent
            opacity={hovered ? 0.9 : 1.0}
          />
        </Box>

        {/* Door handle - positioned on the right side of the door */}
        <Box
          args={[width * 0.02, height * 0.1, depth * 0.5]}
          position={[width * 0.9, 0, depth * 0.6]}
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
      </group>

      {/* Visual indicator for animation state */}
      {animationState.isAnimating && (
        <Box
          args={[width * 0.1, height * 0.1, depth * 0.1]}
          position={[0, height / 2 + width * 0.1, 0]}
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
 * Hook for controlling door animations externally
 */
export const useDoorAnimation = (config?: Partial<DoorAnimationConfig>) => {
  const controllerRef = useRef<DoorAnimationController | null>(null);
  const [state, setState] = useState<DoorAnimationState>({
    isOpen: false,
    isAnimating: false,
    rotation: 0,
    targetRotation: 0,
  });

  useEffect(() => {
    controllerRef.current = new DoorAnimationController(config, setState);
    
    return () => {
      controllerRef.current?.dispose();
    };
  }, [config]);

  const toggle = () => controllerRef.current?.toggle();
  const open = () => controllerRef.current?.open();
  const close = () => controllerRef.current?.close();

  return {
    state,
    toggle,
    open,
    close,
    controller: controllerRef.current,
  };
};

/**
 * Multiple doors component for cabinets with two doors
 */
interface DoubleDoorProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color?: string;
  config?: Partial<DoorAnimationConfig>;
  gap?: number; // Gap between doors
}

export const DoubleDoor: React.FC<DoubleDoorProps> = ({
  width,
  height,
  depth,
  position,
  color = '#8B7355',
  config = {},
  gap = 2,
}) => {
  const doorWidth = (width - gap) / 2;

  return (
    <group>
      {/* Left door */}
      <AnimatedDoor
        width={doorWidth}
        height={height}
        depth={depth}
        position={[position[0] - doorWidth / 2 - gap / 2, position[1], position[2]]}
        color={color}
        config={config}
      />
      
      {/* Right door - opens in opposite direction */}
      <AnimatedDoor
        width={doorWidth}
        height={height}
        depth={depth}
        position={[position[0] + doorWidth / 2 + gap / 2, position[1], position[2]]}
        color={color}
        config={{
          ...config,
          openAngle: -(config.openAngle || DEFAULT_DOOR_CONFIG.openAngle), // Negative for opposite direction
        }}
      />
    </group>
  );
};