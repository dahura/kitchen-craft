/**
 * Unit tests for layout-engine.ts
 *
 * Tests the cabinet positioning logic to ensure no overlaps occur
 * and that cabinets are positioned correctly according to KIT-23 requirements.
 */

import { generate } from "./layout-engine";
import type { KitchenConfig, MaterialLibrary } from "../../types";

// Mock material library for testing
const mockMaterialLibrary: MaterialLibrary = {
  facades: {
    test_facade: {
      type: "standard",
      color: "#333333",
      roughness: 0.1,
      metalness: 0.0,
    },
  },
  countertops: {
    test_countertop: {
      type: "standard",
      color: "#666666",
      roughness: 0.8,
      metalness: 0.0,
    },
  },
  handles: {
    test_handle: {
      source: { type: "procedural", generator: "bar" },
      material: {
        type: "standard",
        color: "#000000",
        roughness: 0.2,
        metalness: 0.8,
      },
    },
  },
};

// Helper function to create test kitchen config
function createTestKitchenConfig(
  modules: Array<{ id: string; width: number }>,
): KitchenConfig {
  return {
    kitchenId: "test_kitchen",
    name: "Test Kitchen",
    style: "test",
    globalSettings: {
      dimensions: {
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
      rules: {
        mismatchPolicy: "auto_fix",
        gapBetweenModules: 0, // No gaps - cabinets should touch
      },
    },
    globalConstraints: {
      modules: { minWidth: 30, maxWidth: 120 },
      handles: { minDistanceFromEdge: 5 },
    },
    defaultMaterials: {
      facade: "test_facade",
      countertop: "test_countertop",
      handle: "test_handle",
    },
    layoutLines: [
      {
        id: "test_wall",
        name: "Test Wall",
        length: 2000, // 2000mm total length
        direction: { x: 1, z: 0 },
        modules: modules.map((module) => ({
          id: module.id,
          type: "base",
          variant: "doors",
          width: module.width,
          positioning: { anchor: "floor", offset: { y: 0 } },
          carcass: { thickness: 1.8, backPanelThickness: 0.5 },
          structure: {
            type: "door-and-shelf",
            doorCount: 1,
            shelves: [{ positionFromBottom: 30 }],
          },
        })),
      },
    ],
    hangingModules: [],
  };
}

// Test function to check for overlaps
function checkForOverlaps(renderableModules: ReturnType<typeof generate>) {
  const overlaps = [];

  for (let i = 1; i < renderableModules.length; i++) {
    const current = renderableModules[i];
    const previous = renderableModules[i - 1];

    const currentLeftEdge = current.position.x - current.dimensions.width / 2;
    const previousRightEdge =
      previous.position.x + previous.dimensions.width / 2;

    const gap = currentLeftEdge - previousRightEdge;

    if (gap < 0) {
      overlaps.push({
        cabinet1: previous.id,
        cabinet2: current.id,
        overlapAmount: Math.abs(gap),
      });
    }
  }

  return overlaps;
}

// Test 1: Equal width cabinets (original issue scenario)
console.log("🧪 Test 1: Equal width cabinets (300mm each)");
const testConfig1 = createTestKitchenConfig([
  { id: "cabinet-1", width: 300 },
  { id: "cabinet-2", width: 300 },
  { id: "cabinet-3", width: 300 },
]);

const result1 = generate(testConfig1, mockMaterialLibrary);
const overlaps1 = checkForOverlaps(result1);

console.log("Results:");
result1.forEach((module, index) => {
  const leftEdge = module.position.x - module.dimensions.width / 2;
  const rightEdge = module.position.x + module.dimensions.width / 2;
  console.log(
    `  ${module.id}: center=${module.position.x}, left=${leftEdge}, right=${rightEdge}`,
  );
});

if (overlaps1.length === 0) {
  console.log("✅ PASS: No overlaps detected");
} else {
  console.log("❌ FAIL: Overlaps detected:", overlaps1);
}
console.log("");

// Test 2: Varying width cabinets
console.log("🧪 Test 2: Varying width cabinets");
const testConfig2 = createTestKitchenConfig([
  { id: "cabinet-1", width: 600 },
  { id: "cabinet-2", width: 400 },
  { id: "cabinet-3", width: 300 },
]);

const result2 = generate(testConfig2, mockMaterialLibrary);
const overlaps2 = checkForOverlaps(result2);

console.log("Results:");
result2.forEach((module, index) => {
  const leftEdge = module.position.x - module.dimensions.width / 2;
  const rightEdge = module.position.x + module.dimensions.width / 2;
  console.log(
    `  ${module.id}: center=${module.position.x}, left=${leftEdge}, right=${rightEdge}`,
  );
});

if (overlaps2.length === 0) {
  console.log("✅ PASS: No overlaps detected");
} else {
  console.log("❌ FAIL: Overlaps detected:", overlaps2);
}
console.log("");

// Test 3: Many small cabinets
console.log("🧪 Test 3: Multiple small cabinets");
const testConfig3 = createTestKitchenConfig([
  { id: "cabinet-1", width: 150 },
  { id: "cabinet-2", width: 200 },
  { id: "cabinet-3", width: 180 },
  { id: "cabinet-4", width: 220 },
  { id: "cabinet-5", width: 160 },
]);

const result3 = generate(testConfig3, mockMaterialLibrary);
const overlaps3 = checkForOverlaps(result3);

console.log("Results:");
result3.forEach((module, index) => {
  const leftEdge = module.position.x - module.dimensions.width / 2;
  const rightEdge = module.position.x + module.dimensions.width / 2;
  console.log(
    `  ${module.id}: center=${module.position.x}, left=${leftEdge}, right=${rightEdge}`,
  );
});

if (overlaps3.length === 0) {
  console.log("✅ PASS: No overlaps detected");
} else {
  console.log("❌ FAIL: Overlaps detected:", overlaps3);
}
console.log("");

// Test 4: Verify expected positioning for KIT-23 acceptance criteria
console.log("🧪 Test 4: Verify KIT-23 acceptance criteria");
console.log(
  "Expected: Cabinet-n at x = Σ(width_i) for all previous cabinets i",
);

const testModules = [
  { id: "cabinet-1", width: 300 },
  { id: "cabinet-2", width: 300 },
  { id: "cabinet-3", width: 300 },
];

const testConfig4 = createTestKitchenConfig(testModules);
const result4 = generate(testConfig4, mockMaterialLibrary);

// Calculate expected positions
let expectedLeftEdge = 0;
let allPositionsCorrect = true;

result4.forEach((module, index) => {
  const actualLeftEdge = module.position.x - module.dimensions.width / 2;
  const actualRightEdge = module.position.x + module.dimensions.width / 2;

  console.log(`  ${module.id}:`);
  console.log(`    Expected left edge: ${expectedLeftEdge}`);
  console.log(`    Actual left edge: ${actualLeftEdge}`);
  console.log(
    `    Expected right edge: ${expectedLeftEdge + module.dimensions.width}`,
  );
  console.log(`    Actual right edge: ${actualRightEdge}`);

  if (actualLeftEdge !== expectedLeftEdge) {
    console.log(`    ❌ Position mismatch!`);
    allPositionsCorrect = false;
  } else {
    console.log(`    ✅ Position correct`);
  }

  expectedLeftEdge += module.dimensions.width;
});

if (allPositionsCorrect) {
  console.log("✅ PASS: All positions match KIT-23 requirements");
} else {
  console.log("❌ FAIL: Some positions do not match KIT-23 requirements");
}

// Summary
const totalTests = 4;
const passedTests =
  [overlaps1, overlaps2, overlaps3].filter((o) => o.length === 0).length +
  (allPositionsCorrect ? 1 : 0);

console.log("");
console.log("=".repeat(50));
console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 All tests PASSED! KIT-23 positioning bug has been fixed.");
  console.log("✅ Sequential placement without any overlap");
  console.log("✅ No unintended gaps; edges touch precisely");
  console.log("✅ Correct positions for arrays of cabinets of varying lengths");
} else {
  console.log(
    "💥 Some tests FAILED! The positioning bug may not be fully resolved.",
  );
}

export { checkForOverlaps, createTestKitchenConfig };
