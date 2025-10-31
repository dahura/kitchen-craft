/**
 * geometry-generator.example.ts
 * 
 * Example usage and demonstrations of the geometry-generator utilities.
 * Shows how to use the generator in different scenarios.
 * 
 * Part of Kitchen-Kraft MVP - MVP-02: Geometry Generator Core
 */

import * as THREE from 'three';
import type { RenderableModule } from '../../../../../core/types';
import {
  createBoxGeometry,
  createPlaneGeometry,
  createCylinderGeometry,
  applyUV,
  createMaterialFromDefinition,
  createColorMaterial,
  generateModuleGeometry,
  generateScene,
  createMeshesFromGeometryData,
  disposeGeometry,
  calculateBoundingBox,
} from './geometry-generator';

// ==================== EXAMPLE 1: Basic Geometry Creation ====================

/**
 * Example: Create basic geometries with UV mapping
 */
export function exampleBasicGeometries(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'basic-geometries-example';
  
  // Create a box with scaled UVs for texture tiling
  const boxGeometry = createBoxGeometry(100, 80, 60, { u: 2, v: 2 });
  const boxMaterial = createColorMaterial('#3498db', 0.3, 0.0);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.position.set(-150, 40, 0);
  group.add(boxMesh);
  
  // Create a plane for floor/wall
  const planeGeometry = createPlaneGeometry(200, 200, 4, 4, { u: 4, v: 4 });
  const planeMaterial = createColorMaterial('#95a5a6', 0.8, 0.0);
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.rotation.x = -Math.PI / 2;
  planeMesh.position.set(100, 0, 0);
  group.add(planeMesh);
  
  // Create a cylinder for handle
  const cylinderGeometry = createCylinderGeometry(1, 1, 15, 16);
  const cylinderMaterial = createColorMaterial('#2c3e50', 0.2, 0.9);
  const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinderMesh.rotation.z = Math.PI / 2;
  cylinderMesh.position.set(0, 40, 30);
  group.add(cylinderMesh);
  
  return group;
}

// ==================== EXAMPLE 2: Material Creation ====================

/**
 * Example: Create materials from definitions
 */
export function exampleMaterialCreation(): THREE.Material[] {
  const materials: THREE.Material[] = [];
  const loader = new THREE.TextureLoader();
  
  // Example 1: Simple colored material
  const simpleMaterial = createMaterialFromDefinition({
    type: 'paint',
    color: '#e74c3c',
    roughness: 0.4,
    metalness: 0.1,
  });
  materials.push(simpleMaterial);
  
  // Example 2: Material with textures
  const texturedMaterial = createMaterialFromDefinition(
    {
      type: 'wood',
      color: '#8B4513',
      roughness: 0.7,
      metalness: 0.0,
      diffuseMap: 'textures/wood_diffuse.jpg',
      normalMap: 'textures/wood_normal.jpg',
    },
    loader
  );
  materials.push(texturedMaterial);
  
  // Example 3: Metallic material
  const metallicMaterial = createColorMaterial('#34495e', 0.2, 0.95);
  materials.push(metallicMaterial);
  
  return materials;
}

// ==================== EXAMPLE 3: Complete Module Generation ====================

/**
 * Example: Generate a complete base cabinet module
 */
export function exampleBaseCabinet(): THREE.Group {
  // Create a mock RenderableModule
  const mockModule: RenderableModule = {
    id: 'base-cabinet-001',
    type: 'base',
    variant: 'standard',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    dimensions: { width: 80, height: 72, depth: 60 },
    structure: {
      type: 'drawers',
      count: 3,
      drawerHeights: [20, 24, 24],
      internalDepth: 55,
    },
    carcass: {
      thickness: 1.8,
      backPanelThickness: 0.5,
    },
    materials: {
      facade: {
        type: 'paint',
        color: '#2C3E50',
        finish: 'glossy',
        roughness: 0.2,
        metalness: 0.1,
      },
    },
    children: [],
  };
  
  // Generate geometry data
  const geometryData = generateModuleGeometry(mockModule);
  
  // Convert to Three.js meshes
  const moduleGroup = createMeshesFromGeometryData(
    geometryData,
    mockModule.position,
    mockModule.rotation
  );
  
  return moduleGroup;
}

