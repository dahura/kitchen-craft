/**
 * geometry-generator.ts
 *
 * Framework-agnostic geometry generator that converts RenderableModule[] into Three.js meshes.
 * Provides reusable helpers for creating box, plane geometries with proper UV mapping.
 *
 * Part of Kitchen-Kraft MVP - MVP-02: Geometry Generator Core
 */

import * as THREE from "three";
import type {
  RenderableModule,
  MaterialDefinition,
  Dimensions,
  Position,
  Rotation,
} from "../../../../../core/types";
import { FACADE_GAP } from "./constants";

// ==================== GEOMETRY HELPERS ====================

/**
 * Creates a box geometry with proper UV mapping
 * @param width - Width (X axis)
 * @param height - Height (Y axis)
 * @param depth - Depth (Z axis)
 * @param uvScale - UV scaling factor for texture tiling
 * @returns BoxGeometry with applied UVs
 */
export function createBoxGeometry(
  width: number,
  height: number,
  depth: number,
  uvScale: { u: number; v: number } = { u: 1, v: 1 },
): THREE.BoxGeometry {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  // Apply UV scaling if needed
  if (uvScale.u !== 1 || uvScale.v !== 1) {
    applyUV(geometry, uvScale);
  }

  return geometry;
}

/**
 * Creates a plane geometry with proper UV mapping
 * @param width - Width of the plane
 * @param height - Height of the plane
 * @param widthSegments - Number of width segments
 * @param heightSegments - Number of height segments
 * @param uvScale - UV scaling factor for texture tiling
 * @returns PlaneGeometry with applied UVs
 */
export function createPlaneGeometry(
  width: number,
  height: number,
  widthSegments: number = 1,
  heightSegments: number = 1,
  uvScale: { u: number; v: number } = { u: 1, v: 1 },
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments,
  );

  // Apply UV scaling if needed
  if (uvScale.u !== 1 || uvScale.v !== 1) {
    applyUV(geometry, uvScale);
  }

  return geometry;
}

/**
 * Applies UV scaling to geometry for texture tiling
 * @param geometry - Three.js BufferGeometry
 * @param uvScale - UV scaling factor
 */
export function applyUV(
  geometry: THREE.BufferGeometry,
  uvScale: { u: number; v: number },
): void {
  const uvAttribute = geometry.getAttribute("uv");

  if (!uvAttribute) {
    console.warn("Geometry does not have UV attribute");
    return;
  }

  const uvArray = uvAttribute.array as Float32Array;

  for (let i = 0; i < uvArray.length; i += 2) {
    uvArray[i] *= uvScale.u; // Scale U coordinate
    uvArray[i + 1] *= uvScale.v; // Scale V coordinate
  }

  uvAttribute.needsUpdate = true;
}

/**
 * Creates optimized cylinder geometry for handles and other cylindrical objects
 * @param radiusTop - Top radius
 * @param radiusBottom - Bottom radius
 * @param height - Height of cylinder
 * @param radialSegments - Number of radial segments
 * @returns CylinderGeometry
 */
export function createCylinderGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number = 16,
): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
  );
}

// ==================== MATERIAL HELPERS ====================

/**
 * Converts MaterialDefinition to Three.js Material
 * @param materialDef - Material definition from config
 * @param textureLoader - Optional texture loader for loading textures
 * @returns Three.js Material instance
 */
export function createMaterialFromDefinition(
  materialDef: MaterialDefinition,
  textureLoader?: THREE.TextureLoader,
): THREE.Material {
  const loader = textureLoader || new THREE.TextureLoader();

  // Default to MeshStandardMaterial for PBR workflow
  const materialParams: THREE.MeshStandardMaterialParameters = {
    color: materialDef.color || "#ffffff",
    roughness: materialDef.roughness ?? 0.5,
    metalness: materialDef.metalness ?? 0.0,
  };

  // Load textures if specified
  if (materialDef.diffuseMap) {
    materialParams.map = loader.load(materialDef.diffuseMap);
  }

  if (materialDef.normalMap) {
    materialParams.normalMap = loader.load(materialDef.normalMap);
  }

  if (materialDef.roughnessMap) {
    materialParams.roughnessMap = loader.load(materialDef.roughnessMap);
  }

  return new THREE.MeshStandardMaterial(materialParams);
}

