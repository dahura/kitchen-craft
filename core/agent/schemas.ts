import { z } from "zod";

/**
 * Zod schemas for AI agent tools
 * These schemas validate and transform data from AI before processing
 */

// Position schema
export const PositionSchema = z.object({
  x: z.number().describe("X coordinate"),
  y: z.number().describe("Y coordinate"),
  z: z.number().describe("Z coordinate"),
});

// Dimensions schema
export const DimensionsSchema = z.object({
  width: z.number().positive().describe("Width in cm"),
  height: z.number().positive().describe("Height in cm"),
  depth: z.number().positive().describe("Depth in cm"),
});

// Rotation schema
export const RotationSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  z: z.number().default(0),
});

// GlobalSettings schema
export const GlobalSettingsSchema = z.object({
  dimensions: z.object({
    sideA: z.number().optional(),
    sideB: z.number().optional(),
    height: z.number().positive(),
    countertopHeight: z.number().positive(),
    countertopDepth: z.number().positive(),
    countertopThickness: z.number().positive(),
    wallGap: z.number().nonnegative(),
    baseCabinetHeight: z.number().positive(),
    wallCabinetHeight: z.number().positive(),
    wallCabinetDepth: z.number().positive(),
    plinthHeight: z.number().nonnegative(),
    plinthDepth: z.number().positive(),
  }),
  rules: z.object({
    mismatchPolicy: z.enum(["warn", "error", "auto_fix"]).default("auto_fix"),
    gapBetweenModules: z.number().nonnegative().default(0),
  }),
});

// GlobalConstraints schema
export const GlobalConstraintsSchema = z.object({
  modules: z.object({
    minWidth: z.number().positive(),
    maxWidth: z.number().positive(),
  }),
  handles: z.object({
    minDistanceFromEdge: z.number().nonnegative(),
  }),
});

// DefaultMaterials schema
export const DefaultMaterialsSchema = z.object({
  facade: z.string().describe("Facade material ID"),
  countertop: z.string().describe("Countertop material ID"),
  handle: z.string().describe("Handle material ID"),
});

// Positioning schema for modules
export const PositioningSchema = z.object({
  anchor: z.enum(["floor", "countertop", "floor-and-ceiling"]),
  offset: z.object({
    y: z.number(),
  }),
});

// HandlePlacement schema
export const HandlePlacementSchema = z.object({
  type: z.enum(["centered", "per-drawer"]).default("centered"),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  offsetFromTop: z.number().optional(),
});

// ModuleConfig schema (for layoutLines.modules)
export const ModuleConfigSchema = z.object({
  id: z.string().describe("Unique module ID"),
  type: z.string().describe("Module type: base, upper, wall, etc."),
  width: z.union([z.number().positive(), z.literal("auto")]).describe("Width in cm or 'auto'"),
  positioning: PositioningSchema,
  materialOverrides: z
    .object({
      facade: z.string().optional(),
      countertop: z.string().optional(),
      handle: z.string().optional(),
    })
    .optional(),
  handle: z
    .object({
      placement: HandlePlacementSchema,
    })
    .optional(),
  constraints: z
    .object({
      fillsRemainingSpace: z.boolean(),
    })
    .optional(),
  structure: z.record(z.string(), z.unknown()).optional(),
  carcass: z.record(z.string(), z.unknown()).optional(),
  variant: z.string().optional(),
  finalWidth: z.number().optional(),
});

// LayoutLine schema
export const LayoutLineSchema = z.object({
  id: z.string().describe("Unique layout line ID"),
  name: z.string().optional().describe("Human-readable name"),
  length: z.number().positive().describe("Length of the layout line in cm"),
  direction: z.object({
    x: z.number(),
    z: z.number(),
  }),
  modules: z.array(ModuleConfigSchema).describe("Modules in this layout line"),
});

// HangingModuleConfig schema
export const HangingModuleConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string(),
  width: z.union([z.number().positive(), z.literal("auto")]),
  positioning: z.object({
    anchor: z.literal("countertop"),
    offset: z.object({ y: z.number() }),
    alignWithModule: z.string(),
  }),
  materialOverrides: z
    .object({
      facade: z.string().optional(),
      countertop: z.string().optional(),
      handle: z.string().optional(),
    })
    .optional(),
  structure: z.record(z.string(), z.unknown()).optional(),
  carcass: z.record(z.string(), z.unknown()).optional(),
});

// Complete KitchenConfig schema
export const KitchenConfigSchema = z.object({
  kitchenId: z.string().describe("Unique kitchen ID"),
  name: z.string().describe("Kitchen name"),
  style: z.string().describe("Kitchen style"),
  globalSettings: GlobalSettingsSchema,
  globalConstraints: GlobalConstraintsSchema,
  defaultMaterials: DefaultMaterialsSchema,
  layoutLines: z
    .array(LayoutLineSchema)
    .min(1)
    .describe("Layout lines with modules"),
  hangingModules: z
    .array(HangingModuleConfigSchema)
    .optional()
    .default([])
    .describe("Optional hanging/wall modules"),
});

// RenderableModule schema (output from layout engine)
export const RenderableModuleSchema: z.ZodType<any> = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string(),
  position: PositionSchema,
  rotation: RotationSchema.optional(),
  dimensions: DimensionsSchema,
  structure: z.record(z.string(), z.unknown()),
  carcass: z.record(z.string(), z.unknown()),
  materials: z.object({
    facade: z.record(z.string(), z.unknown()).optional(),
    countertop: z.record(z.string(), z.unknown()).optional(),
    handle: z.record(z.string(), z.unknown()).optional(),
  }),
  children: z.array(z.lazy(() => RenderableModuleSchema)).optional(),
});

// Export types inferred from schemas
export type KitchenConfigInput = z.infer<typeof KitchenConfigSchema>;
export type RenderableModuleInput = z.infer<typeof RenderableModuleSchema>;
export type LayoutLineInput = z.infer<typeof LayoutLineSchema>;
export type ModuleConfigInput = z.infer<typeof ModuleConfigSchema>;

