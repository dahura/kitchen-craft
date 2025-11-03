// room-texture-library.ts
import type { RoomTextureLibrary } from "../../types";

export const roomTextureLibrary: RoomTextureLibrary = {
  walls: {
    "white-plaster": {
      diffuse: "/textures/rooms/walls/white-plaster/diffuse.jpg",
      normal: "/textures/rooms/walls/white-plaster/normal.exr",
      roughness: "/textures/rooms/walls/white-plaster/roughness.jpg",
      displacement: "/textures/rooms/walls/white-plaster/displacement.jpg",
    },
  },
  floors: {
    "white-plaster": {
      diffuse: "/textures/rooms/floors/white-plaster/diffuse.jpg",
      normal: "/textures/rooms/floors/white-plaster/normal.exr",
      roughness: "/textures/rooms/floors/white-plaster/roughness.jpg",
      displacement: "/textures/rooms/floors/white-plaster/displacement.jpg",
    },
  },
  ceilings: {
    // В будущем можно добавить текстуры для потолков
    // "white-paint": {
    //   diffuse: "/textures/rooms/ceilings/white-paint/diffuse.jpg",
    //   normal: "/textures/rooms/ceilings/white-paint/normal.jpg",
    //   roughness: "/textures/rooms/ceilings/white-paint/roughness.jpg",
    // },
  },
};

// Утилиты для работы с библиотекой
export const getRoomTextureSet = (
  surface: "walls" | "floors" | "ceilings",
  textureId: string,
) => {
  return roomTextureLibrary[surface]?.[textureId];
};

export const getAvailableRoomTextures = (
  surface: "walls" | "floors" | "ceilings",
) => {
  return Object.keys(roomTextureLibrary[surface] || {});
};

// Проверка доступности текстуры
export const isRoomTextureAvailable = (
  surface: "walls" | "floors" | "ceilings",
  textureId: string,
) => {
  return !!roomTextureLibrary[surface]?.[textureId];
};
