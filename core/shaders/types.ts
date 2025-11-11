/**
 * Shader System Type Definitions
 * 
 * Framework-agnostic types for shader configuration.
 * These types define the structure and expectations for all shader materials
 * used in Kitchen-Craft rendering system.
 * 
 * No imports from React, Three.js, or any UI framework.
 */

// --- Uniform Types ---

export type ShaderUniformType =
  | 'float'
  | 'int'
  | 'bool'
  | 'vec2'
  | 'vec3'
  | 'vec4'
  | 'mat2'
  | 'mat3'
  | 'mat4'
  | 'sampler2D'
  | 'samplerCube';

export interface ShaderUniformDefinition {
  type: ShaderUniformType;
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface ShaderUniformsStructure {
  [key: string]: ShaderUniformDefinition;
}

// --- Varying Types ---

export interface ShaderVaryingsStructure {
  [key: string]: ShaderUniformType;
}

// --- Texture Map Types ---

export interface TextureMapDefinition {
  path: string;
  description?: string;
  mipmap?: boolean;
}

export interface TextureMapsStructure {
  [key: string]: TextureMapDefinition;
}

// --- PBR Shader Configuration ---

export interface ShaderProperties {
  /**
   * Shader material type/category
   * 'pbr' = Physically Based Rendering
   * 'custom' = Custom shader implementation
   */
  type: 'pbr' | 'custom';

  /**
   * Surface roughness (0 = mirror-like, 1 = matte)
   * Defaults to 0.5 for balanced appearance
   */
  roughness: number;

  /**
   * Metalness property (0 = non-metal, 1 = fully metallic)
   * Defaults to 0 for non-metallic materials
   */
  metalness: number;

  /**
   * Normal map intensity/strength
   * Defaults to 1.0 (no modifier)
   */
  normalMapIntensity?: number;

  /**
   * Parallax/height mapping strength
   * Optional: for advanced parallax mapping effects
   */
  parallaxHeight?: number;

  /**
   * Ambient occlusion intensity
   * Optional: for shadow enhancement in crevices
   */
  aoIntensity?: number;

  /**
   * Enable/disable shadow mapping
   */
  receiveShadow?: boolean;
  castShadow?: boolean;
}

// --- Main Shader Configuration ---

/**
 * Complete shader configuration
 * Defines all uniforms, varyings, texture maps, and PBR properties
 * This is the contract between core/ and app/ layers
 */
export interface ShaderConfiguration {
  /**
   * Unique identifier for this shader
   * e.g., "wood-cabinet", "quartz-countertop", "white-plaster-wall"
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of what this shader is for
   */
  description: string;

  /**
   * Uniform variables expected by vertex and fragment shaders
   * Maps uniform name → definition
   */
  uniforms: ShaderUniformsStructure;

  /**
   * Varying variables passed from vertex to fragment shader
   */
  varyings: ShaderVaryingsStructure;

  /**
   * Texture maps this shader requires
   * Maps variable name → texture path/metadata
   */
  textureMaps?: TextureMapsStructure;

  /**
   * PBR and material-specific properties
   */
  properties: ShaderProperties;

  /**
   * Paths to shader files (relative to core/shaders/)
   */
  files: {
    vertex: string;
    fragment: string;
  };

  /**
   * Additional metadata
   */
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
  };
}

// --- Shader Catalog ---

/**
 * Registry of all available shader configurations
 * Used for validation and type-safe shader references
 */
export interface ShaderCatalog {
  [shaderId: string]: ShaderConfiguration;
}

// --- Material to Shader Mapping ---

/**
 * Extends MaterialDefinition to include shader reference
 * This allows materials to specify which shader to use during rendering
 */
export interface MaterialWithShader {
  /**
   * Reference to shader configuration ID
   * e.g., "wood-cabinet", "quartz-countertop"
   */
  shaderId?: string;

  /**
   * Override shader properties for this specific material
   * These override defaults in ShaderConfiguration.properties
   */
  shaderProperties?: Partial<ShaderProperties>;
}

// --- Lighting Configuration ---

/**
 * Light source configuration for shader uniforms
 */
export interface LightSource {
  type: 'directional' | 'point' | 'spot';
  
  direction?: {
    x: number;
    y: number;
    z: number;
  };
  
  position?: {
    x: number;
    y: number;
    z: number;
  };
  
  color: {
    r: number;
    g: number;
    b: number;
  };
  
  intensity: number;
  castShadow?: boolean;
  shadowMapSize?: number;
}

export interface LightingConfiguration {
  ambient: {
    color: { r: number; g: number; b: number };
    intensity: number;
  };
  
  keyLight: LightSource;
  fillLight?: LightSource;
  backlights?: LightSource[];
}

// --- Shader Loading Result ---

export interface ShaderLoadResult {
  id: string;
  vertexShader: string;
  fragmentShader: string;
  config: ShaderConfiguration;
  success: boolean;
  error?: string;
}

export interface ShaderLoadResults {
  [shaderId: string]: ShaderLoadResult;
}

