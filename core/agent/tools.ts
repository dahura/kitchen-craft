import { tool } from "ai";
import { z } from "zod";
import type {
  KitchenConfig,
  RenderableModule,
  ValidationResult,
  GlobalConstraints,
} from "../types";
import { materialLibrary } from "../libraries/material-library/material-library";
import { moduleLibrary } from "../libraries/module-library/module-library";
import { roomTextureLibrary } from "../libraries/room-texture-library";
import { validateAndFix } from "../engines/validator-engine/validator-engine";
import { generate } from "../engines/layout-engine/layout-engine";

/**
 * Tool 1: getMaterialLibrary
 * Retrieves available materials from the material library
 */
export const getMaterialLibrary = tool({
  description:
    "Retrieve available materials from the material library. Returns facades, countertops, and handles.",
  inputSchema: z.object({
    category: z
      .enum(["facades", "countertops", "handles", "all"])
      .describe("Category of materials to retrieve")
      .default("all"),
  }),
  execute: async ({ category }) => {
    if (category === "facades") {
      return {
        facades: Object.keys(materialLibrary.facades).map((key) => ({
          id: key,
          ...materialLibrary.facades[key],
        })),
      };
    }

    if (category === "countertops") {
      return {
        countertops: Object.keys(materialLibrary.countertops).map((key) => ({
          id: key,
          ...materialLibrary.countertops[key],
        })),
      };
    }

    if (category === "handles") {
      return {
        handles: Object.keys(materialLibrary.handles).map((key) => ({
          id: key,
          ...materialLibrary.handles[key],
        })),
      };
    }

    return {
      facades: Object.keys(materialLibrary.facades).map((key) => ({
        id: key,
        ...materialLibrary.facades[key],
      })),
      countertops: Object.keys(materialLibrary.countertops).map((key) => ({
        id: key,
        ...materialLibrary.countertops[key],
      })),
      handles: Object.keys(materialLibrary.handles).map((key) => ({
        id: key,
        ...materialLibrary.handles[key],
      })),
    };
  },
});

/**
 * Tool 2: getModuleLibrary
 * Retrieves available modules/cabinets from the module library
 */
export const getModuleLibrary = tool({
  description:
    "Retrieve available modules (cabinet types) from the module library. Returns dimensions and variants for each module type.",
  inputSchema: z.object({
    moduleType: z
      .enum(["base", "upper", "wall", "sink", "tall", "all"])
      .describe("Type of module to retrieve")
      .default("all"),
  }),
  execute: async ({ moduleType }) => {
    const allTypes = Object.keys(moduleLibrary);

    if (moduleType !== "all") {
      const module = moduleLibrary[moduleType as keyof typeof moduleLibrary];
      if (module) {
        return {
          [moduleType]: {
            variants: module.variants,
          },
        };
      }
      return { error: `Module type "${moduleType}" not found` };
    }

    const result: Record<string, unknown> = {};
    for (const type of allTypes) {
      result[type] = moduleLibrary[type as keyof typeof moduleLibrary];
    }
    return result;
  },
});

/**
 * Tool 3: getRoomTextures
 * Get available room textures for walls, floors, and ceilings
 */
export const getRoomTextures = tool({
  description:
    "Retrieve available room textures for walls, floors, and ceilings. Useful for setting up room backgrounds.",
  inputSchema: z.object({
    surfaceType: z
      .enum(["walls", "floors", "ceilings", "all"])
      .describe("Type of room surface textures to retrieve")
      .default("all"),
  }),
  execute: async ({ surfaceType }) => {
    const textures = roomTextureLibrary;

    if (surfaceType === "walls") {
      return {
        walls: textures.walls || [],
      };
    }

    if (surfaceType === "floors") {
      return {
        floors: textures.floors || [],
      };
    }

    if (surfaceType === "ceilings") {
      return {
        ceilings: textures.ceilings || [],
      };
    }

    return {
      walls: textures.walls || [],
      floors: textures.floors || [],
      ceilings: textures.ceilings || [],
    };
  },
});

/**
 * Tool 4: validateKitchenConfig
 * Validate a KitchenConfig using the validation engine
 */
export const validateKitchenConfig = tool({
  description:
    "Validate a kitchen configuration using the validation engine. Returns warnings, errors, and fixed configuration if applicable.",
  inputSchema: z.object({
    config: z
      .record(z.string(), z.unknown())
      .describe("The KitchenConfig to validate"),
  }),
  execute: async ({ config }) => {
    try {
      // Type cast to KitchenConfig for validation
      const kitchenConfig = config as unknown as KitchenConfig;

      const defaultConstraints: GlobalConstraints = {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      };

      const result: ValidationResult = validateAndFix(
        kitchenConfig,
        kitchenConfig.globalConstraints || defaultConstraints,
        moduleLibrary
      );

      return {
        isValid: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings,
        fixedConfig: result.fixedConfig,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
        warnings: [],
        fixedConfig: null,
      };
    }
  },
});

/**
 * Tool 5: generateLayout
 * Transform valid config into RenderableModule[] using the layout engine
 */
export const generateLayout = tool({
  description:
    "Generate layout (RenderableModule[]) from a validated kitchen configuration. Returns 3D-ready module positions and properties.",
  inputSchema: z.object({
    config: z
      .record(z.string(), z.unknown())
      .describe("The validated KitchenConfig"),
  }),
  execute: async ({ config }) => {
    try {
      // Type cast to KitchenConfig
      const kitchenConfig = config as unknown as KitchenConfig;

      const defaultConstraints: GlobalConstraints = {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      };

      // Validate first
      const validationResult: ValidationResult = validateAndFix(
        kitchenConfig,
        kitchenConfig.globalConstraints || defaultConstraints,
        moduleLibrary
      );

      if (validationResult.errors.length > 0) {
        return {
          success: false,
          errors: validationResult.errors,
          modules: [],
        };
      }

      // Generate layout using the layout engine
      const modules: RenderableModule[] = generate(
        validationResult.fixedConfig,
        materialLibrary
      );

      return {
        success: true,
        errors: [],
        modules: modules.map((module) => ({
          id: module.id,
          type: module.type,
          variant: module.variant,
          position: module.position,
          dimensions: module.dimensions,
          materials: module.materials,
          structure: module.structure,
          carcass: module.carcass,
          children: module.children,
        })),
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Layout generation error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
        modules: [],
      };
    }
  },
});

/**
 * Export all tools as a record for use with AI SDK
 */
export const agentTools = {
  getMaterialLibrary,
  getModuleLibrary,
  getRoomTextures,
  validateKitchenConfig,
  generateLayout,
};