/**
 * Creates a basic colored material for quick prototyping
 * @param color - Hex color string
 * @param roughness - Material roughness (0-1)
 * @param metalness - Material metalness (0-1)
 * @returns MeshStandardMaterial
 */
export function createColorMaterial(
  color: string,
  roughness: number = 0.5,
  metalness: number = 0.0,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

// ==================== MODULE GEOMETRY GENERATION ====================

/**
 * Mesh generation result containing geometry and material
 */
export interface MeshData {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  name: string;
}

/**
 * Complete module mesh data including main mesh and sub-meshes
 */
export interface ModuleGeometryData {
  id: string;
  type: string;
  mainMeshes: MeshData[];
  childMeshes: ModuleGeometryData[];
}

/**
 * Generates carcass geometry (box frame with panels)
 * @param dimensions - Module dimensions
 * @param thickness - Carcass panel thickness
 * @param material - Material for carcass
 * @returns Array of MeshData for each carcass panel
 */
export function generateCarcassGeometry(
  dimensions: Dimensions,
  thickness: number,
  backPanelThickness: number,
  material: THREE.Material,
): MeshData[] {
  const { width, height, depth } = dimensions;
  const meshes: MeshData[] = [];

  // Left panel
  meshes.push({
    geometry: createBoxGeometry(thickness, height, depth),
    material,
    position: new THREE.Vector3(-width / 2 + thickness / 2, height / 2, 0),
    rotation: new THREE.Euler(0, 0, 0),
    name: "carcass-left",
  });

  // Right panel
  meshes.push({
    geometry: createBoxGeometry(thickness, height, depth),
    material,
    position: new THREE.Vector3(width / 2 - thickness / 2, height / 2, 0),
    rotation: new THREE.Euler(0, 0, 0),
    name: "carcass-right",
  });

  // Top panel
  meshes.push({
    geometry: createBoxGeometry(width - thickness * 2, thickness, depth),
    material,
    position: new THREE.Vector3(0, height - thickness / 2, 0),
    rotation: new THREE.Euler(0, 0, 0),
    name: "carcass-top",
  });

  // Bottom panel
  meshes.push({
    geometry: createBoxGeometry(width - thickness * 2, thickness, depth),
    material,
    position: new THREE.Vector3(0, thickness / 2, 0),
    rotation: new THREE.Euler(0, 0, 0),
    name: "carcass-bottom",
  });

  // Back panel
  meshes.push({
    geometry: createBoxGeometry(width, height, backPanelThickness),
    material,
    position: new THREE.Vector3(
      0,
      height / 2,
      -depth / 2 + backPanelThickness / 2,
    ),
    rotation: new THREE.Euler(0, 0, 0),
    name: "carcass-back",
  });

  return meshes;
}

/**
 * Generates drawer geometry
 * @param width - Drawer width
 * @param height - Drawer height
 * @param depth - Drawer depth
 * @param position - Position in space
 * @param material - Material for drawer
 * @returns MeshData for drawer
 */
export function generateDrawerGeometry(
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3,
  material: THREE.Material,
): MeshData {
  return {
    geometry: createBoxGeometry(width, height, depth),
    material,
    position,
    rotation: new THREE.Euler(0, 0, 0),
    name: "drawer",
  };
}

/**
 * Generates door/facade geometry
 * @param width - Door width
 * @param height - Door height
 * @param depth - Door depth
 * @param position - Position in space
 * @param material - Material for door
 * @returns MeshData for door
 */
export function generateDoorGeometry(
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3,
  material: THREE.Material,
): MeshData {
  return {
    geometry: createBoxGeometry(width, height, depth),
    material,
    position,
    rotation: new THREE.Euler(0, 0, 0),
    name: "door",
  };
}

/**
 * Generates shelf geometry
 * @param width - Shelf width
 * @param depth - Shelf depth
 * @param thickness - Shelf thickness
 * @param position - Position in space
 * @param material - Material for shelf
 * @returns MeshData for shelf
 */
export function generateShelfGeometry(
  width: number,
  depth: number,
  thickness: number,
  position: THREE.Vector3,
  material: THREE.Material,
): MeshData {
  return {
    geometry: createBoxGeometry(width, thickness, depth),
    material,
    position,
    rotation: new THREE.Euler(0, 0, 0),
    name: "shelf",
  };
}

/**
 * Main function: Generates complete geometry data for a RenderableModule
 * @param module - RenderableModule to convert
 * @param textureLoader - Optional texture loader
 * @returns ModuleGeometryData with all meshes
 */
export function generateModuleGeometry(
  module: RenderableModule,
  textureLoader?: THREE.TextureLoader,
): ModuleGeometryData {
  const meshes: MeshData[] = [];

  // Create materials
  const carcassMaterial = module.materials.facade
    ? createMaterialFromDefinition(module.materials.facade, textureLoader)
    : createColorMaterial("#CCCCCC", 0.6, 0.1);

  const facadeMaterial = module.materials.facade
    ? createMaterialFromDefinition(module.materials.facade, textureLoader)
    : createColorMaterial("#E0E0E0", 0.4, 0.0);

  const internalMaterial = createColorMaterial("#8B4513", 0.7, 0.0);

  // Generate carcass
  if (module.carcass) {
    const carcassGeometry = generateCarcassGeometry(
      module.dimensions,
      module.carcass.thickness,
      module.carcass.backPanelThickness || 0.5,
      carcassMaterial,
    );
    meshes.push(...carcassGeometry);
  }

  // Generate internal structure based on type
  if (module.structure) {
    const carcassThickness = module.carcass?.thickness || 1.8;
    const internalWidth = module.dimensions.width - carcassThickness * 2;
    const internalDepth = module.dimensions.depth - carcassThickness;

    if (module.structure.type === "drawers") {
      const availableHeight = module.dimensions.height - carcassThickness * 2;
      const totalDrawerHeight = module.structure.drawerHeights.reduce((sum, h) => sum + h, 0);
      const totalGapHeight = FACADE_GAP * (module.structure.count - 1); // Зазоры только между ящиками
      const scaleFactor = (availableHeight - totalGapHeight) / totalDrawerHeight;

      let currentY = carcassThickness;

      for (let i = 0; i < module.structure.count; i++) {
        const scaledDrawerHeight = module.structure.drawerHeights[i] * scaleFactor;
        const isLastDrawer = i === module.structure.count - 1;
        // У последнего ящика нет зазора сверху, у остальных - есть
        const actualDrawerHeight = isLastDrawer 
          ? scaledDrawerHeight 
          : scaledDrawerHeight - FACADE_GAP;

        const drawerPos = new THREE.Vector3(
          0,
          currentY + actualDrawerHeight / 2,
          (module.dimensions.depth - module.structure.internalDepth) / 2,
        );

        meshes.push(
          generateDrawerGeometry(
            internalWidth,
            actualDrawerHeight,
            module.structure.internalDepth,
            drawerPos,
            internalMaterial,
          ),
        );

        // Добавляем масштабированную высоту ящика (для промежуточных - зазор учтен в actualDrawerHeight)
        currentY += scaledDrawerHeight;
        // Добавляем зазор после ящика (кроме последнего)
        if (!isLastDrawer) {
          currentY += FACADE_GAP;
        }
      }
    } else if (module.structure.type === "door-and-shelf") {
      // Generate shelves
      for (const shelf of module.structure.shelves) {
        const shelfPos = new THREE.Vector3(0, shelf.positionFromBottom, 0);

        meshes.push(
          generateShelfGeometry(
            internalWidth,
            internalDepth - 1,
            1,
            shelfPos,
            internalMaterial,
          ),
        );
      }

      // Generate door
      const doorWidth = internalWidth;
      const doorHeight = module.dimensions.height - carcassThickness * 2 - FACADE_GAP * 2;
      const doorDepth = 1.5;
      const doorPos = new THREE.Vector3(
        0,
        carcassThickness + doorHeight / 2,
        (module.dimensions.depth - doorDepth) / 2,
      );

      meshes.push(
        generateDoorGeometry(
          doorWidth,
          doorHeight,
          doorDepth,
          doorPos,
          facadeMaterial,
        ),
      );
    }
  }

  // Process children recursively
  const childGeometry: ModuleGeometryData[] = module.children.map((child) =>
    generateModuleGeometry(child, textureLoader),
  );

  return {
    id: module.id,
    type: module.type,
    mainMeshes: meshes,
    childMeshes: childGeometry,
  };
}

/**
 * Converts ModuleGeometryData to actual Three.js Mesh objects
 * @param geometryData - Module geometry data
 * @param position - Global position of module
 * @param rotation - Global rotation of module
 * @returns Group containing all meshes
 */
export function createMeshesFromGeometryData(
  geometryData: ModuleGeometryData,
  position: Position,
  rotation: Rotation,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `module-${geometryData.id}`;
  group.position.set(position.x, position.y, position.z);
  group.rotation.set(
    THREE.MathUtils.degToRad(rotation.x),
    THREE.MathUtils.degToRad(rotation.y),
    THREE.MathUtils.degToRad(rotation.z),
  );

  // Create main meshes
  for (const meshData of geometryData.mainMeshes) {
    const mesh = new THREE.Mesh(meshData.geometry, meshData.material);
    mesh.name = meshData.name;
    mesh.position.copy(meshData.position);
    mesh.rotation.copy(meshData.rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
  }

  // Create child meshes recursively
  for (const childData of geometryData.childMeshes) {
    const childGroup = createMeshesFromGeometryData(
      childData,
      { x: 0, y: 0, z: 0 }, // Children positions are relative
      { x: 0, y: 0, z: 0 },
    );
    group.add(childGroup);
  }

  return group;
}

/**
 * High-level function: Generate complete Three.js scene from RenderableModule array
 * @param modules - Array of RenderableModules
 * @param textureLoader - Optional texture loader
 * @returns Group containing all module meshes
 */
export function generateScene(
  modules: RenderableModule[],
  textureLoader?: THREE.TextureLoader,
): THREE.Group {
  const scene = new THREE.Group();
  scene.name = "kitchen-scene";

  for (const module of modules) {
    const geometryData = generateModuleGeometry(module, textureLoader);
    const moduleGroup = createMeshesFromGeometryData(
      geometryData,
      module.position,
      module.rotation,
    );
    scene.add(moduleGroup);
  }

  return scene;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Disposes of all geometries and materials in a group recursively
 * @param group - Three.js Group to dispose
 */
export function disposeGeometry(group: THREE.Group): void {
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => disposeMaterial(material));
        } else {
          disposeMaterial(object.material);
        }
      }
    }
  });
}

/**
 * Disposes of a material and its textures
 * @param material - Material to dispose
 */
function disposeMaterial(material: THREE.Material): void {
  if (material instanceof THREE.MeshStandardMaterial) {
    if (material.map) material.map.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.roughnessMap) material.roughnessMap.dispose();
  }
  material.dispose();
}

/**
 * Calculates bounding box for a group of modules
 * @param group - Three.js Group
 * @returns Bounding box
 */
export function calculateBoundingBox(group: THREE.Group): THREE.Box3 {
  const box = new THREE.Box3();
  box.setFromObject(group);
  return box;
}
