// validationEngine.ts

import type {
  GlobalConstraints,
  KitchenConfig,
  ModuleConfig,
  ModuleLibrary,
  ValidationResult,
} from "../../types";

/**
 * Проверяет и исправляет конфигурацию кухни.
 * @param config - Исходная конфигурация кухни
 * @param constraints - Глобальные ограничения
 * @param moduleLib - Библиотека модулей с их ограничениями
 * @returns Объект с результатом валидации
 */
export function validateAndFix(
  config: KitchenConfig,
  _constraints: GlobalConstraints,
  moduleLib: ModuleLibrary,
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  // Глубокое копирование для иммутабельности
  const fixedConfig: KitchenConfig = JSON.parse(JSON.stringify(config));

  // 1. Валидация модулей на линиях
  for (const line of fixedConfig.layoutLines) {
    let totalWidth = 0;
    const autoModules: ModuleConfig[] = [];

    for (const module of line.modules) {
      const moduleConstraints =
        moduleLib[module.type]?.variants[module.variant || "default"];
      if (moduleConstraints) {
        if (
          typeof module.width === "number" &&
          module.width < moduleConstraints.minWidth
        ) {
          warnings.push(`Module ${module.id} width clamped to min value.`);
          module.width = moduleConstraints.minWidth;
        }
        if (
          typeof module.width === "number" &&
          module.width > moduleConstraints.maxWidth
        ) {
          warnings.push(`Module ${module.id} width clamped to max value.`);
          module.width = moduleConstraints.maxWidth;
        }
      }
      totalWidth += typeof module.width === "number" ? module.width : 0;
      if (module.width === "auto") {
        autoModules.push(module);
      }
    }

    if (totalWidth > line.length) {
      if (config.globalSettings.rules.mismatchPolicy === "error") {
        errors.push(`Total width on line ${line.id} exceeds line length.`);
      } else {
        warnings.push(`Overflow on line ${line.id}. Auto-fixing...`);
        const excessWidth = totalWidth - line.length;
        if (autoModules.length > 0) {
          const reductionPerModule = excessWidth / autoModules.length;
          autoModules.forEach((m) => {
            // Добавляем finalWidth для использования в LayoutEngine
            (m as ModuleConfig & { finalWidth: number }).finalWidth =
              (m.width as number) - reductionPerModule;
          });
        } else {
          errors.push(
            `Cannot fix overflow on line ${line.id}: no 'auto' modules to shrink.`,
          );
        }
      }
    }
  }

  // 2. Валидация hangingModules
  const originalHangingModules = fixedConfig.hangingModules;
  fixedConfig.hangingModules = originalHangingModules.filter(
    (hangingModule) => {
      const baseExists = fixedConfig.layoutLines.some((line) =>
        line.modules.some(
          (m) => m.id === hangingModule.positioning.alignWithModule,
        ),
      );
      if (!baseExists) {
        warnings.push(
          `Hanging module ${hangingModule.id} has no valid base module. Removing.`,
        );
        return false; // Удаляем из массива
      }
      return true;
    },
  );

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    fixedConfig,
  };
}
