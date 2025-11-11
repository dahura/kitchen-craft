/**
 * Shader System Export Hub
 * 
 * Centralizes all shader configuration exports for easy access
 * throughout the Kitchen-Craft framework.
 */

export * from './types';
export * from './wood-cabinet/config';
export * from './countertop/config';
export * from './room-surfaces/config';

import { ShaderCatalog } from './types';
import { WOOD_CABINET_SHADER_CONFIG } from './wood-cabinet/config';
import { QUARTZ_COUNTERTOP_SHADER_CONFIG } from './countertop/config';
import { WHITE_PLASTER_WALL_SHADER_CONFIG } from './room-surfaces/config';

/**
 * Complete shader catalog
 * Contains all available shader configurations
 * Useful for validation and runtime shader selection
 */
export const SHADER_CATALOG: ShaderCatalog = {
  'wood-cabinet': WOOD_CABINET_SHADER_CONFIG,
  'quartz-countertop': QUARTZ_COUNTERTOP_SHADER_CONFIG,
  'white-plaster-wall': WHITE_PLASTER_WALL_SHADER_CONFIG,
};

/**
 * Get shader configuration by ID
 * @param shaderId - Unique shader identifier
 * @returns Shader configuration or undefined if not found
 */
export function getShaderConfig(shaderId: string) {
  return SHADER_CATALOG[shaderId];
}

/**
 * List all available shader IDs
 */
export function listAvailableShaders(): string[] {
  return Object.keys(SHADER_CATALOG);
}

/**
 * Validate if shader exists
 */
export function isValidShader(shaderId: string): boolean {
  return shaderId in SHADER_CATALOG;
}

