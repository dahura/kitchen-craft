import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'tool-call' | 'tool-result' | 'error';
  text: string;
  timestamp: Date;
  toolName?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  error?: string;
}

export interface UseAIChatOptions {
  onMessageAdded?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  apiEndpoint?: string;
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
  apiEndpoint = '/api/agent',
}: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
          type: 'user',
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
              m.type === 'user' ||
              m.type === 'assistant' ||
              m.type === 'tool-result'
          )
          .concat(userMessage)
          .map((m) => ({
            role:
              m.type === 'user'
                ? 'user'
                : m.type === 'assistant'
                  ? 'assistant'
                  : 'tool',
            content: m.text,
          }));

        // Call API endpoint
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          throw new Error('No response body received');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
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
              type: 'assistant',
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
          // Update the message content with final streamed text
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.type === 'assistant') {
              lastMsg.text = assistantMessage;
            }
            return updated;
          });
        }

        setIsLoading(false);
      } catch (err) {
        // Handle errors (excluding abort errors)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Request was cancelled');
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);

        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'error',
          text: `Error: ${error.message}`,
          timestamp: new Date(),
          error: error.message,
        };
        addMessage(errorMessage);

        setIsLoading(false);
      }
    },
    [messages, addMessage, apiEndpoint, onError]
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

