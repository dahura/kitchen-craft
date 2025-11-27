import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { agentTools } from '@/core/agent/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Request validation schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema),
});

/**
 * System prompt for the AI agent
 * Provides context and instructions for the kitchen design assistant
 */
const SYSTEM_PROMPT = `You are an expert kitchen designer AI assistant powered by Kitchen-Craft.

Your role is to:
1. Help users design and visualize kitchen layouts
2. Recommend materials, modules, and textures from available libraries
3. Validate kitchen configurations using the validation engine
4. Generate 3D-ready layouts from configurations
5. Answer questions about kitchen design best practices

Available capabilities:
- Access material libraries (facades, countertops, handles)
- Browse module/cabinet types and variants
- View room texture options
- Validate kitchen configurations for design errors
- Generate 3D layouts from valid configurations

When a user requests kitchen design modifications:
1. First get the relevant library data (materials, modules)
2. Validate their configuration
3. Generate the layout for preview
4. Explain the design choices

Be helpful, creative, and provide specific recommendations based on available materials and modules.`;

/**
 * POST /api/agent
 * Handles chat messages and routes them through the AI agent with tools
 *
 * Request body:
 * - messages: Array of message objects with role and content
 *
 * Response:
 * - Streaming text response with tool execution results
 */
export async function POST(req: Request) {
  try {
    // Parse and validate request
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request format',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { messages } = validationResult.data;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Messages array cannot be empty',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Stream the text generation with tools
    const result = streamText({
      model: openai('gpt-4o'), // Using gpt-4o for better tool calling
      messages,
      tools: agentTools,
      system: SYSTEM_PROMPT,
      // Configuration for tool execution
      maxSteps: 10, // Allow up to 10 tool calls per request
      onChunk: ({ chunk }) => {
        // Log tool calls for debugging (can be extended for analytics)
        if (chunk.type === 'tool-call') {
          console.debug(`Tool called: ${chunk.toolName}`, chunk.args);
        }
        if (chunk.type === 'tool-result') {
          console.debug(`Tool result: ${chunk.toolName}`);
        }
      },
      onError: ({ error }) => {
        // Log errors for monitoring
        console.error('Stream error:', error);
      },
      // Retry configuration for tool execution failures
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
