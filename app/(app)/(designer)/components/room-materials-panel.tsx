// components/room-materials-panel.tsx
"use client";
import { useState } from "react";
import { useRoomMaterialsManager } from "../hooks/useRoomMaterials";
import { roomMaterialPresets } from "../../../lib/store/room-materials-store";
import { getAvailableRoomTextures } from "../../../../core/libraries/room-texture-library";

export const RoomMaterialsPanel = () => {
  const {
    roomMaterials,
    setSurfaceColor,
    setSurfaceTexture,
    updateMaterialProperties,
    applyPreset,
  } = useRoomMaterialsManager();
  const [activeSurface, setActiveSurface] = useState<
    "walls" | "floor" | "ceiling"
  >("walls");

  const currentMaterial = roomMaterials[activeSurface];
  const availableTextures = getAvailableRoomTextures(
    activeSurface === "ceiling"
      ? "ceilings"
      : activeSurface === "walls"
        ? "walls"
        : "floors",
  );

  const handleColorChange = (color: string) => {
    setSurfaceColor(activeSurface, color);
  };

  const handleTextureChange = (textureId: string) => {
    setSurfaceTexture(activeSurface, textureId);
  };

  const handlePropertyChange = (
    property: "roughness" | "metalness" | "scale",
    value: number,
  ) => {
    updateMaterialProperties(activeSurface, { [property]: value });
  };

  const handlePresetChange = (presetName: keyof typeof roomMaterialPresets) => {
    applyPreset(roomMaterialPresets[presetName]);
  };

  return (
    <div
      className="room-materials-panel"
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(255, 255, 255, 0.95)",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        width: "300px",
        zIndex: 1000,
      }}
    >
      <h3
        style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "bold" }}
      >
        Материалы комнаты
      </h3>

      {/* Выбор поверхности */}
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Поверхность:
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          {(["walls", "floor", "ceiling"] as const).map((surface) => (
            <button
              type="button"
              id={`surface-${surface}`}
              key={surface}
              onClick={() => setActiveSurface(surface)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: activeSurface === surface ? "#007bff" : "#fff",
                color: activeSurface === surface ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {surface === "walls"
                ? "Стены"
                : surface === "floor"
                  ? "Пол"
                  : "Потолок"}
            </button>
          ))}
        </div>
      </div>

      {/* Тип материала */}
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Тип материала:
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            type="button"
            id="material-color"
            onClick={() => handleColorChange("#FFFFFF")}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: currentMaterial.type === "color" ? "#007bff" : "#fff",
              color: currentMaterial.type === "color" ? "#fff" : "#333",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Цвет
          </button>
          <button
            type="button"
            id="material-texture"
            onClick={() =>
              availableTextures.length > 0 &&
              handleTextureChange(availableTextures[0])
            }
            disabled={availableTextures.length === 0}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background:
                currentMaterial.type === "texture" ? "#007bff" : "#fff",
              color: currentMaterial.type === "texture" ? "#fff" : "#333",
              cursor: availableTextures.length > 0 ? "pointer" : "not-allowed",
              fontSize: "12px",
              opacity: availableTextures.length > 0 ? 1 : 0.5,
            }}
          >
            Текстура
          </button>
        </div>
      </div>

      {/* Выбор цвета */}
      {currentMaterial.type === "color" && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor={`color-${activeSurface}`}
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Цвет:
          </label>
          <input
            id={`color-${activeSurface}`}
            type="color"
            value={currentMaterial.value as string}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {/* Выбор текстуры */}
      {currentMaterial.type === "texture" && availableTextures.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor={`texture-${activeSurface}`}
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Текстура:
          </label>
          <select
            id={`texture-${activeSurface}`}
            value={currentMaterial.value as string}
            onChange={(e) => handleTextureChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {availableTextures.map((textureId) => (
              <option key={textureId} value={textureId}>
                {textureId
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Свойства материала */}
      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor={`roughness-${activeSurface}`}
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Шероховатость: {currentMaterial.roughness?.toFixed(2)}
        </label>
        <input
          id={`roughness-${activeSurface}`}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentMaterial.roughness || 0.8}
          onChange={(e) =>
            handlePropertyChange("roughness", parseFloat(e.target.value))
          }
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          htmlFor={`metalness-${activeSurface}`}
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Металличность: {currentMaterial.metalness?.toFixed(2)}
        </label>
        <input
          id={`metalness-${activeSurface}`}
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentMaterial.metalness || 0}
          onChange={(e) =>
            handlePropertyChange("metalness", parseFloat(e.target.value))
          }
          style={{ width: "100%" }}
        />
      </div>

      {currentMaterial.type === "texture" && (
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor={`scale-${activeSurface}`}
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Масштаб: {currentMaterial.scale?.toFixed(1)}
          </label>
          <input
            id={`scale-${activeSurface}`}
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={currentMaterial.scale || 1}
            onChange={(e) =>
              handlePropertyChange("scale", parseFloat(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* Предустановки */}
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Предустановки:
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            type="button"
            id="preset-modern"
            onClick={() => handlePresetChange("modern")}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
              color: "#333",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Современный
          </button>
          <button
            type="button"
            id="preset-industrial"
            onClick={() => handlePresetChange("industrial")}
            style={{
              padding: "6px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fff",
              color: "#333",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Индустриальный
          </button>
        </div>
      </div>
    </div>
  );
};
