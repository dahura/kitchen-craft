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
