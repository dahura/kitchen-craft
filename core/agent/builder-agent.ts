import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { agentTools } from "@/core/agent/tools";
import type { KitchenConfig } from "@/core/types";

/**
 * Builder Agent - Creates kitchen configurations using tools
 * This agent is called internally and doesn't chat with users
 */
export async function buildKitchen(userRequirements: string): Promise<{
  success: boolean;
  configId?: string;
  config?: KitchenConfig;
  message?: string;
  error?: string;
}> {
  try {
    console.log("🏗️ Builder Agent: Starting kitchen build...");
    console.log("📋 Requirements:", userRequirements);

    const result = await generateText({
      model: openai("gpt-4o"),
      tools: agentTools,
      system: `You are a kitchen building agent. Your ONLY job is to build a kitchen based on requirements.

REQUIREMENTS: ${userRequirements}

WORKFLOW (DO ALL STEPS):
1. Call getMaterialLibrary() 
2. Call getModuleLibrary()
3. Call getRoomTextures()
4. Create KitchenConfig JSON matching requirements
5. Call validateKitchenConfig(config)
6. Call generateLayout(config)
7. Call saveKitchenConfig(config, modules) - MUST DO THIS!

Return a brief confirmation message with the configId when done.`,
      prompt: `Build a kitchen with these requirements: ${userRequirements}`,
    });

    console.log("✅ Builder Agent: Kitchen built!");
    console.log("📄 Result:", result.text);

    // Extract configId from response
    const configIdMatch = result.text.match(/kitchen-\d+-[a-z0-9]+/);

    if (configIdMatch) {
      return {
        success: true,
        configId: configIdMatch[0],
        message: result.text,
      };
    }

    return {
      success: false,
      error: "Kitchen was created but configId not found in response",
      message: result.text,
    };
  } catch (error) {
    console.error("❌ Builder Agent error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
