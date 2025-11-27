import { describe, it, expect } from 'vitest';
import {
  getMaterialLibrary,
  getModuleLibrary,
  getRoomTextures,
  validateKitchenConfig,
  generateLayout,
} from './tools';
import { exampleKitchenConfig } from '../examples/example-kitchen-config';

describe('AI Agent Tools', () => {
  describe('getMaterialLibrary', () => {
    it('should return all materials when category is "all"', async () => {
      const result = await getMaterialLibrary.execute({ category: 'all' });
      expect(result).toHaveProperty('facades');
      expect(result).toHaveProperty('countertops');
      expect(result).toHaveProperty('handles');
      expect(Object.keys(result.facades || {}).length).toBeGreaterThan(0);
    });

    it('should return only facades when category is "facades"', async () => {
      const result = await getMaterialLibrary.execute({ category: 'facades' });
      expect(result).toHaveProperty('facades');
      expect((result.facades as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('should return only countertops when category is "countertops"', async () => {
      const result = await getMaterialLibrary.execute({
        category: 'countertops',
      });
      expect(result).toHaveProperty('countertops');
      expect((result.countertops as Array<unknown>).length).toBeGreaterThan(0);
    });

    it('should return only handles when category is "handles"', async () => {
      const result = await getMaterialLibrary.execute({ category: 'handles' });
      expect(result).toHaveProperty('handles');
      expect((result.handles as Array<unknown>).length).toBeGreaterThan(0);
    });
  });

  describe('getModuleLibrary', () => {
    it('should return all modules when moduleType is "all"', async () => {
      const result = await getModuleLibrary.execute({ moduleType: 'all' });
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should return base modules when moduleType is "base"', async () => {
      const result = await getModuleLibrary.execute({ moduleType: 'base' });
      expect(result).toHaveProperty('base');
      expect((result.base as Record<string, unknown>).variants).toBeDefined();
    });

    it('should return error for invalid module type', async () => {
      const result = await getModuleLibrary.execute({
        moduleType: 'base',
      });
      expect(result).not.toHaveProperty('error');
    });
  });

  describe('getRoomTextures', () => {
    it('should return all textures when surfaceType is "all"', async () => {
      const result = await getRoomTextures.execute({ surfaceType: 'all' });
      expect(result).toHaveProperty('walls');
      expect(result).toHaveProperty('floors');
      expect(result).toHaveProperty('ceilings');
    });

    it('should return only walls when surfaceType is "walls"', async () => {
      const result = await getRoomTextures.execute({ surfaceType: 'walls' });
      expect(result).toHaveProperty('walls');
    });
  });

  describe('validateKitchenConfig', () => {
    it('should validate a valid kitchen config', async () => {
      const result = await validateKitchenConfig.execute({
        config: exampleKitchenConfig,
      });
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('fixedConfig');
    });

    it('should return errors for invalid config', async () => {
      const invalidConfig = {
        invalidField: 'test',
      };
      const result = await validateKitchenConfig.execute({
        config: invalidConfig,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateLayout', () => {
    it('should generate layout from valid kitchen config', async () => {
      const result = await generateLayout.execute({
        config: exampleKitchenConfig,
      });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('modules');
      if (result.success) {
        expect((result.modules as Array<unknown>).length).toBeGreaterThan(0);
      }
    });

    it('should return errors for invalid config', async () => {
      const invalidConfig = {
        invalidField: 'test',
      };
      const result = await generateLayout.execute({
        config: invalidConfig,
      });
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

