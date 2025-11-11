/**
 * Lighting Manager
 * 
 * Manages lighting configuration and provides utilities for
 * updating shader uniforms with light properties.
 */

import * as THREE from 'three';
import type { LightingConfiguration, LightSource } from '../../../../../core/types';

/**
 * Default lighting configuration for kitchen scenes
 */
export const DEFAULT_LIGHTING: LightingConfiguration = {
  ambient: {
    color: { r: 0.4, g: 0.4, b: 0.4 },
    intensity: 0.5,
  },
  keyLight: {
    type: 'directional',
    direction: { x: 1, y: 1, z: 1 },
    color: { r: 1, g: 1, b: 1 },
    intensity: 1.0,
    castShadow: true,
  },
  fillLight: {
    type: 'directional',
    direction: { x: -0.5, y: 0.5, z: -0.5 },
    color: { r: 0.8, g: 0.8, b: 0.9 },
    intensity: 0.4,
    castShadow: false,
  },
};

/**
 * Convert LightSource to Three.js Light
 */
export function lightSourceToThreeLight(source: LightSource): THREE.Light {
  const color = new THREE.Color(source.color.r, source.color.g, source.color.b);

  switch (source.type) {
    case 'directional': {
      const light = new THREE.DirectionalLight(color, source.intensity);
      if (source.direction) {
        light.position.set(source.direction.x, source.direction.y, source.direction.z);
        light.target.position.set(0, 0, 0);
      }
      if (source.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = source.shadowMapSize ?? 2048;
        light.shadow.mapSize.height = source.shadowMapSize ?? 2048;
        light.shadow.camera.left = -50;
        light.shadow.camera.right = 50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        light.shadow.camera.far = 500;
      }
      return light;
    }

    case 'point': {
      const light = new THREE.PointLight(color, source.intensity);
      if (source.position) {
        light.position.set(source.position.x, source.position.y, source.position.z);
      }
      if (source.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = source.shadowMapSize ?? 1024;
        light.shadow.mapSize.height = source.shadowMapSize ?? 1024;
      }
      return light;
    }

    case 'spot': {
      const light = new THREE.SpotLight(color, source.intensity);
      if (source.position) {
        light.position.set(source.position.x, source.position.y, source.position.z);
      }
      if (source.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = source.shadowMapSize ?? 1024;
        light.shadow.mapSize.height = source.shadowMapSize ?? 1024;
      }
      return light;
    }
  }
}

/**
 * Build shader uniform updates from lighting configuration
 * Returns object ready to be passed to updateShaderUniforms
 */
export function buildLightingUniforms(lighting: LightingConfiguration): Record<string, any> {
  return {
    uLightDir: new THREE.Vector3(
      lighting.keyLight.direction?.x ?? 1,
      lighting.keyLight.direction?.y ?? 1,
      lighting.keyLight.direction?.z ?? 1
    ).normalize(),
    uLightColor: new THREE.Vector3(
      lighting.keyLight.color.r,
      lighting.keyLight.color.g,
      lighting.keyLight.color.b
    ).multiplyScalar(lighting.keyLight.intensity),
    uAmbientLight: new THREE.Vector3(
      lighting.ambient.color.r,
      lighting.ambient.color.g,
      lighting.ambient.color.b
    ).multiplyScalar(lighting.ambient.intensity),
  };
}

/**
 * Create lighting configuration for time-of-day
 * Useful for animating light changes
 */
export function createTimeOfDayLighting(timeOfDay: number): LightingConfiguration {
  // timeOfDay: 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 1.0 = midnight
  const normalizedTime = ((timeOfDay % 1) + 1) % 1;

  // Calculate sun position
  const sunHeight = Math.sin(normalizedTime * Math.PI) * 80; // 0 to 80 units
  const sunAngle = normalizedTime * Math.PI * 2;

  // Calculate light intensity based on time
  let intensity = Math.max(0.3, Math.sin(normalizedTime * Math.PI));

  // Sunrise/sunset colors
  let lightColor = { r: 1, g: 1, b: 1 };

  if (normalizedTime < 0.25) {
    // Night to sunrise: blue to orange
    const t = normalizedTime / 0.25;
    lightColor = {
      r: 0.4 + 0.6 * t,
      g: 0.4 + 0.3 * t,
      b: 0.6 + 0.4 * (1 - t),
    };
    intensity *= 0.5;
  } else if (normalizedTime > 0.75) {
    // Sunset to night: orange to blue
    const t = (normalizedTime - 0.75) / 0.25;
    lightColor = {
      r: 1 - 0.6 * t,
      g: 0.7 - 0.3 * t,
      b: 1 - 0.4 * (1 - t),
    };
    intensity *= 0.5 + 0.5 * t;
  }

  return {
    ambient: {
      color: { r: 0.3, g: 0.3, b: 0.4 },
      intensity: intensity * 0.4,
    },
    keyLight: {
      type: 'directional',
      direction: {
        x: Math.cos(sunAngle) * 50,
        y: sunHeight,
        z: Math.sin(sunAngle) * 50,
      },
      color: lightColor,
      intensity: intensity,
      castShadow: true,
    },
    fillLight: {
      type: 'directional',
      direction: { x: -1, y: 0.5, z: -1 },
      color: { r: 0.7, g: 0.7, b: 0.8 },
      intensity: intensity * 0.3,
      castShadow: false,
    },
  };
}

/**
 * Class for managing lighting in a Three.js scene
 * Handles light creation, updates, and uniform management
 */
export class LightingManager {
  private lighting: LightingConfiguration;
  private lights: Map<string, THREE.Light> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, initialLighting?: LightingConfiguration) {
    this.scene = scene;
    this.lighting = initialLighting ?? DEFAULT_LIGHTING;
    this.setupLights();
  }

  private setupLights(): void {
    // Clear existing lights
    this.lights.forEach((light) => this.scene.remove(light));
    this.lights.clear();

    // Setup key light
    const keyLight = lightSourceToThreeLight(this.lighting.keyLight);
    this.scene.add(keyLight);
    this.lights.set('keyLight', keyLight);

    // Setup fill light if defined
    if (this.lighting.fillLight) {
      const fillLight = lightSourceToThreeLight(this.lighting.fillLight);
      this.scene.add(fillLight);
      this.lights.set('fillLight', fillLight);
    }

    // Setup backlights if defined
    if (this.lighting.backlights) {
      this.lighting.backlights.forEach((backlight, index) => {
        const light = lightSourceToThreeLight(backlight);
        this.scene.add(light);
        this.lights.set(`backlight-${index}`, light);
      });
    }
  }

  /**
   * Update lighting configuration
   */
  public setLighting(lighting: LightingConfiguration): void {
    this.lighting = lighting;
    this.setupLights();
  }

  /**
   * Get current lighting configuration
   */
  public getLighting(): LightingConfiguration {
    return this.lighting;
  }

  /**
   * Get shader uniforms for current lighting
   */
  public getShaderUniforms(): Record<string, any> {
    return buildLightingUniforms(this.lighting);
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.lights.forEach((light) => {
      this.scene.remove(light);
      if ('dispose' in light) {
        (light as any).dispose();
      }
    });
    this.lights.clear();
  }
}

/**
 * React Hook for lighting management
 */
export function useLightingManager(
  scene: THREE.Scene,
  initialLighting?: LightingConfiguration
): LightingManager {
  const manager = new LightingManager(scene, initialLighting);
  return manager;
}

