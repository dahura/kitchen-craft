// example-kitchen-config.ts
import type { KitchenConfig } from "../types";

export const exampleKitchenConfig: KitchenConfig = {
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
    rules: { mismatchPolicy: "auto_fix", gapBetweenModules: 2 },
  },
  globalConstraints: {
    modules: { minWidth: 30, maxWidth: 120 },
    handles: { minDistanceFromEdge: 5 },
  },
  defaultMaterials: {
    facade: "modern_white_matte",
    countertop: "quartz_grey",
    handle: "stainless_steel_bar",
  },
  layoutLines: [
    {
      id: "main_wall",
      name: "Main Wall",
      length: 360,
      direction: { x: 1, z: 0 },
      modules: [
        // 5 Lower Cabinets
        {
          id: "base-1",
          type: "base",
          variant: "doors",
          width: 60,
          positioning: { anchor: "floor", offset: { y: 0 } },
          handle: { placement: { type: "centered", orientation: "vertical" } },
          structure: {
            type: "door-and-shelf",
            doorCount: 1,
            shelves: [{ positionFromBottom: 30 }],
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
          handle: { placement: { type: "centered", orientation: "vertical" } },
          structure: {
            type: "door-and-shelf",
            doorCount: 2,
            shelves: [{ positionFromBottom: 20 }],
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
          handle: { placement: { type: "centered", orientation: "vertical" } },
          structure: {
            type: "door-and-shelf",
            doorCount: 1,
            shelves: [{ positionFromBottom: 30 }, { positionFromBottom: 60 }],
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
    {
      id: "side_wall",
      name: "Side Wall",
      length: 240,
      direction: { x: 0, z: -1 },
      modules: [
        // 1 Tall Cabinet
        // {
        //   id: "tall-1",
        //   type: "tall",
        //   variant: "pantry",
        //   width: 60,
        //   positioning: { anchor: "floor-and-ceiling", offset: { y: 0 } },
        //   handle: { placement: { type: "centered", orientation: "vertical" } },
        //   structure: {
        //     type: "door-and-shelf",
        //     doorCount: 2,
        //     shelves: [
        //       { positionFromBottom: 40 },
        //       { positionFromBottom: 80 },
        //       { positionFromBottom: 120 },
        //       { positionFromBottom: 160 },
        //       { positionFromBottom: 200 }
        //     ],
        //   },
        //   carcass: {
        //     thickness: 1.8,
        //     backPanelThickness: 0.5,
        //   },
        // },
      ],
    },
  ],
  hangingModules: [
    // 4 Upper Cabinets
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
      materialOverrides: {
        facade: "modern_white_matte",
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
      materialOverrides: {
        facade: "modern_white_matte",
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
      materialOverrides: {
        facade: "modern_white_matte",
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
      materialOverrides: {
        facade: "modern_white_matte",
      },
    },
  ],
};
