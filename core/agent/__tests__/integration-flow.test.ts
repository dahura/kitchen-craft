import { describe, it, expect } from 'bun:test';
import type { KitchenConfig, RenderableModule, ValidationResult } from '@/core/types';
import { validateAndFix } from '@/core/engines/validator-engine/validator-engine';
import { generate } from '@/core/engines/layout-engine/layout-engine';
import { materialLibrary } from '@/core/libraries/material-library/material-library';
import { moduleLibrary } from '@/core/libraries/module-library/module-library';

/**
 * Integration test for the complete AI → Render workflow
 * This verifies that validation, layout generation, and module rendering work together
 */

describe('AI Agent Integration Flow', () => {
  /**
   * Test 1: Configuration Validation
   */
  it('should validate a kitchen configuration', () => {
    const config: KitchenConfig = {
      kitchenId: 'test-kitchen-1',
      name: 'Test Kitchen 1',
      style: 'modern',
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
        rules: { mismatchPolicy: 'auto_fix', gapBetweenModules: 0 },
      },
      globalConstraints: {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      },
      defaultMaterials: {
        facade: 'cabinet_blue.matte',
        countertop: 'quartz_grey',
        handle: 'minimalist_bar_black',
      },
      layoutLines: [
        {
          id: 'line-1',
          name: 'Main Wall',
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
            {
              id: 'module-1',
              type: 'base',
              width: 60,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
          ],
        },
      ],
      hangingModules: [],
    };

    const result: ValidationResult = validateAndFix(
      config,
      config.globalConstraints,
      moduleLibrary
    );

    expect(result).toBeDefined();
    expect(result.errors).toBeInstanceOf(Array);
    expect(result.warnings).toBeInstanceOf(Array);
    expect(result.fixedConfig).toBeDefined();
  });

  /**
   * Test 2: Layout Generation
   */
  it('should generate renderable modules from a valid config', () => {
    const config: KitchenConfig = {
      kitchenId: 'test-kitchen-2',
      name: 'Test Kitchen 2',
      style: 'modern',
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
        rules: { mismatchPolicy: 'auto_fix', gapBetweenModules: 0 },
      },
      globalConstraints: {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      },
      defaultMaterials: {
        facade: 'cabinet_blue.matte',
        countertop: 'quartz_grey',
        handle: 'minimalist_bar_black',
      },
      layoutLines: [
        {
          id: 'line-1',
          name: 'Main Wall',
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
            {
              id: 'module-1',
              type: 'base',
              width: 60,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
            {
              id: 'module-2',
              type: 'base',
              width: 90,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
          ],
        },
      ],
      hangingModules: [],
    };

    // Validate first
    const validation = validateAndFix(
      config,
      config.globalConstraints,
      moduleLibrary
    );

    // Then generate layout
    const modules: RenderableModule[] = generate(
      validation.fixedConfig,
      materialLibrary
    );

    expect(modules).toBeInstanceOf(Array);
    expect(modules.length).toBeGreaterThan(0);

    // Verify module structure
    const firstModule = modules[0];
    expect(firstModule).toBeDefined();
    expect(firstModule.id).toBeDefined();
    expect(firstModule.type).toBeDefined();
    expect(firstModule.position).toBeDefined();
    expect(firstModule.position.x).toBeDefined();
    expect(firstModule.position.y).toBeDefined();
    expect(firstModule.position.z).toBeDefined();
    expect(firstModule.dimensions).toBeDefined();
    expect(firstModule.materials).toBeDefined();
  });

  /**
   * Test 3: Complete Workflow (Validation → Layout Generation)
   */
  it('should complete full validation → layout generation workflow', () => {
    const config: KitchenConfig = {
      kitchenId: 'test-kitchen-3',
      name: 'Test Kitchen 3',
      style: 'modern',
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
        rules: { mismatchPolicy: 'auto_fix', gapBetweenModules: 0 },
      },
      globalConstraints: {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      },
      defaultMaterials: {
        facade: 'cabinet_blue.matte',
        countertop: 'quartz_grey',
        handle: 'minimalist_bar_black',
      },
      layoutLines: [
        {
          id: 'line-1',
          name: 'Main Wall',
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
            {
              id: 'module-1',
              type: 'base',
              width: 60,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
          ],
        },
      ],
      hangingModules: [],
    };

    // Step 1: Validate
    const validation = validateAndFix(
      config,
      config.globalConstraints,
      moduleLibrary
    );
    expect(validation.fixedConfig).toBeDefined();

    // Step 2: Generate layout
    const modules = generate(validation.fixedConfig, materialLibrary);
    expect(modules.length).toBeGreaterThan(0);

    // Step 3: Verify data structure is ready for 3D rendering
    const readyForRendering = modules.every((module) => {
      return (
        module.id &&
        module.type &&
        module.position.x !== undefined &&
        module.position.y !== undefined &&
        module.position.z !== undefined &&
        module.dimensions.width > 0 &&
        module.dimensions.depth > 0 &&
        module.dimensions.height > 0
      );
    });

    expect(readyForRendering).toBe(true);
  });

  /**
   * Test 4: Configuration with Multiple Modules
   */
  it('should handle kitchen with multiple modules', () => {
    const config: KitchenConfig = {
      kitchenId: 'test-kitchen-4',
      name: 'Test Kitchen 4',
      style: 'modern',
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
        rules: { mismatchPolicy: 'auto_fix', gapBetweenModules: 0 },
      },
      globalConstraints: {
        modules: {
          minWidth: 30,
          maxWidth: 120,
        },
        handles: {
          minDistanceFromEdge: 10,
        },
      },
      defaultMaterials: {
        facade: 'cabinet_blue.matte',
        countertop: 'quartz_grey',
        handle: 'minimalist_bar_black',
      },
      layoutLines: [
        {
          id: 'line-1',
          name: 'Main Wall',
          length: 360,
          direction: { x: 1, z: 0 },
          modules: [
            {
              id: 'module-1',
              type: 'base',
              width: 60,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
            {
              id: 'module-2',
              type: 'base',
              width: 90,
              positioning: { anchor: 'floor', offset: { y: 0 } },
              handle: {
                placement: { type: 'centered', orientation: 'horizontal' },
              },
            },
          ],
        },
      ],
      hangingModules: [],
    };

    const validation = validateAndFix(
      config,
      config.globalConstraints,
      moduleLibrary
    );
    const modules = generate(validation.fixedConfig, materialLibrary);

    expect(modules.length).toBeGreaterThanOrEqual(2);
  });
});

