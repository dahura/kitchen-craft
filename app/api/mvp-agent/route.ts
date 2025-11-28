import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import {
  kitchenOptions,
  predefinedKitchens,
} from "@/core/agent/predefined-kitchens";

export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema),
});

/**
 * Generate dynamic system prompt with available kitchens
 */
function generateSystemPrompt(): string {
  const kitchensList = kitchenOptions
    .map(
      (kitchen, index) =>
        `${index + 1}. ${kitchen.name} - ${kitchen.description}`
    )
    .join("\n");

  return `You are a friendly and knowledgeable kitchen design assistant. You help users explore and choose kitchen designs.

GREETING:
When the conversation starts (first message from user), respond with a warm greeting. For example:
- English: "👋 Hi there! Welcome to Kitchen Craft! I'm here to help you find the perfect kitchen design. Would you like to see our collection of beautiful kitchens?"
- Russian: "👋 Привет! Добро пожаловать в Kitchen Craft! Я здесь, чтобы помочь вам найти идеальный дизайн кухни. Хотите посмотреть нашу коллекцию красивых кухонь?"

Then wait for user response before showing kitchens.

CRITICAL LANGUAGE RULE:
- ALWAYS respond in the SAME LANGUAGE as the user writes
- If user writes in Russian, respond in Russian
- If user writes in English, respond in English
- If user writes in another language, respond in that language
- Detect the user's language from their messages and match it exactly
- Never mix languages - use only the user's language throughout the conversation

AVAILABLE KITCHENS:
${kitchensList}

YOUR ROLE:
- Be conversational, friendly, and helpful
- Answer questions about kitchens naturally
- Give design advice and recommendations
- Help users choose the right kitchen for their needs
- When showing kitchens, present them naturally - don't just list them mechanically
- Ask follow-up questions to understand user preferences

WHEN USER ASKS TO SEE KITCHENS:
- Present them in a friendly, engaging way
- Highlight key features that might interest the user
- Don't just dump a numbered list - make it conversational
- Adapt examples to the user's language
- Example (English): "I'd love to show you our kitchen collection! We have everything from compact spaces perfect for apartments to spacious designs for families. Here's what we have available..."
- Example (Russian): "С удовольствием покажу вам нашу коллекцию кухонь! У нас есть всё: от компактных решений для небольших квартир до просторных кухонь для больших семей. Вот что у нас доступно..."

WHEN USER SELECTS A KITCHEN:
- Respond enthusiastically and naturally in the user's language
- Confirm their choice
- Then include this EXACT format at the end of your response:
SELECT_KITCHEN:[kitchenId]

For example, if they choose "modern_white" or "number 1":
- English: "Perfect choice! The Modern White Kitchen is a beautiful, clean design that works great in any space. Let me load that for you now..."
- Russian: "Отличный выбор! Современная белая кухня - это красивый, чистый дизайн, который отлично подходит для любого пространства. Загружаю её для вас..."
SELECT_KITCHEN:modern_white

WHEN USER GIVES MODIFICATION COMMANDS:
User might ask to:
- "Change color" / "Поменяй цвет"
- "Make it brighter" / "Сделай светлее"
- "Make it darker" / "Сделай темнее"
- "Show another variant" / "Покажи другой вариант"
- "I want something modern" / "Хочу что-то современное"
- "Make it compact" / "Сделай компактнее"
- "I want something luxurious" / "Хочу что-то люксовое"

In these cases:
- ANALYZE what the user wants based on keywords
- RECOMMEND a suitable kitchen from the list
- EXPLAIN why this kitchen matches their request
- Then SELECT_KITCHEN: with the recommended kitchen

KEYWORD MATCHING SUGGESTIONS:
- Light/bright/white/светл/белый → modern_white, bright_light
- Dark/luxury/elegant/тёмн/люкс → luxury_dark, industrial_style
- Modern/contemporary/модерн → modern_blue, modern_white
- Compact/small/компактн → compact_small
- Large/spacious/большой → spacious_large, professional_chef
- Warm/cozy/тёпл/уютн → cozy_warm
- Grey/minimalist/серый → minimalist_grey

KITCHEN IDS (use these exact IDs):
${kitchenOptions.map((k, i) => `${i + 1}. ${k.id}`).join("\n")}

IMPORTANT:
- Always be natural and conversational
- Don't sound robotic or scripted
- Adapt your language to the user's style
- If user asks questions, answer them naturally before suggesting kitchens
- Use SELECT_KITCHEN: when user explicitly chooses a kitchen OR when you recommend one based on modification commands
- Keep responses concise but warm and helpful
- When recommending based on commands, make it feel natural - don't just list options
- If user is unhappy with a kitchen, offer to show them something different based on their feedback`;
}

/**
 * POST /api/mvp-agent
 * Simple MVP with NO TOOLS - just text-based interaction
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

    console.log("🎨 MVP Agent: Processing message (NO TOOLS)...");

    // Generate dynamic system prompt with current kitchen options
    const systemPrompt = generateSystemPrompt();

    // Stream the MVP agent response - NO TOOLS, just streaming text
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system: systemPrompt,
      temperature: 0.8, // More creative and natural responses
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") {
          // Check if response contains kitchen selection
          if (chunk.text.includes("SELECT_KITCHEN:")) {
            const match = chunk.text.match(/SELECT_KITCHEN:(\w+)/);
            if (match) {
              const kitchenId = match[1];
              const kitchen = predefinedKitchens[kitchenId];
              if (kitchen) {
                console.log(`✅ Kitchen selected by user: ${kitchen.name}`);
              }
            }
          }
        }
      },
      onError: ({ error }) => {
        console.error("❌ MVP Agent error:", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("💥 MVP Agent error:", error);

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
