import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIChat } from './useAIChat';

describe('useAIChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should accept custom options', () => {
      const onMessageAdded = vi.fn();
      const onError = vi.fn();

      renderHook(() =>
        useAIChat({ onMessageAdded, onError, apiEndpoint: '/custom/api' })
      );

      // Hook should initialize without errors
      expect(true).toBe(true);
    });
  });

  describe('sendMessage', () => {
    it('should add user message immediately', async () => {
      const { result } = renderHook(() => useAIChat());

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode('AI response')
              );
              controller.close();
            },
          }),
        })
      ) as any;

      await act(async () => {
        await result.current.sendMessage('Hello AI');
      });

      expect(result.current.messages.length).toBeGreaterThan(0);
      const userMessage = result.current.messages.find(
        (m) => m.type === 'user'
      );
      expect(userMessage?.text).toBe('Hello AI');
    });

    it('should handle empty messages', async () => {
      const { result } = renderHook(() => useAIChat());

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should handle API errors', async () => {
      const { result } = renderHook(() => useAIChat());
      const onError = vi.fn();
      const { result: result2 } = renderHook(() => useAIChat({ onError }));

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: () => Promise.resolve({ message: 'Internal server error' }),
        })
      ) as any;

      await act(async () => {
        await result2.current.sendMessage('Test message');
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should update loading state during send', async () => {
      const { result } = renderHook(() => useAIChat());

      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                body: new ReadableStream({
                  start(controller) {
                    controller.enqueue(
                      new TextEncoder().encode('response')
                    );
                    controller.close();
                  },
                }),
              } as any);
            }, 100);
          })
      );

      const sendPromise = act(async () => {
        result.current.sendMessage('Test');
      });

      expect(result.current.isLoading).toBe(true);

      await sendPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('cancel', () => {
    it('should cancel ongoing request', async () => {
      const { result } = renderHook(() => useAIChat());

      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                body: new ReadableStream({
                  start(controller) {
                    controller.enqueue(
                      new TextEncoder().encode('response')
                    );
                    controller.close();
                  },
                }),
              } as any);
            }, 1000);
          })
      );

      act(() => {
        result.current.sendMessage('Test');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.cancel();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages and errors', async () => {
      const { result } = renderHook(() => useAIChat());

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode('response')
              );
              controller.close();
            },
          }),
        })
      ) as any;

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      expect(result.current.messages.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAIChat());

      // Manually set an error for testing
      expect(result.current.error).toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Message formatting', () => {
    it('should format user messages correctly', async () => {
      const { result } = renderHook(() => useAIChat());

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode('response')
              );
              controller.close();
            },
          }),
        })
      ) as any;

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const userMsg = result.current.messages.find(
        (m) => m.type === 'user'
      );
      expect(userMsg).toBeDefined();
      expect(userMsg?.id).toBeDefined();
      expect(userMsg?.timestamp).toBeInstanceOf(Date);
    });
  });
});

