'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { useAIChat } from '@/app/(app)/(designer)/hooks/useAIChat';
import { KitchenCard } from './kitchen-card';
import { KitchenSelectionBadge } from './kitchen-selection-badge';
import { kitchenOptions } from '@/core/agent/predefined-kitchens';

interface AIChatProps {
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onConversationUpdate?: (hasMessages: boolean) => void;
}

/**
 * AI Chat Component
 * Integrates with the AI agent API for real-time kitchen design conversations
 */
export const AIChat = ({
  onInputFocus,
  onInputBlur,
  isCollapsed = false,
  onToggleCollapse,
  onConversationUpdate,
}: AIChatProps) => {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, sendMessage, clearError } = useAIChat({
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Notify parent when conversation state changes
  useEffect(() => {
    onConversationUpdate?.(messages.length > 0);
  }, [messages, onConversationUpdate]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const message = chatInput;
    setChatInput('');

    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKitchenSelect = async (kitchenId: string) => {
    // Send selection message to agent
    await sendMessage(`I want ${kitchenId} or number ${kitchenOptions.findIndex(k => k.id === kitchenId) + 1}`);
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">
              Start a conversation to design your kitchen...
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.type === 'assistant' ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="ux-glass p-3 rounded-lg rounded-tl-none mb-3">
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                    {message.showKitchenCards && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-96 overflow-y-auto">
                        {kitchenOptions.map((kitchen, index) => (
                          <KitchenCard
                            key={kitchen.id}
                            kitchen={{ ...kitchen, index }}
                            onSelect={handleKitchenSelect}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : message.type === 'error' ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-destructive"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-lg rounded-tl-none flex-1 min-w-0">
                    <p className="text-sm text-destructive break-words">{message.error}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-none max-w-[80%]">
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                </div>
              )}
              {message.type === 'kitchen-selection' && message.kitchenSelection ? (
                <div className="flex justify-center">
                  <KitchenSelectionBadge
                    kitchenId={message.kitchenSelection.kitchenId}
                    kitchenName={message.kitchenSelection.kitchenName}
                  />
                </div>
              ) : null}
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Loader className="w-5 h-5 text-primary animate-spin" />
            </div>
            <div className="ux-glass p-3 rounded-lg rounded-tl-none">
              <p className="text-sm text-muted-foreground">
                AI is thinking...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border border-destructive/25 rounded mx-2 mb-2 flex items-center justify-between">
          <p className="text-sm text-destructive">{error.message}</p>
          <button
            onClick={clearError}
            className="text-destructive hover:text-destructive/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 border-t border-border/25">
        <div className="relative flex gap-2">
          <Input
            className="ux-glass-input bg-transparent opacity-50 text-base placeholder:text-foreground"
            placeholder="Describe your dream kitchen..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            variant="default"
            disabled={isLoading || !chatInput.trim()}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

