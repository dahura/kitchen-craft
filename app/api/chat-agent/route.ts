import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { buildKitchen } from "@/core/agent/builder-agent";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Request validation schema
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema),
});

/**
 * Chat Agent System Prompt
 * Communicates with users and delegates kitchen building
 */
const CHAT_AGENT_PROMPT = `You are a friendly kitchen design assistant. 

Your role:
1. Chat with users about their kitchen preferences
2. Ask clarifying questions if needed (style, colors, size, layout)
3. When user wants to create/build a kitchen, extract their requirements
4. Call the buildKitchen tool with their requirements
5. Show them the result

Be conversational and helpful. Don't use tools yourself - only call buildKitchen when ready.`;

/**
 * Tool for Chat Agent to call Builder Agent
 */
const buildKitchenTool = tool({
  description: "Build a kitchen based on user requirements. Call this when user wants to create/design a kitchen.",
  inputSchema: z.object({
    requirements: z.string().describe("User's kitchen requirements (style, colors, modules, etc.)"),
  }),
  execute: async ({ requirements }) => {
    console.log("🎨 Chat Agent: Calling Builder Agent...");
    const result = await buildKitchen(requirements);
    
    if (result.success) {
      return {
        success: true,
        message: `Kitchen created successfully! ConfigID: ${result.configId}. ${result.message}`,
        configId: result.configId,
      };
    } else {
      return {
        success: false,
        error: result.error,
        message: result.message,
      };
    }
  },
});

const chatAgentTools = {
  buildKitchen: buildKitchenTool,
};

/**
 * POST /api/chat-agent
 * Two-agent system: Chat Agent (user-facing) + Builder Agent (kitchen creation)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          details: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = validationResult.data;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Messages array cannot be empty",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("💬 Chat Agent: Processing user message...");

    // Stream the chat agent response
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      tools: chatAgentTools,
      system: CHAT_AGENT_PROMPT,
      onChunk: ({ chunk }) => {
        if (chunk.type === "tool-call") {
          console.log(`🔧 Chat Agent calling: ${chunk.toolName}`);
        }
        if (chunk.type === "tool-result") {
          console.log(`✅ Tool result:`, chunk.result);
        }
      },
      onError: ({ error }) => {
        console.error("❌ Chat Agent error:", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("💥 API error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

