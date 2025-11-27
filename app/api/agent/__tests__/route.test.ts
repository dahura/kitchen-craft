import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';

/**
 * Test suite for the AI Agent API endpoint
 */
describe('POST /api/agent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should reject request without messages array', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid request format');
    });

    it('should reject request with empty messages array', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('cannot be empty');
    });

    it('should reject messages with invalid schema', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'invalid-role',
              content: 'Hello',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should accept valid request with messages', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'What materials are available?',
            },
          ],
        }),
      });

      const response = await POST(req);
      // Should not return 400 (validation error)
      expect(response.status).not.toBe(400);
    });
  });

  describe('Message Schema Validation', () => {
    it('should accept user messages', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Design a modern kitchen',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).not.toBe(400);
    });

    it('should accept assistant messages', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'assistant',
              content: 'I can help with that',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).not.toBe(400);
    });

    it('should accept system messages', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a kitchen designer',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).not.toBe(400);
    });

    it('should accept multiple messages', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'What materials are available?',
            },
            {
              role: 'assistant',
              content: 'We have wood, concrete, and quartz',
            },
            {
              role: 'user',
              content: 'Show me concrete options',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).not.toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(req);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Internal server error');
    });
  });

  describe('Response Format', () => {
    it('should return a streaming response', async () => {
      const req = new Request('http://localhost:3000/api/agent', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Get material library',
            },
          ],
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
    });
  });
});

