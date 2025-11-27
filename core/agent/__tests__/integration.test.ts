import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMaterialLibrary,
  getModuleLibrary,
  getRoomTextures,
  validateKitchenConfig,
  generateLayout,
} from '../tools';
import { exampleKitchenConfig } from '../../examples/example-kitchen-config';

/**
 * Integration tests for AI Agent tools
 * Tests the complete flow of tools working together
 */
describe('AI Agent Tools Integration', () => {
  describe('Complete Kitchen Design Workflow', () => {
    it('should support full design workflow: get resources -> validate -> generate layout', async () => {
      // Step 1: Get available materials
      const materials = await getMaterialLibrary.execute({ category: 'all' });
      expect(materials).toHaveProperty('facades');
      expect(materials).toHaveProperty('countertops');
      expect(materials).toHaveProperty('handles');

      // Step 2: Get available modules
      const modules = await getModuleLibrary.execute({ moduleType: 'all' });
      expect(Object.keys(modules).length).toBeGreaterThan(0);

      // Step 3: Get room textures
      const textures = await getRoomTextures.execute({ surfaceType: 'all' });
      expect(textures).toHaveProperty('walls');
      expect(textures).toHaveProperty('floors');
      expect(textures).toHaveProperty('ceilings');

      // Step 4: Validate configuration
      const validationResult = await validateKitchenConfig.execute({
        config: exampleKitchenConfig,
      });
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.fixedConfig).toBeDefined();

      // Step 5: Generate layout
      const layoutResult = await generateLayout.execute({
        config: validationResult.fixedConfig,
      });
      expect(layoutResult.success).toBe(true);
      expect((layoutResult.modules as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('should handle invalid config and provide helpful feedback', async () => {
      const invalidConfig = {
        layoutLines: [],
        hangingModules: [],
        // Missing required fields
      };

      const result = await validateKitchenConfig.execute({
        config: invalidConfig,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Dependencies', () => {
    it('should work with results from one tool as input to another', async () => {
      // Get modules to understand available types
      const modulesResult = await getModuleLibrary.execute({
        moduleType: 'base',
      });
      expect(modulesResult).toHaveProperty('base');

      // Use example config with these modules
      const config = exampleKitchenConfig;

      // Validate the config
      const validationResult = await validateKitchenConfig.execute({
        config,
      });
      expect(validationResult).toHaveProperty('fixedConfig');

      // Generate layout from validated config
      if (validationResult.fixedConfig) {
        const layoutResult = await generateLayout.execute({
          config: validationResult.fixedConfig,
        });

        // Layout should match module types we got earlier
        const layoutModuleTypes = (
          layoutResult.modules as Array<{ type: string }>
        ).map((m) => m.type);
        expect(layoutModuleTypes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling Across Tools', () => {
    it('should handle errors gracefully in sequence', async () => {
      // Try to generate layout with invalid config
      const invalidConfig = {
        invalid: 'data',
      };

      const result = await generateLayout.execute({
        config: invalidConfig,
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect((result.modules as Array<unknown>).length).toBe(0);
    });

    it('should validate even with partial config', async () => {
      const partialConfig = {
        kitchenId: 'test-kitchen',
        name: 'Test Kitchen',
        style: 'modern',
        layoutLines: [],
        hangingModules: [],
      };

      const result = await validateKitchenConfig.execute({
        config: partialConfig,
      });

      // Should handle gracefully (may have warnings/errors)
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('Large Data Sets', () => {
    it('should handle large material library efficiently', async () => {
      const startTime = performance.now();
      const result = await getMaterialLibrary.execute({ category: 'all' });
      const endTime = performance.now();

      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(result).toHaveProperty('facades');
    });

    it('should generate layout with multiple modules efficiently', async () => {
      const startTime = performance.now();
      const result = await generateLayout.execute({
        config: exampleKitchenConfig,
      });
      const endTime = performance.now();

      // Should complete within reasonable time (< 500ms)
      expect(endTime - startTime).toBeLessThan(500);
      expect(result.success).toBe(true);
    });
  });

  describe('Tool Data Consistency', () => {
    it('should return consistent material data across multiple calls', async () => {
      const result1 = await getMaterialLibrary.execute({
        category: 'facades',
      });
      const result2 = await getMaterialLibrary.execute({
        category: 'facades',
      });

      expect(result1).toEqual(result2);
    });

    it('should return consistent module data across multiple calls', async () => {
      const result1 = await getModuleLibrary.execute({ moduleType: 'base' });
      const result2 = await getModuleLibrary.execute({ moduleType: 'base' });

      expect(result1).toEqual(result2);
    });
  });

  describe('Tool Return Value Types', () => {
    it('should return properly typed results from getMaterialLibrary', async () => {
      const result = await getMaterialLibrary.execute({ category: 'all' });

      expect(Array.isArray(result.facades)).toBe(true);
      if ((result.facades as Array<unknown>).length > 0) {
        const facade = (result.facades as Array<{ id: string }>)[0];
        expect(facade.id).toBeDefined();
      }
    });

    it('should return properly typed results from getModuleLibrary', async () => {
      const result = await getModuleLibrary.execute({ moduleType: 'all' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return properly typed results from validateKitchenConfig', async () => {
      const result = await validateKitchenConfig.execute({
        config: exampleKitchenConfig,
      });

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.fixedConfig).toBeDefined();
    });

    it('should return properly typed results from generateLayout', async () => {
      const result = await generateLayout.execute({
        config: exampleKitchenConfig,
      });

      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.modules)).toBe(true);
    });
  });
});

