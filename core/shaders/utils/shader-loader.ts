/**
 * Shader Loader Utility - Framework-agnostic
 * Pure functions for loading and validating shader configurations.
 */

import { ShaderConfiguration, ShaderLoadResult } from '../types';

export async function loadShaderSource(filePath: string): Promise<string> {
  throw new Error(`loadShaderSource not implemented for: ${filePath}`);
}

export function validateShaderConfig(config: ShaderConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.id || config.id.trim().length === 0) {
    errors.push('Shader config must have a non-empty id');
  }

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Shader config must have a non-empty name');
  }

  if (!config.uniforms || Object.keys(config.uniforms).length === 0) {
    errors.push('Shader config must define at least one uniform');
  }

  if (!config.varyings || Object.keys(config.varyings).length === 0) {
    errors.push('Shader config must define at least one varying');
  }

  if (config.uniforms) {
    Object.entries(config.uniforms).forEach(([name, def]) => {
      if (!def.type || def.type.length === 0) {
        errors.push(`Uniform '${name}' must have a type`);
      }
      if (def.required === undefined) {
        errors.push(`Uniform '${name}' must specify 'required' property`);
      }
    });
  }

  if (config.varyings) {
    Object.entries(config.varyings).forEach(([name, type]) => {
      if (!type || type.length === 0) {
        errors.push(`Varying '${name}' must have a type`);
      }
    });
  }

  if (!config.files || !config.files.vertex || !config.files.fragment) {
    errors.push('Shader config must specify vertex and fragment file paths');
  }

  if (!config.properties) {
    errors.push('Shader config must define properties');
  } else {
    if (config.properties.roughness < 0 || config.properties.roughness > 1) {
      errors.push('Shader roughness must be between 0 and 1');
    }
    if (config.properties.metalness < 0 || config.properties.metalness > 1) {
      errors.push('Shader metalness must be between 0 and 1');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getRequiredUniforms(config: ShaderConfiguration): string[] {
  return Object.entries(config.uniforms)
    .filter(([, def]) => def.required)
    .map(([name]) => name);
}

export function getOptionalUniforms(config: ShaderConfiguration): string[] {
  return Object.entries(config.uniforms)
    .filter(([, def]) => !def.required)
    .map(([name]) => name);
}

export function getTextureMapNames(config: ShaderConfiguration): string[] {
  if (!config.textureMaps) {
    return [];
  }
  return Object.keys(config.textureMaps);
}

export function buildUniformDefaults(config: ShaderConfiguration): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  Object.entries(config.uniforms).forEach(([name, def]) => {
    if (def.defaultValue !== undefined) {
      defaults[name] = def.defaultValue;
    }
  });

  return defaults;
}

export function validateUniforms(
  provided: Record<string, unknown>,
  config: ShaderConfiguration
): { valid: boolean; missing: string[] } {
  const requiredUniforms = getRequiredUniforms(config);
  const missing = requiredUniforms.filter((uniform) => !(uniform in provided));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function validateShaderSource(
  source: string,
  type: 'vertex' | 'fragment'
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!source || source.trim().length === 0) {
    return {
      valid: false,
      warnings: ['Shader source is empty'],
    };
  }

  if (!source.includes('void main()')) {
    warnings.push('Shader source does not contain main() function');
  }

  if (type === 'fragment' && !source.includes('gl_FragColor')) {
    warnings.push('Fragment shader does not set gl_FragColor');
  }

  if (type === 'vertex' && !source.includes('gl_Position')) {
    warnings.push('Vertex shader does not set gl_Position');
  }

  return {
    valid: warnings.length === 0 || warnings.length < 3,
    warnings,
  };
}

export function createShaderLoadResult(
  id: string,
  vertexShader: string,
  fragmentShader: string,
  config: ShaderConfiguration,
  error?: string
): ShaderLoadResult {
  return {
    id,
    vertexShader,
    fragmentShader,
    config,
    success: !error,
    error,
  };
}

