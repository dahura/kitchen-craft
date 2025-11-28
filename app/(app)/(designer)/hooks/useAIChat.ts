import { useState, useCallback, useRef } from "react";
import { useKitchenStore } from "@/app/lib/store/kitchen-store";
import type { KitchenConfig, RenderableModule } from "@/core/types";

export interface ChatMessage {
  id: string;
  type:
    | "user"
    | "assistant"
    | "tool-call"
    | "tool-result"
    | "error"
    | "kitchen-selection";
  text: string;
  timestamp: Date;
  toolName?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  error?: string;
  showKitchenCards?: boolean; // Flag to show kitchen selection cards
  kitchenSelection?: {
    // Kitchen selection from SELECT_KITCHEN: tag
    kitchenId: string;
    kitchenName: string;
  };
}

export interface UseAIChatOptions {
  onMessageAdded?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  apiEndpoint?: string;
  onConfigGenerated?: (
    config: KitchenConfig,
    modules: RenderableModule[]
  ) => void;
}

/**
 * Hook to manage AI chat interactions with the Kitchen-Craft agent
 *
 * Features:
 * - Send messages to AI agent API
 * - Stream responses in real-time
 * - Handle tool execution results
 * - Manage chat history
 * - Loading and error states
 */
export function useAIChat({
  onMessageAdded,
  onError,
  apiEndpoint = "/api/mvp-agent", // Use MVP agent
  onConfigGenerated,
}: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const kitchenStore = useKitchenStore();

  /**
   * Add a message to the chat history
   */
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      onMessageAdded?.(message);
    },
    [onMessageAdded]
  );

  /**
   * Extract and apply kitchen configuration from AI response
   * Looks for configId in the response and fetches the config
   */
  const tryApplyConfigFromResponse = useCallback(
    async (text: string) => {
      try {
        // Look for configId pattern in the response
        // Pattern: "kitchen-1234567890-abc123def"
        const configIdMatch = text.match(/kitchen-\d+-[a-z0-9]+/);
        if (configIdMatch) {
          const configId = configIdMatch[0];
          console.log(`Found configuration ID: ${configId}`);

          // Fetch the configuration from the API
          const response = await fetch(
            `/api/kitchen-config?id=${encodeURIComponent(configId)}`
          );

          if (response.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (await response.json()) as any;
            const config = data.config as KitchenConfig;
            const modules = data.modules as RenderableModule[];

            // Load the configuration into the kitchen store
            kitchenStore.loadConfig(config);
            onConfigGenerated?.(config, modules);

            console.log("Kitchen configuration applied from API");
          } else {
            console.warn("Failed to fetch kitchen configuration");
          }
        }
      } catch (err) {
        // Silently ignore parsing errors - not all AI responses contain config
        console.debug("Could not extract config from response:", err);
      }
    },
    [kitchenStore, onConfigGenerated]
  );

  /**
   * Send a message to the AI agent
   */
  const sendMessage = useCallback(
    async (text: string) => {
      try {
        // Reset error state
        setError(null);

        // Add user message to chat
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "user",
          text,
          timestamp: new Date(),
        };
        addMessage(userMessage);

        // Set loading state
        setIsLoading(true);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Prepare API request with full message history
        const apiMessages = messages
          .filter(
            (m) =>
              m.type === "user" ||
              m.type === "assistant" ||
              m.type === "tool-result"
          )
          .concat(userMessage)
          .map((m) => ({
            role:
              m.type === "user"
                ? "user"
                : m.type === "assistant"
                ? "assistant"
                : "tool",
            content: m.text,
          }));

        // Call API endpoint
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `API error: ${response.status} ${response.statusText}`
          );
        }

        // Handle streaming response
        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";
        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode chunk
          const text = decoder.decode(value, { stream: true });

          // Create or update assistant message on first chunk
          if (isFirstChunk && text.trim()) {
            assistantMessage = text;
            const assistantMsg: ChatMessage = {
              id: Date.now().toString(),
              type: "assistant",
              text: assistantMessage,
              timestamp: new Date(),
            };
            addMessage(assistantMsg);
            isFirstChunk = false;
          } else if (!isFirstChunk && text.trim()) {
            // Append to existing assistant message
            assistantMessage += text;
            // In a real implementation, you might want to emit a streaming update
            // For now, we'll update the message after streaming is complete
          }
        }

        // Update final assistant message if content was received
        if (!isFirstChunk && assistantMessage) {
          // Check if response suggests showing kitchens (before SELECT_KITCHEN)
          const shouldShowKitchenCards =
            !assistantMessage.includes("SELECT_KITCHEN:") &&
            (assistantMessage.toLowerCase().includes("kitchen") ||
              assistantMessage.toLowerCase().includes("кухн") ||
              assistantMessage.toLowerCase().includes("option") ||
              assistantMessage.toLowerCase().includes("available") ||
              assistantMessage.toLowerCase().includes("выбор") ||
              /(here|вот|доступн|есть|показ)/i.test(assistantMessage));

          // Update the message content with final streamed text
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.type === "assistant") {
              lastMsg.text = assistantMessage;
              lastMsg.showKitchenCards = shouldShowKitchenCards;
            }
            return updated;
          });

          // Check if user selected a kitchen via SELECT_KITCHEN: tag
          const kitchenMatch = assistantMessage.match(/SELECT_KITCHEN:(\w+)/);
          if (kitchenMatch) {
            const kitchenId = kitchenMatch[1];
            console.log(`🎨 Kitchen selected from response: ${kitchenId}`);

            // Try to load the kitchen config
            try {
              // Import predefined kitchens
              const { predefinedKitchens } = await import(
                "@/core/agent/predefined-kitchens"
              );
              const kitchen = predefinedKitchens[kitchenId];

              if (kitchen) {
                console.log(`✅ Loading kitchen: ${kitchen.name}`);
                console.log(`📋 Config structure:`, {
                  kitchenId: kitchen.config.kitchenId,
                  layoutLinesCount: kitchen.config.layoutLines.length,
                  firstModuleType:
                    kitchen.config.layoutLines[0]?.modules[0]?.type,
                });
                // Load config into store
                kitchenStore.loadConfig(kitchen.config);
                onConfigGenerated?.(kitchen.config, []);

                // Add kitchen selection badge message
                const selectionMsg: ChatMessage = {
                  id: Date.now().toString() + "-selection",
                  type: "kitchen-selection",
                  text: `Selected: ${kitchen.name}`,
                  timestamp: new Date(),
                  kitchenSelection: {
                    kitchenId,
                    kitchenName: kitchen.name,
                  },
                };
                addMessage(selectionMsg);
              } else {
                console.warn(`Kitchen not found: ${kitchenId}`);
                console.warn(
                  `Available kitchens:`,
                  Object.keys(predefinedKitchens)
                );
              }
            } catch (err) {
              console.error("Error loading kitchen:", err);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        // Handle errors (excluding abort errors)
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Request was cancelled");
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);

        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "error",
          text: `Error: ${error.message}`,
          timestamp: new Date(),
          error: error.message,
        };
        addMessage(errorMessage);

        setIsLoading(false);
      }
    },
    [messages, addMessage, apiEndpoint, onError, tryApplyConfigFromResponse]
  );

  /**
   * Cancel the current request
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  /**
   * Clear chat history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancel,
    clearMessages,
    clearError,
    addMessage,
  };
}
