// example-kitchen-config.ts
import type { KitchenConfig, FacadeMaterialId } from "../types";

/**
 * Creates a complete kitchen configuration with a specified facade material variant
 * All modules will use the same facade variant passed as parameter
 * Perfect for AI-generated designs where facade is the main variation
 *
 * Memory: This function is used to generate different kitchen variations for testing.
 * AI will call this to create configs like: "user wants bright blue kitchen" → createKitchenConfig("cabinet_blue.light")
 */
export function createKitchenConfig(
  facadeVariant: FacadeMaterialId = "cabinet_blue.matte"
): KitchenConfig {
  return {
    kitchenId: "complete_kitchen_mvp",
    name: "Complete Kitchen MVP Demo",
    style: "modern",
    globalSettings: {
      dimensions: {
        sideA: 360,
        sideB: 240,
        height: 220,
        countertopHeight: 90,
        countertopDepth: 60,
        countertopThickness: 2,
        wallGap: 50,
        baseCabinetHeight: 90,
        wallCabinetHeight: 70,
        wallCabinetDepth: 35,
        plinthHeight: 12,
        plinthDepth: 50,
      },
      rules: { mismatchPolicy: "auto_fix", gapBetweenModules: 0 },
    },
    globalConstraints: {
      modules: { minWidth: 30, maxWidth: 120 },
      handles: { minDistanceFromEdge: 5 },
    },
    defaultMaterials: {
      facade: facadeVariant,
      countertop: "quartz_grey",
      handle: "minimalist_bar_black",
    },
    layoutLines: [
      {
        id: "main_wall",
        name: "Main Wall",
        length: 360,
        direction: { x: 1, z: 0 },
        modules: [
          // Tall cabinet first - connects base to upper cabinets
          {
            id: "tall-1",
            type: "tall",
            variant: "pantry",
            width: 60,
            positioning: { anchor: "floor-and-ceiling", offset: { y: 0 } },
            handle: {
              placement: { type: "centered", orientation: "vertical" },
            },
            structure: {
              type: "door-and-shelf",
              doorCount: 2,
              shelves: [
                { positionFromBottom: 40 },
                { positionFromBottom: 80 },
                { positionFromBottom: 120 },
                { positionFromBottom: 160 },
              ],
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
          // 5 Lower Cabinets
          {
            id: "base-1",
            type: "base",
            variant: "doors",
            width: 60,
            positioning: { anchor: "floor", offset: { y: 0 } },
            handle: {
              placement: { type: "centered", orientation: "vertical" },
            },
            structure: {
              type: "door-and-shelf",
              doorCount: 1,
              shelves: [
                { positionFromBottom: 25 },
                { positionFromBottom: 50 },
                { positionFromBottom: 75 },
              ],
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
          {
            id: "base-2",
            type: "base",
            variant: "drawers",
            width: 80,
            positioning: { anchor: "floor", offset: { y: 0 } },
            handle: {
              placement: { type: "per-drawer", orientation: "horizontal" },
            },
            structure: {
              type: "drawers",
              count: 3,
              drawerHeights: [25, 25, 35],
              internalDepth: 50,
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
          {
            id: "base-3",
            type: "sink",
            variant: "single",
            width: 80,
            positioning: { anchor: "floor", offset: { y: 0 } },
            handle: {
              placement: { type: "centered", orientation: "vertical" },
            },
            structure: {
              type: "door-and-shelf",
              doorCount: 2,
              shelves: [
                { positionFromBottom: 20 },
                { positionFromBottom: 45 },
                { positionFromBottom: 70 },
              ],
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
          {
            id: "base-4",
            type: "base",
            variant: "doors",
            width: 60,
            positioning: { anchor: "floor", offset: { y: 0 } },
            handle: {
              placement: { type: "centered", orientation: "vertical" },
            },
            structure: {
              type: "door-and-shelf",
              doorCount: 1,
              shelves: [
                { positionFromBottom: 25 },
                { positionFromBottom: 50 },
                { positionFromBottom: 75 },
              ],
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
          {
            id: "base-5",
            type: "base",
            variant: "drawers",
            width: 60,
            positioning: { anchor: "floor", offset: { y: 0 } },
            handle: {
              placement: { type: "per-drawer", orientation: "horizontal" },
            },
            structure: {
              type: "drawers",
              count: 4,
              drawerHeights: [20, 20, 25, 20],
              internalDepth: 50,
            },
            carcass: {
              thickness: 1.8,
              backPanelThickness: 0.5,
            },
          },
        ],
      },
    ],
    hangingModules: [
      // 5 Upper Cabinets (including one for tall-1)
      {
        id: "upper-tall-1",
        type: "upper",
        variant: "single_door",
        width: 60,
        positioning: {
          anchor: "countertop",
          offset: { y: 50 },
          alignWithModule: "tall-1",
        },
        structure: {
          type: "door-and-shelf",
          doorCount: 1,
          shelves: [
            { positionFromBottom: 15 },
            { positionFromBottom: 35 },
            { positionFromBottom: 55 },
          ],
        },
        carcass: {
          thickness: 1.8,
          backPanelThickness: 0.5,
        },
      },
      {
        id: "upper-1",
        type: "upper",
        variant: "single_door",
        width: 60,
        positioning: {
          anchor: "countertop",
          offset: { y: 50 },
          alignWithModule: "base-1",
        },
        structure: {
          type: "door-and-shelf",
          doorCount: 1,
          shelves: [
            { positionFromBottom: 15 },
            { positionFromBottom: 35 },
            { positionFromBottom: 55 },
          ],
        },
        carcass: {
          thickness: 1.8,
          backPanelThickness: 0.5,
        },
      },
      {
        id: "upper-2",
        type: "upper",
        variant: "double_door",
        width: 80,
        positioning: {
          anchor: "countertop",
          offset: { y: 50 },
          alignWithModule: "base-2",
        },
        structure: {
          type: "door-and-shelf",
          doorCount: 2,
          shelves: [
            { positionFromBottom: 15 },
            { positionFromBottom: 35 },
            { positionFromBottom: 55 },
          ],
        },
        carcass: {
          thickness: 1.8,
          backPanelThickness: 0.5,
        },
      },
      {
        id: "upper-3",
        type: "upper",
        variant: "double_door",
        width: 80,
        positioning: {
          anchor: "countertop",
          offset: { y: 50 },
          alignWithModule: "base-3",
        },
        structure: {
          type: "door-and-shelf",
          doorCount: 2,
          shelves: [
            { positionFromBottom: 15 },
            { positionFromBottom: 35 },
            { positionFromBottom: 55 },
          ],
        },
        carcass: {
          thickness: 1.8,
          backPanelThickness: 0.5,
        },
      },
      {
        id: "upper-4",
        type: "upper",
        variant: "single_door",
        width: 60,
        positioning: {
          anchor: "countertop",
          offset: { y: 50 },
          alignWithModule: "base-4",
        },
        structure: {
          type: "door-and-shelf",
          doorCount: 1,
          shelves: [
            { positionFromBottom: 15 },
            { positionFromBottom: 35 },
            { positionFromBottom: 55 },
          ],
        },
        carcass: {
          thickness: 1.8,
          backPanelThickness: 0.5,
        },
      },
    ],
  };
}

// Memory: Pre-generated kitchen configs for testing different material variants
// These are used for local testing - AI sends JSON directly, doesn't use these

/** Base/default variant - neutral tone */
export const exampleKitchenConfig = createKitchenConfig("cabinet_blue");

/** Light/bright variant - modern, fresh appearance */
export const exampleKitchenConfigLight =
  createKitchenConfig("cabinet_blue.light");

/** Dark variant - elegant, formal appearance */
export const exampleKitchenConfigDark =
  createKitchenConfig("cabinet_blue.dark");

/** Matte variant - sophisticated, less reflective */
export const exampleKitchenConfigMatte =
  createKitchenConfig("cabinet_blue.matte");

/** Glossy variant - premium, more reflective */
export const exampleKitchenConfigGlossy = createKitchenConfig(
  "cabinet_blue.glossy"
);