/**
 * Example: Generate a wall cabinet with shelves
 */
export function exampleWallCabinet(): THREE.Group {
  const mockModule: RenderableModule = {
    id: 'wall-cabinet-001',
    type: 'wall',
    variant: 'standard',
    position: { x: 0, y: 140, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    dimensions: { width: 80, height: 70, depth: 35 },
    structure: {
      type: 'door-and-shelf',
      doorCount: 1,
      shelves: [
        { positionFromBottom: 35 },
      ],
    },
    carcass: {
      thickness: 1.8,
      backPanelThickness: 0.5,
    },
    materials: {
      facade: {
        type: 'paint',
        color: '#ECF0F1',
        roughness: 0.3,
        metalness: 0.0,
      },
    },
    children: [],
  };
  
  const geometryData = generateModuleGeometry(mockModule);
  const moduleGroup = createMeshesFromGeometryData(
    geometryData,
    mockModule.position,
    mockModule.rotation
  );
  
  return moduleGroup;
}

// ==================== EXAMPLE 4: Complete Kitchen Scene ====================

/**
 * Example: Generate a complete kitchen scene with multiple modules
 */
export function exampleKitchenScene(): THREE.Group {
  const modules: RenderableModule[] = [
    // Base cabinet 1
    {
      id: 'base-1',
      type: 'base',
      variant: 'standard',
      position: { x: 0, y: 10, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 72, depth: 60 },
      structure: {
        type: 'drawers',
        count: 3,
        drawerHeights: [20, 24, 24],
        internalDepth: 55,
      },
      carcass: { thickness: 1.8, backPanelThickness: 0.5 },
      materials: {
        facade: {
          type: 'paint',
          color: '#2C3E50',
          roughness: 0.2,
          metalness: 0.1,
        },
      },
      children: [],
    },
    // Base cabinet 2
    {
      id: 'base-2',
      type: 'base',
      variant: 'standard',
      position: { x: 65, y: 10, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 80, height: 72, depth: 60 },
      structure: {
        type: 'door-and-shelf',
        doorCount: 1,
        shelves: [{ positionFromBottom: 36 }],
      },
      carcass: { thickness: 1.8, backPanelThickness: 0.5 },
      materials: {
        facade: {
          type: 'paint',
          color: '#2C3E50',
          roughness: 0.2,
          metalness: 0.1,
        },
      },
      children: [],
    },
    // Wall cabinet
    {
      id: 'wall-1',
      type: 'wall',
      variant: 'standard',
      position: { x: 0, y: 140, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 60, height: 70, depth: 35 },
      structure: {
        type: 'door-and-shelf',
        doorCount: 1,
        shelves: [{ positionFromBottom: 35 }],
      },
      carcass: { thickness: 1.8, backPanelThickness: 0.5 },
      materials: {
        facade: {
          type: 'paint',
          color: '#ECF0F1',
          roughness: 0.3,
          metalness: 0.0,
        },
      },
      children: [],
    },
  ];
  
  // Generate complete scene
  const scene = generateScene(modules);
  
  return scene;
}

// ==================== EXAMPLE 5: Memory Management ====================

/**
 * Example: Proper cleanup of geometries and materials
 */
export function exampleMemoryManagement(): void {
  // Create a scene
  const scene = exampleKitchenScene();
  
  // Use the scene...
  // (render, manipulate, etc.)
  
  // When done, dispose of all geometries and materials
  disposeGeometry(scene);
  
  console.log('All geometries and materials disposed');
}

// ==================== EXAMPLE 6: Bounding Box Calculation ====================

/**
 * Example: Calculate bounding box for scene fitting
 */
export function exampleBoundingBox(): THREE.Box3 {
  const scene = exampleKitchenScene();
  const boundingBox = calculateBoundingBox(scene);
  
  console.log('Scene bounding box:', {
    min: boundingBox.min,
    max: boundingBox.max,
    size: boundingBox.getSize(new THREE.Vector3()),
    center: boundingBox.getCenter(new THREE.Vector3()),
  });
  
  return boundingBox;
}

// ==================== EXAMPLE 7: Integration with Three.js Scene ====================

/**
 * Example: Complete integration with Three.js scene setup
 */
export function exampleCompleteSetup(): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  kitchenGroup: THREE.Group;
} {
  // Create Three.js scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(150, 150, 150);
  camera.lookAt(0, 50, 0);
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 200, 100);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Generate and add kitchen scene
  const kitchenGroup = exampleKitchenScene();
  scene.add(kitchenGroup);
  
  // Add floor
  const floorGeometry = createPlaneGeometry(500, 500, 1, 1);
  const floorMaterial = createColorMaterial('#BDC3C7', 0.9, 0.0);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  
  return { scene, camera, renderer, kitchenGroup };
}

