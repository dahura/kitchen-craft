"use client";

import { Chat } from "@/components/panels/chat/chat";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, Activity } from "react";

export const ChatPanel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setIsCollapsed(false); // Expand when focused
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // Auto-collapse after 3 seconds of no focus
    collapseTimeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 mb-4",
        isCollapsed ? "mb-4" : "mb-16"
      )}
    >
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          isCollapsed ? "max-h-12" : "max-h-80"
        )}
      >
        <Chat
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
    </div>
  );
};
