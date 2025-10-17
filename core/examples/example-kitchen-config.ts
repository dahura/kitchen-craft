// example-kitchen-config.ts
import type { KitchenConfig } from "../types";

export const exampleKitchenConfig: KitchenConfig = {
  kitchenId: "l_shape_prototype",
  name: "Прототип Угловой Кухни",
  style: "loft",
  globalSettings: {
    dimensions: {
      sideA: 300,
      sideB: 200,
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
      id: "wall_A",
      name: "Стена А",
      length: 300,
      direction: { x: 1, z: 0 },
      modules: [
        {
          id: "base-a1",
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
          id: "base-a2",
          type: "base",
          variant: "doors",
          width: 80,
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
          id: "base-a2-auto",
          type: "base",
          variant: "doors",
          width: "auto",
          positioning: { anchor: "floor", offset: { y: 0 } },
          constraints: { fillsRemainingSpace: true },
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
          id: "base-a3",
          type: "base",
          width: 80,
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
      ],
    },
    {
      id: "wall_B",
      name: "Стена Б",
      length: 200,
      direction: { x: 0, z: -1 },
      modules: [],
    },
  ],
  hangingModules: [
    {
      id: "wall-a1",
      type: "wall",
      variant: "doors",
      width: 60,
      positioning: {
        anchor: "countertop",
        offset: { y: 50 },
        alignWithModule: "base-a1",
      },
    },
  ],
};