// ==================== EXAMPLE 8: Performance Optimization ====================

/**
 * Example: Use instanced meshes for repeated elements
 */
export function exampleInstancedGeometry(): THREE.InstancedMesh {
  // Create instanced mesh for multiple handles (performance optimization)
  const handleGeometry = createCylinderGeometry(0.5, 0.5, 12, 16);
  const handleMaterial = createColorMaterial('#2C3E50', 0.2, 0.9);
  
  // Create 50 instances
  const instancedMesh = new THREE.InstancedMesh(
    handleGeometry,
    handleMaterial,
    50
  );
  
  // Position each instance
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < 50; i++) {
    const x = (i % 10) * 10;
    const y = 40;
    const z = Math.floor(i / 10) * 10;
    
    matrix.setPosition(x, y, z);
    instancedMesh.setMatrixAt(i, matrix);
  }
  
  instancedMesh.instanceMatrix.needsUpdate = true;
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;
  
  return instancedMesh;
}

// ==================== EXPORT ALL EXAMPLES ====================

export const examples = {
  basicGeometries: exampleBasicGeometries,
  materialCreation: exampleMaterialCreation,
  baseCabinet: exampleBaseCabinet,
  wallCabinet: exampleWallCabinet,
  kitchenScene: exampleKitchenScene,
  memoryManagement: exampleMemoryManagement,
  boundingBox: exampleBoundingBox,
  completeSetup: exampleCompleteSetup,
  instancedGeometry: exampleInstancedGeometry,
};

/**
 * Run all examples (for testing/demonstration)
 */
export function runAllExamples(): void {
  console.log('Running Geometry Generator Examples...\n');
  
  console.log('1. Basic Geometries:');
  const basicGeom = exampleBasicGeometries();
  console.log(`  Created group with ${basicGeom.children.length} meshes\n`);
  
  console.log('2. Material Creation:');
  const materials = exampleMaterialCreation();
  console.log(`  Created ${materials.length} materials\n`);
  
  console.log('3. Base Cabinet:');
  const baseCab = exampleBaseCabinet();
  console.log(`  Created cabinet with ${baseCab.children.length} parts\n`);
  
  console.log('4. Wall Cabinet:');
  const wallCab = exampleWallCabinet();
  console.log(`  Created cabinet with ${wallCab.children.length} parts\n`);
  
  console.log('5. Complete Kitchen Scene:');
  const kitchen = exampleKitchenScene();
  console.log(`  Created scene with ${kitchen.children.length} modules\n`);
  
  console.log('6. Bounding Box Calculation:');
  exampleBoundingBox();
  
  console.log('\n7. Instanced Geometry:');
  const instanced = exampleInstancedGeometry();
  console.log(`  Created ${instanced.count} instanced handles\n`);
  
  console.log('All examples completed!');
}
