/**
 * Animated Door Component for Kitchen-Craft
 * Implements door animations using cube-based pivot mechanism
 */

"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";
import {
  DoorAnimationController,
  DoubleDoorAnimationController,
  type DoorAnimationState,
  type DoorAnimationConfig,
  type DoubleDoorAnimationState,
  DEFAULT_DOOR_CONFIG,
} from "../../../../../lib/animations";

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
  color = "#8B7355",
  config = {},
  onAnimationStateChange,
  onClick,
}) => {
  const pivotGroupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Mesh>(null);
  const pivotCubeRef = useRef<THREE.Mesh>(null);
  const controllerRef = useRef<DoorAnimationController | null>(null);
  const [hovered, setHovered] = useState(false);

  // State for tracking animation
  const [animationState, setAnimationState] = useState<DoorAnimationState>({
    isOpen: false,
    isAnimating: false,
    rotation: 0,
    targetRotation: 0,
  });

  // Use ref to store current rotation for useFrame to access latest value
  const rotationRef = useRef<number>(0);

  // Memoize config to prevent unnecessary re-renders
  // Compare config properties instead of the object itself
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_DOOR_CONFIG, ...config }),
    [config.openAngle, config.duration, config.easing, config.playSound]
  );

  // Create and set up animation controller
  useEffect(() => {
    const handleStateChange = (state: DoorAnimationState) => {
      // Update ref immediately for useFrame to access latest value
      rotationRef.current = state.rotation;
      setAnimationState(state);
    };

    // Create controller once with proper callback
    controllerRef.current = new DoorAnimationController(
      mergedConfig,
      handleStateChange
    );

    // Don't call setState here - it's already initialized above
    // The controller will notify via callback when state changes

    return () => {
      controllerRef.current?.dispose();
    };
  }, [mergedConfig]);

  // Apply rotation from animation state
  useFrame(() => {
    if (pivotGroupRef.current) {
      // Use ref to get latest rotation value immediately
      // Invert rotation to open outward (like left door in double door system)
      pivotGroupRef.current.rotation.y = -rotationRef.current;
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
    // Toggle door animation on click
    controllerRef.current?.toggle();
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
          color={animationState.isAnimating ? "#FFD700" : "#666666"}
          emissive={hovered ? "#333333" : "#000000"}
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
 * Uses DoubleDoorAnimationController for synchronized left/right door control
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
  color = "#8B7355",
  config = {},
  gap = 0,
}) => {
  const doorWidth = (width - gap) / 2;

  // Create double door controller
  const controllerRef = useRef<DoubleDoorAnimationController | null>(null);
  const leftPivotRef = useRef<THREE.Group>(null);
  const rightPivotRef = useRef<THREE.Group>(null);

  // Initialize with default state
  const [doubleDoorState, setDoubleDoorState] =
    useState<DoubleDoorAnimationState>({
      leftDoor: {
        isOpen: false,
        isAnimating: false,
        rotation: 0,
      },
      rightDoor: {
        isOpen: false,
        isAnimating: false,
        rotation: 0,
      },
    });

  // Use refs to store current rotations for useFrame to access latest values
  const leftRotationRef = useRef<number>(0);
  const rightRotationRef = useRef<number>(0);

  // Memoize config to prevent unnecessary re-renders
  // Compare config properties instead of the object itself
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_DOOR_CONFIG, ...config }),
    [config.openAngle, config.duration, config.easing, config.playSound]
  );

  useEffect(() => {
    const handleStateChange = (state: DoubleDoorAnimationState) => {
      // Update refs immediately for useFrame to access latest values
      leftRotationRef.current = state.leftDoor.rotation;
      rightRotationRef.current = state.rightDoor.rotation;
      setDoubleDoorState(state);
    };

    controllerRef.current = new DoubleDoorAnimationController(
      mergedConfig,
      handleStateChange
    );

    // Don't call setState here - it's already initialized above
    // The controller will notify via callback when state changes

    return () => {
      controllerRef.current?.dispose();
    };
  }, [mergedConfig]);

  // Update rotations from animation state
  useFrame(() => {
    if (leftPivotRef.current) {
      // Use ref to get latest rotation value immediately
      leftPivotRef.current.rotation.y = leftRotationRef.current;
    }
    if (rightPivotRef.current) {
      // Use ref to get latest rotation value immediately
      rightPivotRef.current.rotation.y = rightRotationRef.current;
    }
  });

  const handleLeftDoorClick = (event: any) => {
    event.stopPropagation();
    controllerRef.current?.toggleLeft();
  };

  const handleRightDoorClick = (event: any) => {
    event.stopPropagation();
    controllerRef.current?.toggleRight();
  };

  // Calculate pivot positions (at hinges)
  const leftDoorCenter = [
    position[0] - doorWidth / 2 - gap / 2,
    position[1],
    position[2],
  ] as [number, number, number];

  const rightDoorCenter = [
    position[0] + doorWidth / 2 + gap / 2,
    position[1],
    position[2],
  ] as [number, number, number];

  // Left door pivot is at left edge, right door pivot is at right edge
  const leftPivotPosition: [number, number, number] = [
    leftDoorCenter[0] - doorWidth / 2,
    leftDoorCenter[1],
    leftDoorCenter[2],
  ];

  const rightPivotPosition: [number, number, number] = [
    rightDoorCenter[0] + doorWidth / 2,
    rightDoorCenter[1],
    rightDoorCenter[2],
  ];

  return (
    <group>
      {/* Left door */}
      <group position={leftPivotPosition}>
        <group ref={leftPivotRef}>
          <Box
            args={[doorWidth, height, depth]}
            position={[doorWidth / 2, 0, 0]}
            onClick={handleLeftDoorClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
          >
            <meshStandardMaterial color={color} />
          </Box>
          {/* Door handle */}
          <Box
            args={[doorWidth * 0.02, height * 0.1, depth * 0.5]}
            position={[doorWidth * 0.9, 0, depth * 0.6]}
            onClick={handleLeftDoorClick}
          >
            <meshStandardMaterial
              color="#C0C0C0"
              metalness={0.8}
              roughness={0.2}
            />
          </Box>
        </group>
      </group>

      {/* Right door */}
      <group position={rightPivotPosition}>
        <group ref={rightPivotRef}>
          <Box
            args={[doorWidth, height, depth]}
            position={[-doorWidth / 2, 0, 0]}
            onClick={handleRightDoorClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
          >
            <meshStandardMaterial color={color} />
          </Box>
          {/* Door handle */}
          <Box
            args={[doorWidth * 0.02, height * 0.1, depth * 0.5]}
            position={[-doorWidth * 0.9, 0, depth * 0.6]}
            onClick={handleRightDoorClick}
          >
            <meshStandardMaterial
              color="#C0C0C0"
              metalness={0.8}
              roughness={0.2}
            />
          </Box>
        </group>
      </group>
    </group>
  );
};
