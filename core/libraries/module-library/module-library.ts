// module-library.ts
import type { ModuleLibrary } from "../../types";

export const moduleLibrary: ModuleLibrary = {
  base: {
    variants: {
      doors: { defaultHeight: 90, minWidth: 30, maxWidth: 120 },
      drawers: { defaultHeight: 90, minWidth: 40, maxWidth: 120 },
    },
  },
  sink: {
    variants: {
      single: { defaultWidth: 80, minWidth: 60, maxWidth: 100 },
    },
  },
  wall: {
    variants: {
      doors: { defaultHeight: 70, minWidth: 30, maxWidth: 120 },
    },
  },
};
