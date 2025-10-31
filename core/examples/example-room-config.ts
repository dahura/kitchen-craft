// example-room-config.ts
import type { RoomMaterials } from "../types";

export const exampleRoomMaterials: RoomMaterials = {
  walls: {
    type: "texture",
    value: "white-plaster",
    roughness: 0.9,
    metalness: 0.0,
    scale: 1.0,
  },
  floor: {
    type: "texture",
    value: "white-plaster",
    roughness: 0.8,
    metalness: 0.1,
    scale: 2.0,
  },
  ceiling: {
    type: "color",
    value: "#FFFFFF",
    roughness: 0.8,
    metalness: 0.0,
  },
};

// Примеры конфигураций для разных стилей
export const roomMaterialExamples = {
  modern: {
    walls: {
      type: "color" as const,
      value: "#F5F5F5",
      roughness: 0.9,
      metalness: 0.0,
    },
    floor: {
      type: "color" as const,
      value: "#D4A574",
      roughness: 0.8,
      metalness: 0.1,
    },
    ceiling: {
      type: "color" as const,
      value: "#FFFFFF",
      roughness: 0.8,
      metalness: 0.0,
    },
  },
  industrial: {
    walls: {
      type: "texture" as const,
      value: "white-plaster",
      roughness: 0.9,
      metalness: 0.0,
      scale: 1.0,
    },
    floor: {
      type: "texture" as const,
      value: "white-plaster",
      roughness: 0.8,
      metalness: 0.1,
      scale: 2.0,
    },
    ceiling: {
      type: "color" as const,
      value: "#E0E0E0",
      roughness: 0.7,
      metalness: 0.0,
    },
  },
  minimalist: {
    walls: {
      type: "color" as const,
      value: "#FFFFFF",
      roughness: 0.95,
      metalness: 0.0,
    },
    floor: {
      type: "color" as const,
      value: "#F0F0F0",
      roughness: 0.9,
      metalness: 0.0,
    },
    ceiling: {
      type: "color" as const,
      value: "#FFFFFF",
      roughness: 0.95,
      metalness: 0.0,
    },
  },
  cozy: {
    walls: {
      type: "color" as const,
      value: "#FAF0E6",
      roughness: 0.85,
      metalness: 0.0,
    },
    floor: {
      type: "color" as const,
      value: "#8B4513",
      roughness: 0.7,
      metalness: 0.0,
    },
    ceiling: {
      type: "color" as const,
      value: "#FFF8DC",
      roughness: 0.8,
      metalness: 0.0,
    },
  },
} as const;