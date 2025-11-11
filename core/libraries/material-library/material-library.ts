// material-library.ts
import type { MaterialLibrary } from "../../types";

export const materialLibrary: MaterialLibrary = {
  facades: {
    loft_dark_glossy: {
      type: "paint",
      color: "#2C3E50",
      finish: "glossy",
      roughness: 0.2,
      metalness: 0.1,
    },
    // Cabinet Blue - Base variant
    cabinet_blue: {
      type: "texture",
      diffuseMap: "/textures/cabinet/blue.png",
      roughness: 0.4,
      metalness: 0.0,
      shaderId: "wood-cabinet",
      shaderProperties: {
        normalMapIntensity: 1.0,
        receiveShadow: true,
      },
    },
    // Cabinet Blue - Lighter variant
    "cabinet_blue.light": {
      type: "texture",
      diffuseMap: "/textures/cabinet/blue.png",
      colorTint: "#D4E8F7",
      brightness: 0.7,
      roughness: 0.4,
      metalness: 0.0,
    },
    // Cabinet Blue - Darker variant
    "cabinet_blue.dark": {
      type: "texture",
      diffuseMap: "/textures/cabinet/blue.png",
      colorTint: "#1A3A4A",
      brightness: 0.3,
      roughness: 0.4,
      metalness: 0.0,
    },
    // Cabinet Blue - Matte variant
    "cabinet_blue.matte": {
      type: "texture",
      diffuseMap: "/textures/cabinet/blue.png",
      roughness: 0.7,
      metalness: 0.0,
      roughnessOverride: 0.8,
    },
    // Cabinet Blue - Glossy variant
    "cabinet_blue.glossy": {
      type: "texture",
      diffuseMap: "/textures/cabinet/blue.png",
      roughness: 0.2,
      metalness: 0.1,
      roughnessOverride: 0.2,
    },
  },
  countertops: {
    concrete_grey: {
      type: "concrete",
      diffuseMap: "textures/concrete_grey_diffuse.jpg",
      normalMap: "textures/concrete_grey_normal.jpg",
    },
    quartz_grey: {
      type: "quartz",
      color: "#E8E8E8",
      roughness: 0.3,
      metalness: 0.1,
      shaderId: "quartz-countertop",
      shaderProperties: {
        normalMapIntensity: 0.8,
        receiveShadow: true,
      },
    },
  },
  handles: {
    minimalist_bar_black: {
      source: {
        type: "static_model",
        url: "models/handles/bar_handle_minimalist.fbx",
      },
      material: {
        color: "#1C1C1C",
        metalness: 0.95,
        roughness: 0.3,
        type: "pbr",
      },
    },
  },
};
