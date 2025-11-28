import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { agentTools } from "@/core/agent/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Request validation schema
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema),
});

/**
 * System prompt for the AI agent
 * Provides context and instructions for the kitchen design assistant
 */
const SYSTEM_PROMPT = `You are a kitchen designer AI assistant. Your PRIMARY GOAL is to generate kitchen configurations that will be rendered in 3D.

CRITICAL: When user asks to create/build/design a kitchen, you MUST complete this EXACT workflow:
ALWAYS CREATE A NEW KITCHEN CONFIG FOR EACH USER REQUEST!

STEP 1: Call getMaterialLibrary() to see available materials
STEP 2: Call getModuleLibrary() to see available cabinet types
STEP 3: Call getRoomTextures() to see room options
STEP 4: Create a complete KitchenConfig JSON object (see example below)
STEP 5: Call validateKitchenConfig(config) to validate your config
STEP 6: Call generateLayout(config) to generate 3D modules - THIS RETURNS RenderableModule[]
STEP 7: Call saveKitchenConfig(config, modules) to SAVE and RENDER the kitchen
STEP 8: Tell user what you created

WITHOUT STEP 7 (saveKitchenConfig), THE KITCHEN WILL NOT RENDER! You MUST call it!
ALWAYS RESPONSE WITH THE KITCHEN CONFIG JSON OBJECT!

EXAMPLE KitchenConfig (use this structure):
{
  "kitchenId": "kitchen-white-modern-2025",
  "name": "White Modern Kitchen",
  "style": "modern",
  "globalSettings": {
    "dimensions": {
      "height": 220,
      "countertopHeight": 90,
      "countertopDepth": 60,
      "countertopThickness": 2,
      "wallGap": 50,
      "baseCabinetHeight": 90,
      "wallCabinetHeight": 70,
      "wallCabinetDepth": 35,
      "plinthHeight": 12,
      "plinthDepth": 50
    },
    "rules": { "mismatchPolicy": "auto_fix", "gapBetweenModules": 0 }
  },
  "globalConstraints": {
    "modules": { "minWidth": 30, "maxWidth": 120 },
    "handles": { "minDistanceFromEdge": 5 }
  },
  "defaultMaterials": {
    "facade": "cabinet_blue.matte",
    "countertop": "quartz_grey",
    "handle": "minimalist_bar_black"
  },
  "layoutLines": [
    {
      "id": "main_wall",
      "name": "Main Wall",
      "length": 360,
      "direction": { "x": 1, "z": 0 },
      "modules": [
        {
          "id": "base-1",
          "type": "base",
          "width": 60,
          "positioning": { "anchor": "floor", "offset": { "y": 0 } },
          "handle": { "placement": { "type": "centered", "orientation": "horizontal" } }
        }
      ]
    }
  ],
  "hangingModules": []
}

YOUR JOB: Always complete ALL 7 STEPS to render the kitchen! Don't stop after step 3!`;

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

    // Stream the text generation with tools
    const result = streamText({
      model: openai("gpt-5-mini"), // Using gpt-4o for best tool calling
      messages,
      tools: agentTools,
      system: SYSTEM_PROMPT,
      onChunk: ({ chunk }) => {
        // Log tool calls for debugging (can be extended for analytics)
        if (chunk.type === "tool-call") {
          console.debug(`Tool called: ${chunk.toolName}`, chunk.input);
        }
        if (chunk.type === "tool-result") {
          console.debug(`Tool result: ${chunk.toolName}`);
          // Log config save results for tracking
          if (
            chunk.toolName === "saveKitchenConfig" &&
            "result" in chunk &&
            chunk.result
          ) {
            console.debug("Kitchen configuration saved:", chunk.result);
          }
        }
      },
      onError: ({ error }) => {
        // Log errors for monitoring
        console.error("Stream error:", error);
      },
    });

    // Return the streaming response with custom headers for config updates
    const response = result.toTextStreamResponse();
    response.headers.set("X-Stream-Type", "agent-response");
    return response;
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("API error:", error);

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
