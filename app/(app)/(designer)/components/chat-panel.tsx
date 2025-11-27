"use client";

import { AIChat } from "@/components/panels/chat/ai-chat";
import { Controls } from "@/components/panels/controls/controls";
import { Activity } from "@/components/activity";
import { useState, useEffect, useRef } from "react";

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
    <>
      <Activity mode={isCollapsed ? "hidden" : "visible"}>
        {/* Full expanded view */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 overflow-hidden">
          <div
            className="ux-glass rounded-xl flex flex-col relative transition-all duration-500 ease-in-out origin-bottom"
            style={{
              transform: isCollapsed ? "scaleY(0)" : "scaleY(1)",
              opacity: isCollapsed ? 0 : 1,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/25">
              <h3 className="text-sm font-medium">AI Kitchen Assistant</h3>
              <button
                onClick={() => setIsCollapsed(true)}
                className="h-6 w-6 p-0 hover:bg-primary/20 rounded flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Chat content */}
            <AIChat
              onInputFocus={handleInputFocus}
              onInputBlur={handleInputBlur}
              isCollapsed={false}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </div>
      </Activity>

      {/* Controls with chat button integrated */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Activity mode={isCollapsed ? "visible" : "hidden"}>
          <Controls onChatToggle={() => setIsCollapsed(false)} />
        </Activity>
      </div>
    </>
  );
};
