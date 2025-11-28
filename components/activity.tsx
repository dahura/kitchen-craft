"use client";

import React, { ReactNode, useEffect, useRef } from "react";

interface ActivityProps {
  children: ReactNode;
  mode: "visible" | "hidden" | "skip";
}

/**
 * Activity Component - Полифилл для React 19.2+ Activity
 *
 * Управляет видимостью элементов без размонтирования из DOM,
 * позволяя CSS анимациям завершиться перед скрытием.
 *
 * @param mode - "visible" (показать), "hidden" (скрыть, но в DOM), "skip" (не влияет)
 */
export const Activity = ({ children, mode }: ActivityProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Очищаем предыдущий таймер
    if (hiddenTimeoutRef.current) {
      clearTimeout(hiddenTimeoutRef.current);
    }

    if (mode === "visible") {
      // Показываем элемент сразу
      container.setAttribute("data-activity-mode", "visible");
      container.style.visibility = "visible";
      container.style.pointerEvents = "auto";
      container.removeAttribute("aria-hidden");
    } else if (mode === "hidden") {
      // Скрываем элемент, но сохраняем в DOM для анимации
      container.setAttribute("data-activity-mode", "hidden");
      container.setAttribute("aria-hidden", "true");

      // Даем время на выполнение CSS анимации (500ms совпадает с duration-500)
      // затем скрываем элемент полностью
      hiddenTimeoutRef.current = setTimeout(() => {
        if (container) {
          container.style.visibility = "hidden";
          container.style.pointerEvents = "none";
        }
      }, 500);
    } else if (mode === "skip") {
      // Не влияем на элемент
      container.removeAttribute("data-activity-mode");
      container.style.visibility = "";
      container.style.pointerEvents = "";
      container.removeAttribute("aria-hidden");
    }

    return () => {
      if (hiddenTimeoutRef.current) {
        clearTimeout(hiddenTimeoutRef.current);
      }
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      data-activity-mode={mode}
      style={{
        visibility:
          mode === "visible"
            ? "visible"
            : mode === "hidden"
            ? "hidden"
            : undefined,
        pointerEvents:
          mode === "visible" ? "auto" : mode === "hidden" ? "none" : undefined,
      }}
    >
      {children}
    </div>
  );
};
