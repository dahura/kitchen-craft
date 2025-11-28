import type { KitchenConfig } from "@/core/types";

/**
 * Pre-defined kitchen configurations for MVP
 * Based on example-kitchen-config.ts structure
 * All kitchens have proper structure, carcass, and dimensions
 */

export const predefinedKitchens: Record<
  string,
  { id: string; name: string; description: string; config: KitchenConfig }
> = {
  modern_white: {
    id: "modern_white",
    name: "Modern White Kitchen",
    description: "Clean, minimalist white kitchen with modern handles",
    config: {
      kitchenId: "kitchen-modern-white",
      name: "Modern White Kitchen",
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
        facade: "cabinet_blue.light",
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
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              id: "base-3",
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
          ],
        },
      ],
      hangingModules: [
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
          width: 90,
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
          variant: "single_door",
          width: 60,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-3",
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
    },
  },

  modern_blue: {
    id: "modern_blue",
    name: "Modern Blue Kitchen",
    description: "Contemporary blue kitchen with chrome handles",
    config: {
      kitchenId: "kitchen-modern-blue",
      name: "Modern Blue Kitchen",
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
        facade: "cabinet_blue.dark",
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
            {
              id: "base-1",
              type: "base",
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "double_door",
          width: 90,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-1",
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
          id: "upper-2",
          type: "upper",
          variant: "double_door",
          width: 120,
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
      ],
    },
  },

  minimalist_grey: {
    id: "minimalist_grey",
    name: "Minimalist Grey Kitchen",
    description: "Clean grey kitchen with minimal design",
    config: {
      kitchenId: "kitchen-minimalist-grey",
      name: "Minimalist Grey Kitchen",
      style: "minimalist",
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
        facade: "loft_dark_glossy",
        countertop: "concrete_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "single_door",
          width: 60,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-2",
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
    },
  },

  compact_small: {
    id: "compact_small",
    name: "Compact Small Kitchen",
    description: "Perfect for small apartments and kitchenettes",
    config: {
      kitchenId: "kitchen-compact-small",
      name: "Compact Small Kitchen",
      style: "modern",
      globalSettings: {
        dimensions: {
          sideA: 240,
          sideB: 180,
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
        facade: "cabinet_blue.light",
        countertop: "quartz_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 240,
          direction: { x: 1, z: 0 },
          modules: [
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
          ],
        },
      ],
      hangingModules: [
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
      ],
    },
  },

  spacious_large: {
    id: "spacious_large",
    name: "Spacious Large Kitchen",
    description: "Large kitchen for families with plenty of storage",
    config: {
      kitchenId: "kitchen-spacious-large",
      name: "Spacious Large Kitchen",
      style: "modern",
      globalSettings: {
        dimensions: {
          sideA: 480,
          sideB: 300,
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
        facade: "cabinet_blue.dark",
        countertop: "concrete_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 480,
          direction: { x: 1, z: 0 },
          modules: [
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
            {
              id: "base-1",
              type: "base",
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              id: "base-3",
              type: "base",
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "double_door",
          width: 120,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-1",
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
          id: "upper-2",
          type: "upper",
          variant: "double_door",
          width: 120,
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
          width: 120,
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
      ],
    },
  },

  luxury_dark: {
    id: "luxury_dark",
    name: "Luxury Dark Kitchen",
    description: "Elegant dark kitchen for sophisticated tastes",
    config: {
      kitchenId: "kitchen-luxury-dark",
      name: "Luxury Dark Kitchen",
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
        facade: "loft_dark_glossy",
        countertop: "concrete_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
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
            {
              id: "base-1",
              type: "base",
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "double_door",
          width: 90,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-1",
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
          id: "upper-2",
          type: "upper",
          variant: "double_door",
          width: 90,
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
      ],
    },
  },

  bright_light: {
    id: "bright_light",
    name: "Bright Light Kitchen",
    description: "Bright and airy light-coloured kitchen",
    config: {
      kitchenId: "kitchen-bright-light",
      name: "Bright Light Kitchen",
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
        facade: "cabinet_blue.light",
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
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          width: 120,
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
      ],
    },
  },

  professional_chef: {
    id: "professional_chef",
    name: "Professional Chef Kitchen",
    description: "Large kitchen designed for cooking enthusiasts",
    config: {
      kitchenId: "kitchen-professional-chef",
      name: "Professional Chef Kitchen",
      style: "modern",
      globalSettings: {
        dimensions: {
          sideA: 420,
          sideB: 280,
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
        facade: "loft_dark_glossy",
        countertop: "concrete_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 420,
          direction: { x: 1, z: 0 },
          modules: [
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
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              id: "base-3",
              type: "base",
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          width: 90,
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
          width: 90,
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
      ],
    },
  },

  industrial_style: {
    id: "industrial_style",
    name: "Industrial Style Kitchen",
    description: "Trendy industrial-styled kitchen with raw materials",
    config: {
      kitchenId: "kitchen-industrial-style",
      name: "Industrial Style Kitchen",
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
        facade: "loft_dark_glossy",
        countertop: "concrete_grey",
        handle: "minimalist_bar_black",
      },
      layoutLines: [
        {
          id: "main_wall",
          name: "Main Wall",
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
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
            {
              id: "base-1",
              type: "base",
              variant: "doors",
              width: 120,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "double_door",
          width: 120,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-1",
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
          id: "upper-2",
          type: "upper",
          variant: "double_door",
          width: 90,
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
      ],
    },
  },

  cozy_warm: {
    id: "cozy_warm",
    name: "Cozy Warm Kitchen",
    description: "Warm and welcoming kitchen perfect for family gatherings",
    config: {
      kitchenId: "kitchen-cozy-warm",
      name: "Cozy Warm Kitchen",
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
        facade: "cabinet_blue.glossy",
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
            {
              id: "base-1",
              type: "base",
              variant: "doors",
              width: 90,
              positioning: { anchor: "floor", offset: { y: 0 } },
              handle: {
                placement: { type: "centered", orientation: "vertical" },
              },
              structure: {
                type: "door-and-shelf",
                doorCount: 2,
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
              id: "base-3",
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
          ],
        },
      ],
      hangingModules: [
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
          variant: "double_door",
          width: 90,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-1",
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
          id: "upper-2",
          type: "upper",
          variant: "single_door",
          width: 60,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-2",
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
          id: "upper-3",
          type: "upper",
          variant: "single_door",
          width: 60,
          positioning: {
            anchor: "countertop",
            offset: { y: 50 },
            alignWithModule: "base-3",
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
    },
  },
};

export type KitchenOption = {
  id: string;
  name: string;
  description: string;
};

export const kitchenOptions: KitchenOption[] = Object.values(
  predefinedKitchens
).map((kitchen) => ({
  id: kitchen.id,
  name: kitchen.name,
  description: kitchen.description,
}));
